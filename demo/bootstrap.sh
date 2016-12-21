#!/bin/bash

set -e

cd $(dirname $0)

docker-compose -f ../docker-compose-frontend.yml up

docker-compose up -d db

echo Ensure db instance is started...
sleep 20s

docker-compose build && docker-compose up

echo "Please visit http://localhost:8000 to access Tars, Enjoy it :)"
