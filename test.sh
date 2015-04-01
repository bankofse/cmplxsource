#!/bin/bash

HOSTA='localhost:3000'
HOSTB='localhost:3001'
HOSTC='localhost:3002'

TID=`curl $HOSTA/create | jsawk 'return this.tid'`
echo $TID
curl -XPOST "$HOSTB/complete/$TID"

TID=`curl $HOSTC/create | jsawk 'return this.tid'`
echo $TID
curl -XPOST "$HOSTA/complete/$TID"

TID=`curl $HOSTB/create | jsawk 'return this.tid'`
echo $TID
curl -XPOST "$HOSTB/complete/$TID"

