#!/bin/bash

echo "******CREATING DOCKER DATABASE******"
gosu postgres postgres --single <<- EOSQL
    CREATE DATABASE accounts;
    CREATE USER accounts;
    GRANT ALL PRIVILEGES ON DATABASE accounts to accounts;
EOSQL
echo ""
echo "******DOCKER DATABASE CREATED******"

runLater () {
    sleep 5;
    echo "Starting the DATABASE creation";
    psql -U accounts -f /tmp/schema.sql
}

runLater &