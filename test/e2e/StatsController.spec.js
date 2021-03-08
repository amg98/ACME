const { resetDB, makeRequest } = require("../utils");
const mongoose = require("mongoose");
const { expect } = require("chai");

describe("Stats API", () => {

    const testURL = "/api/v1/stats";

    beforeEach(resetDB);

    it("Trips per manager not found", () => {
        // TODO
    });

    it("Trips per manager OK", () => {
        // TODO
    });

    it("Applications per trip not found", () => {
        // TODO
    });

    it("Applications per trip OK", () => {
        // TODO
    });

    it("Average price per trip not found", () => {
        // TODO
    });

    it("Average price per trip OK", () => {
        // TODO
    });

    it("Applications ratio not found", () => {
        // TODO
    });

    it("Applications ratio OK", () => {
        // TODO
    });

    it("Average price in finders not found", () => {
        // TODO
    });

    it("Average price in finders OK", () => {
        // TODO
    });

    it("Top 10 keywords in finders not found", () => {
        // TODO
    });

    it("Top 10 keywords in finders OK", () => {
        // TODO
    });
});
