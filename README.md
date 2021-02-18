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

## API Documentation
[Swagger docs](https://acmeexplorer.herokuapp.com/api-docs)
