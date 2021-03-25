const express = require("express");
const swagger = require("./swagger");
const cors = require("cors");
const DatabaseConnection = require("./DatabaseConnection");

const paypal = require("paypal-rest-sdk");
var admin = require("firebase-admin");

const AuthController = require("./routes/AuthController");
const SponsorshipController = require("./routes/SponsorshipController");
const SystemParamsController = require("./routes/SystemParamsController");
const ActorController = require("./routes/ActorController");
const CubeController = require("./routes/CubeController");
const ApplicationController = require("./routes/ApplicationController");
const FinderController = require("./routes/FinderController");
const TripController = require("./routes/TripController");
const StatsController = require("./routes/StatsController");

class App {
    constructor() {
        this.app = express();
        this.router = express.Router();
        this.server = null;
        this.port = process.env.PORT || 8080;
        this.db = new DatabaseConnection();

        this.app.use(cors()); // Needed for SwaggerUI TryIt
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.json());
        this.app.use(this.router);

        // Route registration
        const apiPrefix = swagger.getBasePath();
        AuthController.register(apiPrefix, this.router);
        SponsorshipController.register(apiPrefix, this.router);
        SystemParamsController.register(apiPrefix, this.router);
        ActorController.register(apiPrefix, this.router);
        CubeController.register(apiPrefix, this.router);
        TripController.register(apiPrefix, this.router);
        StatsController.register(apiPrefix, this.router);
        ApplicationController.register(apiPrefix, this.router);
        FinderController.register(apiPrefix, this.router);

        this.app.use(App.errorHandler);
        swagger.setupSwagger(this.app, this.port);

        paypal.configure({
            mode: process.env.PAYPAL_MODE,
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_CLIENT_SECRET
        });

        admin.initializeApp({
            credential: admin.credential.cert({
                "project_id": process.env.FIREBASE_PROJECT_ID,
                "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                "client_email": process.env.FIREBASE_CLIENT_EMAIL
            })
        });
    }

    static errorHandler(err, req, res, next) {
        res.status(500).json({ msg: err });
    }

    run() {
        return new Promise((resolve, reject) => {
            process.on("SIGINT", () => {
                console.log("[SERVER] Shut down requested by user");
                this.stop().then(() => { });
            });

            this.db
                .setup()
                .then(() => {
                    return SystemParamsController.initialize();
                })
                .then(() => {
                    this.server = this.app.listen(this.port, () => {
                        console.log(`[SERVER] Running at port ${this.port}`);
                        resolve();
                    });
                })
                .catch(reject);
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            if (this.server == null) {
                reject();
                return;
            }

            this.server.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("[SERVER] Closed successfully");
                    this.db.close().then(resolve).catch(reject);
                }
            });
        });
    }
}

module.exports = App;
