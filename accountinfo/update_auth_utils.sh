#!/bin/bash

set -e

function cleanup {
  mkdir ./auth_utils
  cp -R ../auth/utils/ ./auth_utils/
}
trap cleanup EXIT

rm -rf ./auth_utils
