# Projeto GreenYelloy

Este projeto é uma API desenvolvida em Nestjs. A seguir, estão as instruções para configurar e executar o projeto em um ambiente Docker.

## Pré-requisitos

- Docker
- Docker Compose

## Instruções

### 1. Clone o repositório do GitHub

Clone o repositório para sua máquina local:

```bash
git clone git@github.com:lcamargo82/test_greenyellow.git
```

### 2. Acesse a pasta do projeto

Acesse a pasta do projeto para configurar o env:

```bash
cd test_greenyellow 
```

### 3. Configure o .env

Copie o arquivo env.exemple para .env:

```bash
cp .env.example .env
```

### 4. Fazer o build do container

Faça o buid do container e suba a aplicação:

```bash
docker-compose up --build -d
```

### 5. Instalação das dependências

Instale as dependências da aplicação:

```bash
docker-compose exec -T nestjs sh -c "cd /app/api_greenyellow && npm install"
```

### 6. Incia o server

Incia o server da aplicação:
```bash
docker-compose exec -T nestjs sh -c "cd /app/api_greenyellow && npm run start:dev"
```

### 7. Rodar os migrations

Fazer as migrations:
```bash
docker compose exec -T nestjs sh -c "cd /app/api_greenyellow && npx typeorm migration:run -d dist/database/ormconfig.js"
```

## Acesso à API
A API estará disponível em http://localhost:3000.

## Acesso ao board das filas
A API estará disponível em http://localhost:3000/queues.

## Observações
- Certifique-se de que suas portas no Docker não estejam em conflito com outras aplicações.
- Configure as variáveis de ambiente no arquivo .env conforme necessário para sua aplicação.
  