const express = require("express");
const swagger = require("./swagger");
const cors = require("cors");
const DatabaseConnection = require("./DatabaseConnection");
const SponsorshipController = require("./routes/SponsorshipController");
const SystemParamsController = require("./routes/SystemParamsController");
const paypal = require("paypal-rest-sdk");
const ActorController = require("./routes/ActorController");
const TripController = require("./routes/TripController");
const DashboardController = require("./routes/DashboardController");

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
        SponsorshipController.register(apiPrefix, this.router);
        SystemParamsController.register(apiPrefix, this.router);
        ActorController.register(apiPrefix, this.router);
        TripController.register(apiPrefix, this.router);
        DashboardController.register(apiPrefix, this.router);

        this.app.use(App.errorHandler);
        swagger.setupSwagger(this.app, this.port);

        paypal.configure({
            mode: process.env.PAYPAL_MODE,
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_CLIENT_SECRET
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
