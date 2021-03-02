const mongoose = require("mongoose");
const sponsorID = mongoose.Types.ObjectId().toHexString();

module.exports.CheckAdmin = (req, res, next) => {
    // TODO
    // Devolver 401 sin mensaje en caso de no autorizado
    next();
};

module.exports.CheckSponsor = (req, res, next) => {
    // TODO
    // Devolver 401 sin mensaje en caso de no autorizado
    req.sponsorID = sponsorID;
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
