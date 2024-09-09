create-deps:
	docker run --rm --name postgres -p "5432:5432" -e POSTGRES_DB=validatorinfo -e POSTGRES_USER=validatorinfo -e POSTGRES_PASSWORD=password -d "postgres:14-bullseye"
	@sleep 5 

destroy-deps:
	docker rm -f postgres

deploy-migrations:
	npx prisma migrate deploy

init-chains:
	yarn ts-node-esm src/tools/chains/init-chains.ts

generate-schema:
	npx prisma migrate dev

start-indexer:
	yarn ts-node-esm server/server.ts

start-db: 
	make destroy-deps
	make create-deps
	make deploy-migrations
	make init-chains