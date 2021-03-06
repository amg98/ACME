const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YearCubeSchema = new Schema({
    amount: {
        type: Number,
        min: 0
    },
    year: {
        type: Number,
        min: 1,
        max: 3
    },
    explorerID: {
        type: Schema.Types.ObjectId,
        required: true,
    }
});

module.exports = mongoose.model("YearCube", YearCubeSchema);