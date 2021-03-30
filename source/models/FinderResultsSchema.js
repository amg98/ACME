const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TripSchema = require("./TripSchema").schema;
const systemParamsController = require("../routes/SystemParamsController");

let resultsTTL = 1;

resultTTL = systemParamsController.getFinderResultsTTL();

const FinderResultsSchema = new Schema({
    results: {
        type: [TripSchema],
        default: [],
    },
    createdAt: { type: Date, expires: String(resultsTTL)+'h', default: Date.now }

});

module.exports = mongoose.model("FinderResults", FinderResultsSchema)
