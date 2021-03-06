const mongoose = require("mongoose");

const Schema = mongoose.Schema;
mongoose.set("useCreateIndex", true);

const ApplicationSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "REJECTED", "DUE", "ACCEPTED", "CANCELLED"],
      default: "PENDING",
      required: [true],
    },
    comments: Schema.Types.Array,
    rejectReason: Schema.Types.String,
    explorerID: Schema.Types.ObjectId,
    tripID: Schema.Types.ObjectId,
  },
  {
    timestamps: {
      createdAt: "timeStamp",
    },
  }
);

module.exports = mongoose.model("Application", ApplicationSchema);
