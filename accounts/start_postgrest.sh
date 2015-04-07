#! /bin/bash

echo "Starting Postgrest"

postgrest  --db-host localhost  --db-port 5432     \
           --db-name accounts   --db-user accounts \
           --db-pass accounts   --db-pool 200      \
           --anonymous accounts --port 3000        \
           --v1schema public &
