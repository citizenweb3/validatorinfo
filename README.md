# [Validator Info](https://validatorinfo.com/)
> Web3 Blockchain Explorer. Validator, Mining Pool, Token and Network Real-time Metrics. Interactive Onchain Dashboard.  

![Telegram-Storie](https://github.com/user-attachments/assets/65689ccc-e5a4-4ee2-8ee7-ffb86bde4233)


### | [Blog](https://validatorinfo.com/blog/) | [X](https://x.com/therealvalinfo) | [Docs](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md) | [Design Assets](https://github.com/citizenweb3/validatorinfo/tree/main/public) | [`BE GOOD` License](https://github.com/citizenweb3/validatorinfo/blob/main/LICENSE-BG) |

🄸 🄳 🄵 🅻 🅽 🄍 ⚀

-----------------------------------------

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

```bash
sudo apt install cmdtest
sudo apt install nodejs
sudo apt install npm
sudo apt install build-essential
npm install --global yarn
yarn global add pm2
```

### Clone repo

```bash
git clone https://github.com/citizenweb3/validatorinfo.git validatorinfo
cd validatorinfo
```

### Prepare Environment and Makefile

```bash
cp .env.example .env
cp Makefile.example Makefile
```

### Install dependencies

```bash
yarn
```

### Development

```bash
make create-deps
make generate-client
make deploy-migrations
make init-chains
make generate-schema
yarn dev
```

### Build

```bash
make create-deps
make generate-client
make deploy-migrations
make init-chains
make generate-schema
yarn build
```

### Start Built Project

```bash
pm2 start "yarn start" --name next
pm2 start "make start-indexer" --name indexer
```
---------------------------------------

## Docker Development Environment

### Using Docker Compose (Recommended)

Docker Compose provides a fully isolated development environment with all required services.

1. Ensure Docker and Docker Compose are installed on your system.

2. Set up environment variables:
```bash
cp .env.example .env
```

Required variables in .env file:
```
# Database
POSTGRES_DB=validatorinfo_db
POSTGRES_USER=validatorinfo_user
POSTGRES_PASSWORD=mysecretpassword

# Front and indexer environment
PUBLIC_URL=localhost
REDIS_HOST=redis
VALIDATORS_APP_TOKEN="<your_token>"
```

3. Start the project:
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Migrations service (automatic database setup)
- Frontend application (port 3000)
- Indexer service (port 3001)

