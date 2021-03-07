const mongoose = require("mongoose");

module.exports.CheckAdmin = (req, res, next) => {
    // TODO
    // Devolver 401 sin mensaje en caso de no autorizado
    next();
};

module.exports.CheckSponsor = (req, res, next) => {
    // TODO
    // Devolver 401 sin mensaje en caso de no autorizado
    req.sponsorID = mongoose.Types.ObjectId("6043832192d9363acca82510");
    next();
};

module.exports.CheckExplorer = (req, res, next) => {
    // TODO
    // Devolver 401 sin mensaje en caso de no autorizado
    next();
};

module.exports.CheckManager = (req, res, next) => {
    // TODO
    // Devolver 401 sin mensaje en caso de no autorizado
    next();
};
