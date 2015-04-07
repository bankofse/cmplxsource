#!/bin/bash

docker build -t bankofse/proxy .

docker run -ti -p 443:443 -p 80:80 -v /Users/michael/Documents/cmplx_certs/cmplx_in:/etc/ssl bankofse/proxy "$@"
