BASE_SITE=acmeexplorer.com

docker stop nginx-proxy

# #Development
export NODE_ENV=production
export PORT=8001
export DBPORT=27017
export VIRTUAL_HOST=${HOSTNAME}
export VIRTUAL_PORT=${PORT}
export DBSTRING="mongodb://mongo27017:27017/acme-explorer-development";
export HOSTNAME=development.${BASE_SITE}
source secrets.sh
docker-compose -p ${HOSTNAME} down

#Production
export NODE_ENV=production
export PORT=8081
export DBPORT=27018
export VIRTUAL_HOST=${HOSTNAME}
export VIRTUAL_PORT=${PORT}
export DBSTRING="mongodb://mongo${DBPORT}:${DBPORT}/acme-explorer-${NODE_ENV}";
export HOSTNAME=${NODE_ENV}.${BASE_SITE}
source secrets.sh
docker-compose -p ${HOSTNAME} down

#Teardown
docker stop nginx-proxy
docker rm nginx-proxy
docker volume rm logsvol
docker network rm service-tier
docker volume prune -f

# docker rm busybox