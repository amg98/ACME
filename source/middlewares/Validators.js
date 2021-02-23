/**
 * @typedef ValidationError
 * @property {string} reason   - User-friendly reason message
 */

module.exports.Required = (objectName, fieldName) => (req, res, next) => {
    if (req[objectName] && req[objectName].hasOwnProperty(fieldName)) {
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

module.exports.CheckPaymentData = (objectName, fieldName) => (req, res, next) => {
    // TODO
};

module.exports.CheckConfirmData = (objectName, fieldName) => (req, res, next) => {
    // TODO
};
