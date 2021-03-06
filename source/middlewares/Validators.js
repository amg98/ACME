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

const CheckSponsorshipNotPaid = (objectName, subobjectName, fieldName) => async (req) => {
    if(!req[objectName][subobjectName] || !req[objectName][subobjectName].hasOwnProperty(fieldName) || !req[objectName][subobjectName][fieldName]) {
        return res.status(400).json({ reason: "Missing sponsorship ID" });
    }

    const id = req[objectName][subobjectName][fieldName];
    const docs = await SponsorshipSchema.find({ _id: id, sponsorID: req.sponsorID }).exec();
    
    if(docs.length === 1) {
        if(docs[0].isPaid) {
            throw 401;
        }
    } else {
        throw 404;
    }
};

module.exports.CheckPaymentData = (objectName, fieldName) => async (req, res, next) => {
    try {
        await CheckSponsorshipNotPaid(objectName, fieldName, "id")(req);
    } catch(errorCode) {
        return res.sendStatus(errorCode);
    }

    if(!req[objectName][fieldName].successURL || !req[objectName][fieldName].cancelURL) {
        return res.status(400).json({ reason: "Missing success/cancel URL" });
    }

    if(!req[objectName][fieldName].paymentID || !req[objectName][fieldName].payerID) {
        return res.status(400).json({ reason: "Missing paypal payment data" });
    }

    if(!req[objectName][fieldName].lang) {
        return res.status(400).json({ reason: "Missing language" });
    }

    if(req[objectName][fieldName].lang !== "eng" || req[objectName][fieldName].lang !== "es") {
        return res.status(400).json({ reason: "Invalid language" });
    }

    next();
};

module.exports.CheckConfirmData = (objectName, fieldName) => async (req, res, next) => {
    try {
        await CheckSponsorshipNotPaid(objectName, fieldName, "id")(req);
    } catch(errorCode) {
        return res.sendStatus(errorCode);
    }

    next();
};

module.exports.TripExists = (objectName, subobjectName, fieldName) => (req, res, next) => {
    // TODO
    next();
};
