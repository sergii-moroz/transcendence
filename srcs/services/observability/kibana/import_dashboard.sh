#!/usr/bin/env bash

set -euo pipefail

KIBANA_URL=${KIBANA_URL:-http://localhost:5601}
KIB_USER=${ELASTIC_USERNAME:-elastic}
KIB_PASS=${ELASTIC_PASSWORD:-kibanapass}
DASH_FILE=${DASH_FILE:-/init/ft_dashboard.ndjson}

echo "⏳ Waiting for Kibana ..."
until curl -s -u "$KIB_USER:$KIB_PASS" "$KIBANA_URL/api/status" >/dev/null ; do
  sleep 3
done

echo "🚀 Importing dashboard from $DASH_FILE"
curl -s -u "$KIB_USER:$KIB_PASS" -X POST \
     "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
     -H 'kbn-xsrf: true' \
     --form "file=@${DASH_FILE}" \
     > /tmp/import_dashboard_response.json