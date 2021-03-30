const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set("useCreateIndex", true);

const tstamp = { timestamps: { createdAt: "timeStamp" } };

const TripSchema = new Schema(
  {
    managerID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    ticker: {
      type: String,
      required: [true],
      validate: {
        validator: function (v) {
          return /(\d{6})-([A-Z]{4})/.test(v);
        },
        message: "The ticker format is not valid",
      },
      //unique: true,
    },
    title: {
      type: String,
      required: [true],
    },
    description: Schema.Types.String,
    requirements: [String],
    startDate: {
      type: Date,
      required: [true],
    },
    endDate: {
      type: Date,
      required: [true],
    },
    pictures: [String],
    cancelReason: {
      type: String,
      default: "",
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: [0],
      default: function () {
        return this.stages.reduce(function (acc, val) {
          return acc + val.price;
        }, 0);
      },
    },
    stages: [
      {
        title: {
          type: String,
          required: [true],
        },
        description: {
          type: String,
          required: [true],
        },
        price: {
          type: Number,
          required: [true],
          min: [0],
        },
      },
    ],
  },
  tstamp
);

module.exports = mongoose.model("Trip", TripSchema);
