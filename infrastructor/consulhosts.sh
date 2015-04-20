#!/bin/bash

echo "Installing on host $(hostname -I | awk '{print $2}')"
mkdir -p /env
echo "CONSUL_HOST=$(hostname -I | awk '{print $2}')" > /env/consul;
