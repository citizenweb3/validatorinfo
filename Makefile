create-deps:
	docker run --name postgres -p "9432:5432" -e POSTGRES_DB=vi_db -e POSTGRES_USER=vi_user -e POSTGRES_PASSWORD=password -d "postgres:14-bullseye"
	@sleep 5 

destroy-deps:
	docker rm -f postgres

deploy-migrations:
	npx prisma migrate deploy

init-chains:
	npx tsx src/tools/chains/init-chains.ts

generate-schema:
	npx prisma migrate dev

start-indexer:
	npx tsx server/server.ts

start-db: 
	make destroy-deps
	make create-deps
	make deploy-migrations
	make init-chains