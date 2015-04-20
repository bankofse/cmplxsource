#!/bin/bash

envconsul -consul 127.0.0.1:8500 -upcase -prefix auth/env nodemon --es_staging --harmony_arrow_functions bin/www
