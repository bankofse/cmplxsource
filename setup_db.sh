#!/bin/bash

echo "******CREATING DOCKER DATABASE******"
gosu postgres postgres --single <<- EOSQL
    CREATE DATABASE accounts;
    CREATE USER accounts;
    GRANT USAGE ON SCHEMA public TO accounts;
GRANT SELECT ON mytable TO accounts;
EOSQL
echo ""
echo "******DOCKER DATABASE CREATED******"

runLater () {
    sleep 3;
    echo "Starting the DATABASE creation";
    psql -U accounts -f /tmp/schema.sql;
    echo "Done";

    cd /etc/listener/ && node index.js;
}

runLater &