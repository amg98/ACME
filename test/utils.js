const request = require("supertest");

module.exports.makeRequest = () => request(`http://localhost:${process.env.PORT}`);
