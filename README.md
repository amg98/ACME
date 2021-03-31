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

Then, we connect using SSH to the EC2 instance in order to set up the Kubernetes cluster. We do this manually because
some minikube commands fail randomly, so it is possible that we must enter this multiple times to work.

```
ssh -i acmekey.pem ec2-user@my-ec2-ip

./minikube start --vm-driver=none
./minikube addons enable ingress
cd manifests
../minikube kubectl -- apply -f .
```

Replacing "my-ec2-ip" with the instance IP obtained from the terraform output.

Next, we set up some iptables rules to allow access from the Internet:

```
sudo sysctl net.ipv4.ip_forward=1 
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 127.0.0.1:8080
```

Finally, you must add these lines to your /etc/hosts (not the EC2 instance's) to be able to access the web application (replacing "my-ec2-ip" with the EC2 instance public IP)

```
my-ec2-ip development.acmeexplorer.com
my-ec2-ip acmeexplorer.com
```
