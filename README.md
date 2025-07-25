# transcendence

## 🚀 Getting Started
### 📦 Install dependencies

```bash
npm install
```

### ⚙️ Setup environment variables

Run the environment generator script:
```bash
bash env_gen.sh
```
Edit `.env` and set the following variables to secure 32-character-long random strings:

```
JWT_ACCESS_SECRET=thirty_two_characters_long_string
JWT_REFRESH_SECRET=refresh-secret
JWT_2FA_ACCESS_SECRET=two-2fa-access-key-two-2fa-access-key
```

### 🔧 Build the project
```bash
npm run build
```
This step compiles TypeScript to JavaScript in the `dist/` folder and copies static files.

### 🧪 Run in development mode
```bash
npm run dev
```
This uses nodemon to automatically restart the server on code changes.



## ⚙️ Notes

- Project uses mixed file types (`*.ts` and `*.js`).
- TypeScript only compiles `*.ts` files. To ensure all assets are available in `dist/`, you must:

	- Run `npm run build`, or
	- Manually copy static files with: `cpx "src/public/**/*" dist/public`


## 📁 Folder Structure (simplified)
```
project/
│
├── dist/               # Compiled JS files (after build)
├── src/
│   ├── db/
│   │   ├── connection.ts   # DB connection (shared)
│   │   ├── init.ts         # DB initialization + migration runner
│   │   ├── migrations/
│   │   │   ├── 001-create-users.ts
│   │   │   ├── 002-create-posts.ts
│   │   │   └── ... more migration files
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── routes.ts       # Registers all route modules
│   ├── services/
│   │   ├── userService.ts  # Business logic for users
│   │   ├── authService.ts  # Business logic for auth
│   ├── app.ts
│   ├── index.ts
│   └── types/
│       └── user.ts
├── public/             # Static HTML, CSS, JS
├── types/              # Global types
├── package.json
├── tsconfig.json
└── .env
```

## 🛠️ Monitoring and Observability
Prometheus

http://localhost:9090
	up
	node_memory_MemAvailable_bytes

	 http://localhost:9090 → Status → Targets
	


curl -s http://localhost:9090/-/healthy
curl -s http://localhost:9090/metrics | head -n 20
      http_requests_total
curl -s "http://localhost:9090/api/v1/query?query=up"

grafana 
http://localhost:3000/

# log Grafana
docker compose -f ./srcs/services/observability/docker-compose.monitoring.yml logs -f grafana

# log logstash
docker compose -f ./srcs/services/observability/docker-compose.monitoring.yml logs -f logstash


stress make loadtest
loadtest:
	@docker compose -f $(COMPOSE_FILE) run --rm k6



#stress test
docker compose -f ./srcs/services/observability/docker-compose.monitoring.yml up -d loadgen
stress --cpu 4 --timeout 60


#  health 
docker compose -f ./srcs/services/observability/docker-compose.monitoring.yml exec grafana \
  curl -s localhost:3000/api/health

# plagin
docker compose -f ./srcs/services/observability/docker-compose.monitoring.yml exec grafana \
  grafana-cli plugins ls



Logstash							
curl -s "http://localhost:9200/ft-*/_search?size=5&sort=@timestamp:desc&pretty"

Elasticsearch 
curl -s http://localhost:9200 | jq
curl -s http://localhost:9200

elast pass
elastic:kibanapass
kib pass 
kib_us kib_pass 

curl -u elastic:kibanapass http://localhost:9200/


kibana
http://localhost:5601/


curl -u elastic:kibanapass -X POST "http://localhost:9200/_security/user/kib_test" -H "Content-Type: application/json" -d '{
  "password": "kibanapass",
  "roles": [ "kibana_system" ],
  "full_name": "kib test",
  "email": "kibana@example.com"
}'


docker exec -it transcend10-kibana-1 bash
/init/import_dashboard.sh




polit
curl -u elastic:kibanapass http://localhost:9200/_ilm/policy/log-retention-policy?pretty
curl -u elastic:kibanapass http://elasticsearch:9200/_ilm/policy/log-retention-policy?pretty


◦ Deploy Elasticsearch 
	curl http://localhost:9200
◦ Configure Logstash to collect, 

docker ps
docker ps | grep logstash
docker logs vt1-logstash-1 --tail 20
docker exec -it vt1-logstash-1 cat /usr/share/logstash/pipeline/logstash.conf


◦ Set up Kibana for visualizing

http://localhost:5601/

◦ Define data retention and archiving policies
curl -u elastic:kabinapass http://localhost:9200/_ilm/policy/log-retention-policy?pretty

◦ Implement security measures to protect log 
cat .env | grep ELASTIC_PASSWORD


Deploy Prometheus as the monitoring and alerting toolkit to collect metrics
and monitor the health and performance of various system components.
docker ps | grep prometheus
http://localhost:9090


◦ Configure data exporters and integrations to capture metrics from different
services, databases, and infrastructure components.

◦ Create custom dashboards and visualizations using Grafana to provide realtime insights into system metrics and performance.
http://localhost:3000/
◦ Set up alerting rules in Prometheus to proactively detect and respond to
critical issues and anomalies.
http://localhost:9090/alerts

docker stop node_exporter



◦ Ensure proper data retention and storage strategies for historical metrics data.

http://localhost:9090/status

◦ Implement secure authentication and access control 


docker volume ls
docker volume ls -q | grep 'sr' | xargs docker volume rm
