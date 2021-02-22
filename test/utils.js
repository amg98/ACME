const request = require("supertest");
const mongoose = require("mongoose");
const SystemParamsSchema = require("../source/models/SystemParamSchema");

module.exports.makeRequest = () => request(`http://localhost:${process.env.PORT}`);

module.exports.resetDB = async () => {
    await mongoose.connection.dropDatabase();
    await SystemParamsSchema.insertMany([
        {
            _id: "flat-rate",
            value: 10,
        },
        {
            _id: "finder-max-results",
            value: 10,
        },
        {
            _id: "finder-results-ttl",
            value: 1,
        }
    ]);
};
