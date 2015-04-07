#!/bin/bash

$(docker-machine env dev);

docker run -ti -e MYSQL_ROOT_PASSWORD=alpine -e MYSQL_USER=transaction -e MYSQL_PASSWORD=transaction -e MYSQL_DATABASE=transaction -p 32000:3306 mysql
