#!/bin/bash

HOST='localhost:4000'

TOKEN=`curl http://localhost:3000/auth -XPOST -d '{"user":"7imbrook","pass":"mypassword"}' -H "Content-Type: application/json" | jsawk 'return this.token'`

TID=`curl -XPOST -H "Content-Type: application/json" -H "token:$TOKEN" $HOST/create -d '{"request_from":"joe","amount":19.99}' | jsawk 'return this.tid'`

TOKEN=`curl https://cmplx.in/auth -XPOST -d '{"user":"joe","pass":"mypassword"}' -H "Content-Type: application/json" | jsawk 'return this.token'`

curl -XPOST -H "Content-Type: application/json" -H "token:$TOKEN" "$HOST/complete/$TID"
