const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const POISchema = new Schema(
    {
        title: {
            type: String,
            required: [true],
        },
        description: {
            type: String,
            required: [true],
        },
        coordinates: {
            type: String,
        },
        type: {
            type: String,
        },
    }
);

module.exports = mongoose.model("POI", POISchema);
