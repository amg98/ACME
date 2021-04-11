# ACME Explorer

![Deploy on Heroku](https://github.com/amg98/ACME/workflows/Deploy%20on%20Heroku/badge.svg)

To run the backend, you must create these environment files in the project folder:
- .devel.env for the environment variables in development environment
- .prod.env for the environment variables in production environment
- .test.env for the environment variables in testing environment

Environment variables:
- NODE_ENV: development, test or production
- PORT: port to attach to the server. In production environment, this one is provided by Heroku
- DBSTRING: database connection string. Example: mongodb://localhost:27017/acme-explorer
- HOSTNAME: only needed in production environment. It shouldn't be set in any other one
- SWAGGER_SCHEMA: http or https. It is used for Swagger "Try it" operations
- PAYPAL_MODE: "sandbox" or "live". Use sandbox if you don't want to get charged
- PAYPAL_CLIENT_ID: Client ID of a Paypal business account
- PAYPAL_CLIENT_SECRET: Paypal business account REST API secret
- FIREBASE_API_KEY: Firabase API Key
- FIREBASE_PROJECT_ID: Firebase auth project ID
- FIREBASE_PRIVATE_KEY: Firebase private key
- FIREBASE_CLIENT_EMAIL: Generated Firebase email
- DEFAULT_ADMIN_EMAIL: Only for production environment
- DEFAULT_ADMIN_PASSWORD: Only for production environment

## API Documentation
[Swagger docs](https://acmeexplorer.herokuapp.com/api-docs)



## Kubernetes deploy on AWS EC2
First of all, you need to provide a file located in "deploy/k8s/manifests/00-secrets" with the following structure, containg all the secrets needed for the web application both in development and production mode:

```{yml}
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  PAYPAL_CLIENT_ID_DEVEL: ...
  PAYPAL_CLIENT_SECRET_DEVEL: ...
  FIREBASE_API_KEY_DEVEL: ...
  FIREBASE_PROJECT_ID_DEVEL: ...
  FIREBASE_PRIVATE_KEY_DEVEL: ...
  FIREBASE_CLIENT_EMAIL_DEVEL: ...
  
  PAYPAL_CLIENT_ID_PROD: ...
  PAYPAL_CLIENT_SECRET_PROD: ...
  FIREBASE_API_KEY_PROD: ...
  FIREBASE_PROJECT_ID_PROD: ...
  FIREBASE_PRIVATE_KEY_PROD: ...
  FIREBASE_CLIENT_EMAIL_PROD: ...
```

Next, you must provide a file located in "deploy/k8s/acmekey.pem" with a private key generated in the AWS CLI, used for ssh connections. Also, it is required to define the AWS credentials to be used:

```{sh}
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

Once done, you can finally set up the infrastructure in a AWS EC2 instance using Terraform:

```{sh}
terraform init
terraform apply
```

Then, you must connect to the instance creating an SSH tunnel to be able to access the website. Minikube has been
used as the Kubernetes tool to ease deployment. However, as it is a tool for local clusters, we can't access it from
the Internet, so the SSH tunnel is mandatory in this case. In a more complex scenario, a more suitable tool such as
kubeadm should be used instead.

```
sudo ssh -i acmekey.pem -L 80:localhost:80 ec2-user@my-ec2-ip

./minikube start --vm-driver=none
./minikube addons enable ingress
cd manifests
../minikube kubectl -- apply -f .
```

Replacing "my-ec2-ip" with the instance IP obtained from the terraform output. Also, we are setting up the cluster.

Finally, you must add these lines to your /etc/hosts (not the EC2 instance's) to be able to access the web application:

```
127.0.0.1 development.acmeexplorer.com
127.0.0.1 acmeexplorer.com
```

## Terraform deploy on AWS EC2
First of all, you need to provide two files located in "deploy/tf/":

- # secrets.sh:  
with the following structure, containg some of the secrets needed for the web application both in development and production mode:

```{yml}
export FIREBASE_API_KEY= ...
export FIREBASE_CLIENT_EMAIL= ...
export FIREBASE_PRIVATE_KEY= ...
export FIREBASE_PROJECT_ID= ...
export PAYPAL_CLIENT_ID= ...
export PAYPAL_CLIENT_SECRET= ...
export PAYPAL_MODE= ...
export SWAGGER_SCHEMA= ...
```

- # start.sh:
with the following structure, containg the remaining secrets needed for the web application both in development and production mode and running every container needed:

```{yml}
Production
export NODE_ENV= ...
export PORT= ...
export DBPORT= ...
export HOSTNAME= ...
export VIRTUAL_HOST= ...
export VIRTUAL_PORT= ...
export DBSTRING= ...
source /home/ec2-user/secrets.sh
docker-compose -p ${HOSTNAME} up -d
```

Next, you must provide a file located in "deploy/tf/keys/paris-keys.pem" with a private key generated in the AWS CLI, used for ssh connections. Also, it is required to define the AWS credentials to be used:

```{sh}
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

Once done, you can finally set up the infrastructure in a AWS EC2 instance using Terraform:

```{sh}
terraform init
terraform apply
```

After this, terraform will return an IP that you can use to connect to portainer:

Portainer: <XXX.XXX.XXX.XXX:9000>, the next steps will be registering as an admin, and selecting the Local access.
Practically you can now see everything working from the inside, every container with their logs and even run a console inside them. (this will make the deploy easier)


Finally, you must add these lines to your /etc/hosts (not the EC2 instance's) to be able to access the web application:

```
<XXX.XXX.XXX.XXX> development.acmeexplorer.com
<XXX.XXX.XXX.XXX> acmeexplorer.com
```

(Been <XXX.XXX.XXX.XXX> the IP returned by terraform deployment)