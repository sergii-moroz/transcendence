#!/bin/sh
ES=http://elasticsearch:9200          # internal name in the stack
curl -s -X PUT $ES/_ilm/policy/ft_policy -H 'Content-Type: application/json' -d '{
  "policy": {
    "phases": {
      "hot":   { "actions": { "rollover": { "max_age": "7d",  "max_size": "20gb" } } },
      "warm":  { "min_age": "7d",  "actions": { "shrink": { "number_of_shards": 1 } } },
      "delete":{"min_age": "90d", "actions": { "delete": {} } }
    }
  }
}' && \
curl -s -X PUT $ES/_index_template/ft_template -H 'Content-Type: application/json' -d '{
  "index_patterns": ["ft-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "ft_policy",
      "index.lifecycle.rollover_alias": "ft"
    }
  }
}'
