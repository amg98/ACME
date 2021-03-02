const SponsorshipSchema = require("../models/SponsorshipSchema");

/**
 * @typedef ValidationError
 * @property {string} reason   - User-friendly reason message
 */

module.exports.Required = (objectName, fieldName) => (req, res, next) => {
    if (req[objectName] && req[objectName].hasOwnProperty(fieldName) && req[objectName][fieldName]) {
        next();
    } else {
        res.status(400).json({ reason: "Missing fields" });
    }
};

module.exports.Range = (objectName, fieldName, minValue, maxValue) => (req, res, next) => {
    req[objectName][fieldName] = Number(req[objectName][fieldName]);
    const field = req[objectName][fieldName];
    if (field >= minValue && field <= maxValue) {
        next();
    } else {
        res.status(400).json({ reason: "Exceeded boundaries" });
    }
};

module.exports.SponsorshipExistsAndNotPaid = (objectName, subobjectName, fieldName) => async (req, res, next) => {
    if(!req[objectName][subobjectName] || !req[objectName][subobjectName].hasOwnProperty(fieldName) || !req[objectName][subobjectName][fieldName]) {
        return res.status(400).json({ reason: "Missing sponsorship ID" });
    }

    const id = req[objectName][subobjectName][fieldName];
    const docs = await SponsorshipSchema.find({ _id: id, sponsorID: req.sponsorID }).exec();
    
    if(docs.length === 1) {
        if(docs[0].isPaid) {
            return res.sendStatus(401);
        } else {
            next();
        }
    } else {
        return res.sendStatus(404);
    }
};

module.exports.CheckSuccessCancelURL = (objectName, fieldName) => (req, res, next) => {
    if(!req[objectName][fieldName].successURL || !req[objectName][fieldName].cancelURL) {
        return res.status(400).json({ reason: "Missing success/cancel URL" });
    }

    next();
};

module.exports.TripExists = (objectName, subobjectName, fieldName) => (req, res, next) => {
    // TODO
    next();
};
