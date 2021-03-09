const request = require("supertest");
const mongoose = require("mongoose");
const SystemParamsSchema = require("../source/models/SystemParamSchema");
const ActorSchema = require("../source/models/ActorSchema");
const Bcrypt = require("bcryptjs");

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

module.exports.createUserAndLogin = async (role) => {

    const testUserEmail = "testuser@testuser.com";
    const testUserPassword = "ilovesalsa";
    const testUserPasswordHashed = Bcrypt.hashSync(testUserPassword, 10);

    await ActorSchema.insertMany([{
        name: "testuser",
        surname: "testuser",
        email: testUserEmail,
        password: testUserPasswordHashed,
        roles: [role]
    }]);

    let response = await request(`http://localhost:${process.env.PORT}`)
        .post("/api/v1/auth/login")
        .send({
            email: testUserEmail,
            password: testUserPassword
        });

    const userID = response.body.actor._id;

    response = await request(`http://localhost:${process.env.PORT}`)
        .get(`/api/v1/auth/custom/${response.body.customToken}`);

    return {
        authHeader: { Authorization: `Bearer ${response.body.idToken}` },
        userID,
    };
};
