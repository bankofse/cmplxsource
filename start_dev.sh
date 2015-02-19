#!/bin/bash

boot2docker start
$(boot2docker shellinit)

docker kill postgres
docker rm postgres
docker run --name postgres -e POSTGRES_PASSWORD=alpine -d postgres

docker build -t auth-user .
docker run -p 3000:3000 -ti -v `pwd`:/src --link postgres:postgres auth-user bash -c "npm install; nodemon --es_staging --harmony_arrow_functions bin/www"
