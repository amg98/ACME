const request = require("supertest");
const mongoose = require("mongoose");
const SystemParamsSchema = require("../source/models/SystemParamSchema");
const ActorSchema = require("../source/models/ActorSchema");
const Bcrypt = require("bcryptjs");

module.exports.makeRequest = () =>
  request(`http://localhost:${process.env.PORT}`);

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
    },
  ]);
};

module.exports.createUserAndLogin = async (
  role,
  email = "testuser@testuser.com"
) => {
  const testUserEmail = email;
  const testUserPassword = "ilovesalsa";
  const testUserPasswordHashed = Bcrypt.hashSync(testUserPassword, 10);

  await ActorSchema.insertMany([
    {
      name: "testuser",
      surname: "testuser",
      email: testUserEmail,
      password: testUserPasswordHashed,
      roles: [role],
    },
  ]);

  let response = await request(`http://localhost:${process.env.PORT}`)
    .post("/api/v1/auth/login")
    .send({
      email: testUserEmail,
      password: testUserPassword,
    });

  const userID = response.body.actor._id;

  response = await request(`http://localhost:${process.env.PORT}`).get(
    `/api/v1/auth/custom/${response.body.customToken}`
  );

  return {
    authHeader: { Authorization: `Bearer ${response.body.idToken}` },
    userID,
  };
};

module.exports.createSampleUserAndLogin = async (
  user
) => {
  const testUserPasswordHashed = Bcrypt.hashSync(user["password"], 10);
  
  await ActorSchema.insertMany([
    {
      name: user["name"],
      surname: user["surname"],
      email: user["email"],
      phoneNumber: user["phoneNumber"],
      address: user["address"],
      isbanned: user["isBanned"],
      password: testUserPasswordHashed,
      roles: user["role"]
    },
  ]);

  let response = await request(`http://localhost:${process.env.PORT}`)
    .post("/api/v1/auth/login")
    .send({
      email: user["email"],
      password: user["password"],
    });

  const userID = response.body.actor._id;

  response = await request(`http://localhost:${process.env.PORT}`).get(
    `/api/v1/auth/custom/${response.body.customToken}`
  );

  return {
    authHeader: { Authorization: `Bearer ${response.body.idToken}` },
    userID,
  };
};
