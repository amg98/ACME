const expressSwagger = require('express-swagger-generator');

module.exports.getBasePath = () => {
    return "/api/v1";
}

module.exports.setupSwagger = (app, port) => {

    const swaggerOptions = {
        swaggerDefinition: {
            info: {
                description: "Trip reservation web app",
                title: "ACME Explorer API",
                version: "1.0.0",
            },
            host: process.env.HOSTNAME || ('localhost:' + port),
            basePath: this.getBasePath(),
            produces: [
                "application/json",
            ],
            schemes: [process.env.SWAGGER_SCHEMA],
            securityDefinitions: {
                bearerAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: "Introducir con formato 'Bearer <idToken>",
                }
            }
            
        },
        basedir: __dirname,
        files: ['./routes/**/*.js']
    };

    expressSwagger(app)(swaggerOptions);
}
