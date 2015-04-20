#!/bin/bash

consul exec -http-addr 10.132.89.71:8500 wget -N 129.21.81.10:8080/consulhosts.sh;
consul exec -http-addr 10.132.89.71:8500 sh consulhosts.sh;
