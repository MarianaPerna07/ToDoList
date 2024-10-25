#!/bin/bash

# Parar os containers, caso estejam em execução
docker compose down

# Construir e iniciar os serviços
docker compose up --build

# Verificar o status dos containers
docker ps
