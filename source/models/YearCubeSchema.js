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
    }, 
    computedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("YearCube", YearCubeSchema);