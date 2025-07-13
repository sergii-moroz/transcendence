# ELK Stack Documentation (Elasticsearch 9 · Logstash 9 · Kibana 9)

> **Purpose** – This guide describes the local log‑management environment that ships with the *ft\_transcendence* project.  It explains how to build, run, and troubleshoot the ELK stack plus its surrounding observability components (Filebeat, Prometheus, Grafana, …).  The target audience is developers and DevOps engineers who run the project on laptops or CI runners.

---

## 1  Architecture Overview

```
┌─────────────┐  filestream/Beats  ┌───────────┐   bulk HTTP   ┌────────┐
│ Docker      │ ────────────────▶ │ Filebeat  │ ─────────────▶ │Elastic │
│ daemon      │                  └───────────┘               │Search │
└─────────────┘                         ▲                      └────────┘
                                        │ _cat / API
                                        ▼
                                   Kibana 9.0.3
```

* **Filebeat 9** tails every container’s `*-json.log` via `filestream` autodiscovery.
* **Logstash 9** receives Beats traffic on 5044 and pushes documents to Elasticsearch on 9200.
* **Kibana 9** consumes the cluster, imports saved dashboards from `ft_saved.ndjson`.
* **Prometheus + Grafana** scrape cAdvisor, Node‑Exporter, and k6 for metrics.

---

## 2  Repository Layout

```
kabana/
├─ docker-compose.yml        ← main manifest
├─ Makefile                  ← make up / make down / make logs
└─ srcs/services/
   ├─ observability/
   │   ├─ logstash/logstash.conf
   │   ├─ filebeat/filebeat.yml
   │   ├─ kibana/ft_saved.ndjson
   │   └─ …
   └─ web/backend/.env        ← single .env file (passwords & JWT secrets)
```

---

## 3  Host Requirements

| Component         | Minimum Version             | Notes                                              |
| ----------------- | --------------------------- | -------------------------------------------------- |
| Docker Engine     |  24+                        | root or rootless / WSL2 both work                  |
| Docker Compose v2 |  2.22+                      | invoke as `docker compose …`                       |
| Linux kernel      | `vm.max_map_count ≥ 262144` | set once: `sudo sysctl -w vm.max_map_count=262144` |

---

## 4  `.env` File (single source of secrets)

Path `srcs/services/web/backend/.env`:

```dotenv
# ELK security
ELASTIC_PASSWORD=Str0ngP@ssw0rd!
ELASTICSEARCH_PASSWORD=${ELASTIC_PASSWORD}

# Application JWT secrets (example)
JWT_ACCESS_SECRET=thirty_two_characters_long_string
JWT_REFRESH_SECRET=another_thirty_two_characters_long_string
JWT_2FA_ACCESS_SECRET=another_thirty_two_characters_long_string
```

> **Keep the file out of Git** – it is already in `.gitignore`.

---

## 5  Key `docker‑compose.yml` Highlights

| Service           | Critical settings                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **elasticsearch** | `discovery.type=single-node`, `ES_JAVA_OPTS=-Xms1g -Xmx1g`, `xpack.security.enabled=true`, `ports: ["9200:9200"]`, data volume `esdata:`              |
| **logstash**      | Beats input 5044, Elasticsearch output 9200, uses `${ELASTIC_PASSWORD}` from env‑file                                                                 |
| **filebeat**      | Mounts `/var/lib/docker/containers` (ro) and `docker.sock`; `filestream` fallback; runs as root with `strict.perms:false`                             |
| **kibana**        | `ELASTICSEARCH_HOSTS=http://elasticsearch:9200`, username `elastic`, `${ELASTIC_PASSWORD}`; waits until Kibana status = green then imports dashboards |
| **prometheus**    | Retention 15 days, alert rules in `alert_rules.yml`                                                                                                   |

---

## 6  Common Commands

```bash
make up              # build images + docker compose up -d
make down            # stop & remove containers (volumes stay)
make logs ES=1       # follow elasticsearch logs
```

Manual sequence:

```bash
# 1. Core
docker compose up -d elasticsearch kibana
# wait until ES returns JSON & Kibana state = green
# 2. Log‑pipeline
docker compose up -d logstash filebeat
# 3. Metrics & demo load
docker compose up -d cadvisor prometheus grafana loadgen
```

---

## 7  Health Checklist (CLI)

```bash
docker compose ps                         # STATE must be running / healthy
curl -u elastic:$ELASTIC_PASSWORD http://localhost:9200 | jq '.status'
curl http://localhost:5601/api/status | jq '.status.overall.state'
docker compose logs filebeat | grep 'Harvester started'
docker compose logs logstash | grep 'Pipeline started'
```

Expect `green` or `yellow` from ES, `green` from Kibana, at least one harvester and a running pipeline.

---

## 8  Frequent Issues & Fixes

| Symptom                                  | Fix                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **`cannot upgrade 8.13.4 → 9.0.3`**      | Dev: `docker volume rm kabana_esdata`.<br>Prod: start 8.18.0, wait green, then switch to 9.x.                |
| **`vm.max_map_count too low`**           | `sudo sysctl -w vm.max_map_count=262144` + persist to `/etc/sysctl.conf`.                                    |
| **Empty reply on 9200**                  | ES started with self‑signed TLS. Disable `xpack.security.http.ssl.enabled` or curl via `https://` with `-k`. |
| Kibana stuck `starting`                  | Wrong password / host. Verify variables & ES health.                                                         |
| Filebeat warns *Log input is deprecated* | Use `filestream` with mandatory `id:`.                                                                       |

---

## 9  Upgrade Path (8 → 9)

1. Launch **8.18.0** on the existing `esdata` volume until the cluster is *green*.
2. Stop the stack.
3. Switch images to 9.x, start again – ES will auto‑migrate metadata.

---

## 10  Full Reset (destroy all data)

```bash
docker compose down -v            # stop containers & remove volumes
sudo rm -rf ~/.docker/volumes/kabana_esdata   # optional manual wipe
```

---

### Useful Links

* Elastic Docker: [https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
* Filebeat Autodiscover: [https://www.elastic.co/guide/en/beats/filebeat/current/configuration-autodiscover.html](https://www.elastic.co/guide/en/beats/filebeat/current/configuration-autodiscover.html)
* Upgrade Matrix: [https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-upgrade.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-upgrade.html)

*Last updated 2025‑07‑13 · Maintainer: **devops\@transenders***
