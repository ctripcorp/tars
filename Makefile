SETTINGS_CONFIG_LOCAL = --settings=tars.settings.local
SETTINGS_CONFIG_DOCKE = --settings=tars.settings.docker

all: docker_up

# Docker commands

docker_bootstrap: docker_init docker_db_init docker_up

docker_build:
	docker-compose build

docker_up:
	docker-compose up

docker_init: docker_frontend_build docker_build

docker_db_up:
	docker-compose up -d db

docker_db_create_user: docker_db_up
	docker-compose run worker python manage.py createsuperuser $(SETTINGS_CONFIG_DOCKE)

docker_db_migrate: docker_db_up
	docker-compose run worker python manage.py migrate $(SETTINGS_CONFIG_DOCKE)

docker_db_init: docker_db_up sleep_20s docker_db_migrate docker_db_create_user

docker_clean:
	docker-compose stop && docker-compose rm -f

# common

sleep_10s:
	sleep 10

sleep_20s:
	sleep 20

sleep_40s:
	sleep 40

# Django commands

server: frontend
	python manage.py runserver 0.0.0.0:8000 $(SETTINGS_CONFIG_LOCAL)

db_create_user:
	python manage.py createsuperuser $(SETTINGS_CONFIG_LOCAL)

db_migrate:
	python manage.py migrate $(SETTINGS_CONFIG_LOCAL)

npm_registry:
	npm config set registry http://registry.npm.taobao.org

frontend_requirements_gulp: npm_registry
	gulp --version || npm install -g gulp

frontend: frontend_requirements_gulp
	cd tars/surface/static && npm install && gulp

frontend_docker:
	docker-compose -f docker-compose-frontend.yml up

frontend_docker_stop:
	docker-compose -f docker-compose-frontend.yml stop

frontend_docker_rm: frontend_docker_stop
	docker-compose -f docker-compose-frontend.yml rm -v -f

flush_priviledge:
	chown -R $$USER .

# Aliases

runserver: server

docker_frontend_build: frontend_docker
