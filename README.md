# Docker bootstrap

Requirements

- docker and docker-compose
- GNU make

Preperations

``` bash
cp tars/settings/local.py.example tars/settings/local.py
```

Just type

``` bash
make docker_bootstrap
```

Then, please visit http://localhost:8000 to access Tars

# Frontend

Build frontend

```bash
make frontend
```

Build frontend using docker, please ensure container exit code is 0

```bash
make frontend_docker
```

# Docker demo

``` bash
./demo/bootstrap.sh
```

Demo admin account:

* username: admin
* password: nomoresecrete
