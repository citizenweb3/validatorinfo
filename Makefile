create-deps:
	docker run --rm --name postgres -p "5432:5432" -e POSTGRES_DB=coindrops -e POSTGRES_USER=coindrops -e POSTGRES_PASSWORD=password -d "postgres:14-bullseye"
	@sleep 5 

destroy-deps:
	docker rm -f postgres

deploy-migrations:
	npx prisma migrate deploy

init-chains:
	yarn ts-node tools/claim-data/init-chains.ts

generate-schema:
	npx prisma migrate dev