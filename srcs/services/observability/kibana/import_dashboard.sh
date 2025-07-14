#!/usr/bin/env bash
set -euo pipefail

KIBANA_URL=${KIBANA_URL:-http://localhost:5601}
ES_URL=${ES_URL:-http://elasticsearch:9200}


ES_SUPER_USER=${ELASTIC_USERNAME:-elastic}
ES_SUPER_PASS=${ELASTIC_PASSWORD:-kibanapass}  


KIB_SYS_USER=${KIB_SYS_USER:-kibana_system_user}
KIB_SYS_PASS=${KIB_SYS_PASS:-kibanapass}

DASH_FILE=${DASH_FILE:-/init/ft_dashboard.ndjson}


echo "⏳ Waiting for Elasticsearch at $ES_URL ..."
until curl -s -u "$ES_SUPER_USER:$ES_SUPER_PASS" "$ES_URL" >/dev/null; do
  sleep 3
done
echo "✅ Elasticsearch is up"


echo "🔐 Creating/Updating user $KIB_SYS_USER ..."
curl -s -u "$ES_SUPER_USER:$ES_SUPER_PASS" -X POST \
     "$ES_URL/_security/user/$KIB_SYS_USER" \
     -H 'Content-Type: application/json' \
     -d "{\n           \"password\" : \"$KIB_SYS_PASS\",\n           \"roles\"    : [\"kibana_system\",\"kibana_admin\",\"monitoring_user\",\"logstash_writer\"],\n           \"full_name\": \"Kibana service account\"\n         }" >/dev/null
echo "✅ User $KIB_SYS_USER ready"


echo "⏳ Waiting for Kibana ..."
until curl -s -u "$ES_SUPER_USER:$KIB_SYS_PASS" "$KIBANA_URL/api/status" >/dev/null; do
  sleep 5
done
echo "✅ Kibana is up"


echo "⚙️  Applying Kibana settings (dark mode, defaultIndex) ..."
curl -s -u "$ES_SUPER_USER:$KIB_SYS_PASS" -X POST \
     "$KIBANA_URL/api/kibana/settings" \
     -H 'kbn-xsrf: true' \
     -H 'Content-Type: application/json' \
     -d '{ "changes": { "theme:darkMode": true, "defaultIndex": "logs-*" } }' >/dev/null

# ------------------------- ILM

echo "🛠  Creating ILM policy 'log-retention-policy' ..."
curl -s -u "$ES_SUPER_USER:$ES_SUPER_PASS" -X PUT "$ES_URL/_ilm/policy/log-retention-policy" \
  -H 'Content-Type: application/json' \
  -d '{ "policy": { "phases": { "hot": { "actions": {} }, "delete": { "min_age": "7d", "actions": { "delete": {} } } } } }' >/dev/null


curl -s -u "$ES_SUPER_USER:$ES_SUPER_PASS" -X PUT "$ES_URL/_index_template/logs-template" \
  -H 'Content-Type: application/json' \
  -d '{ "index_patterns": ["logs-*"], "template": { "settings": { "index.lifecycle.name": "log-retention-policy", "index.lifecycle.rollover_alias": "logs" } }, "priority": 500 }' >/dev/null



echo "🚀 Importing dashboard from $DASH_FILE ..."
curl -s -u "$ES_SUPER_USER:$KIB_SYS_PASS" -X POST \
     "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
     -H 'kbn-xsrf: true' \
     --form "file=@${DASH_FILE}" >/tmp/import_dashboard_response.json


cat <<MSG
🎉  Все готово!
     Kibana:   $KIBANA_URL
     User:     $KIB_SYS_USER
     Password: $KIB_SYS_PASS
MSG
