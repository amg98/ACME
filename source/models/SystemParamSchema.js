const Schema = require("mongoose").Schema;

const SystemParamSchema = new Schema({
    _id: String,
    value: Schema.Types.Mixed,
});

SystemParamSchema.pre("save", (next) => {
    this._id = this._id.toString();
    next();
});

module.exports = mongoose.model("SystemParam", SystemParamSchema);
