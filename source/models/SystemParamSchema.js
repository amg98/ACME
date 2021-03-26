const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SystemParamSchema = new Schema({
    _id: String,
    value: Schema.Types.Mixed,
});

module.exports = mongoose.model("systemparams", SystemParamSchema);
