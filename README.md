# Validator Info
[Validator Info](https://validatorinfo.com/): multichain POW and POS explorer, dashboard and aggregator, focused on validators and mining pools. 

## Socials: [Blog](https://validatorinfo.com/blog/) | [X](https://x.com/therealvalinfo)

## Helpful: [Docs](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md) | [Design Assets](https://github.com/citizenweb3/validatorinfo/tree/main/src/assets)

## License: [BE GOOD](https://github.com/citizenweb3/validatorinfo/blob/main/LICENSE-BG)

![image](https://github.com/citizenweb3/validatorinfo/assets/7550961/6a7d6673-32be-4a31-895c-2793fde91ce4)

## Installing

### Prerequisites

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

### Prepare your `.env` file

```bash
cp .env.example .env
```

### Example of `.env`

```bash
POSTGRES_DB=validatorinfo
POSTGRES_USER=user
POSTGRES_PASSWORD=password
NODE_ENV=production
DATABASE_URL="postgresql://validatorinfo:password@localhost:5432/mydb?schema=public"
SERVER_PORT="3000"
INDEXER_PORT="3001"
PUBLIC_URL="localhost"
```

### Install dependencies

```bash
yarn
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

### Start

```bash
pm2 start "yarn start" --name next
pm2 start "make start-indexer" --name indexer
```
