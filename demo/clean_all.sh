#!/bin/bash
cd $(dirname $0)

docker-compose stop
docker-compose down --rmi local -v

cd -
