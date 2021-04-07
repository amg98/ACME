BASE_SITE=acmeexplorer.com

#Setup
docker network create service-tier
docker run -d -p 80:80 --name nginx-proxy -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy
docker network connect service-tier nginx-proxy
docker volume create --name=logsvol
docker volume create --name=datavol

#Development
export NODE_ENV=production
export PORT=8001
export DBPORT=27017
export HOSTNAME=development.${BASE_SITE}
export VIRTUAL_HOST=${HOSTNAME}
export VIRTUAL_PORT=${PORT}
export DBSTRING="mongodb://mongo${DBPORT}:${DBPORT}/acme-explorer";
source /home/ec2-user/secrets.sh
docker-compose -p ${HOSTNAME} up -d

# #Production
export NODE_ENV=production
export PORT=8081
export DBPORT=27018
export HOSTNAME=${NODE_ENV}.${BASE_SITE}
export VIRTUAL_HOST=${HOSTNAME}
export VIRTUAL_PORT=${PORT}

export DBSTRING="mongodb://mongo${DBPORT}:${DBPORT}/acme-explorer";
source /home/ec2-user/secrets.sh
docker-compose -p ${HOSTNAME} up -d

# docker run --name busybox -v logsvol:/var/log/app -it  busybox sh

docker run -d --name portainer -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer