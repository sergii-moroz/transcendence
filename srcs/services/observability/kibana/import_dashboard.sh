#!/usr/bin/env bash
set -euo pipefail

# ------------------- переменные -------------------
KIBANA_URL=${KIBANA_URL:-http://localhost:5601}
ES_URL=${ES_URL:-http://elasticsearch:9200}        # <-- правильный хост!
KIB_USER=${ELASTIC_USERNAME:-elastic}
KIB_PASS=${ELASTIC_PASSWORD:-kibanapass}
DASH_FILE=${DASH_FILE:-/init/ft_dashboard.ndjson}

# ------------------- ожидание Kibana -------------------
echo "⏳ Waiting for Kibana ..."
until curl -s -u "$KIB_USER:$KIB_PASS" "$KIBANA_URL/api/status" >/dev/null; do
  sleep 3
done

# ------------------- ожидание Elasticsearch -------------------
echo "⏳ Waiting for Elasticsearch at $ES_URL ..."
until curl -s -u "$KIB_USER:$KIB_PASS" "$ES_URL" >/dev/null; do
  sleep 3
done

# ------------------- ILM-политика -------------------
echo "🛠  Creating ILM policy 'log-retention-policy' ..."
curl -s -u "$KIB_USER:$KIB_PASS" -X PUT "$ES_URL/_ilm/policy/log-retention-policy" \
  -H 'Content-Type: application/json' \
  -d '{
        "policy": {
          "phases": {
            "hot":    { "actions": {} },
            "delete": { "min_age": "7d", "actions": { "delete": {} } }
          }
        }
      }'

# (необязательно) шаблон-привязка политики к logs-* индексам
curl -s -u "$KIB_USER:$KIB_PASS" -X PUT "$ES_URL/_index_template/logs-template" \
  -H 'Content-Type: application/json' \
  -d '{
        "index_patterns": ["logs-*"],
        "template": {
          "settings": {
            "index.lifecycle.name": "log-retention-policy",
            "index.lifecycle.rollover_alias": "logs"
          }
        },
        "priority": 500
      }'

# ------------------- импорт дашборда -------------------
echo "🚀 Importing dashboard from $DASH_FILE ..."
curl -s -u "$KIB_USER:$KIB_PASS" -X POST \
     "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
     -H 'kbn-xsrf: true' \
     --form "file=@${DASH_FILE}" \
     > /tmp/import_dashboard_response.json

echo "✅ All done."
