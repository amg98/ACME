const { CheckAdmin } = require("../middlewares/Auth");
const Validators = require("../middlewares/Validators");
const SystemParamsSchema = require("../models/SystemParamSchema");

const setSystemParam = (paramName) => async (req, res) => {
    try {
        let doc = await SystemParamsSchema.findOneAndUpdate({ _id: paramName }, { value: req.query.value });
        if (!doc) return res.sendStatus(401);
        doc = await SystemParamsSchema.findById(doc._id);
        res.status(200).send(doc.value.toString());
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
}

const getSystemParam = (paramName) => async () => {
    const doc = await SystemParamsSchema.findById(paramName);
    if (doc) {
        return doc.value;
    } else {
        throw `Error reading system param: ${paramName}`;
    }
};

const SystemParams = {
    FlatRate: {
        name: "flat-rate",
        validators: [Validators.Range("query", "value", 0, 100)]
    },
    FinderMaxResults: {
        name: "finder-max-results",
        validators: [Validators.Range("query", "value", 1, 100)]
    },
    FinderResultsTTL: {
        name: "finder-results-ttl",
        validators: [Validators.Range("query", "value", 1, 24)]
    }
};

module.exports.getFlatRate = getSystemParam(SystemParams.FlatRate.name);
module.exports.getFinderMaxResults = getSystemParam(SystemParams.FinderMaxResults.name);
module.exports.getFinderResultsTTL = getSystemParam(SystemParams.FinderResultsTTL.name);

module.exports.initialize = async () => {
    if (process.env.NODE_ENV !== "test") {
        try {
            await new SystemParamsSchema({ _id: SystemParams.FlatRate.name, value: 80 }).save();
            await new SystemParamsSchema({ _id: SystemParams.FinderMaxResults.name, value: 10 }).save();
            await new SystemParamsSchema({ _id: SystemParams.FinderResultsTTL.name, value: 1 }).save();
            console.log("[INFO] Created system params with default values");
        } catch (err) { }
    }
};

module.exports.register = (apiPrefix, router) => {
    Object.entries(SystemParams).forEach(([key, systemParam]) => {
        router.put(`${apiPrefix}/system-params/${systemParam.name}`,
            CheckAdmin,
            Validators.Required("query", "value"),
            ...systemParam.validators,
            setSystemParam(systemParam.name));
    });
};

/**
 * Set the flat rate for sponsorships
 * @route PUT /system-params/flat-rate
 * @group System params - Global system parameters
 * @param {number} value.query.required         - Flat rate value to be set
 * @returns {number}                200 - Returns the current state for the flat rate
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */

/**
 * Set the maximum number of results to be returned from a finder
 * @route PUT /system-params/finder-max-results
 * @group System params - Global system parameters
 * @param {integer} value.query.required         - Finder max results value to be set
 * @returns {integer}               200 - Returns the current state for the finder max results
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */

/**
 * Set the time-to-live for the finder results
 * @route PUT /system-params/finder-results-ttl
 * @group System params - Global system parameters
 * @param {integer} value.query.required         - TTL value to be set
 * @returns {integer}               200 - Returns the current state for the TTL
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
