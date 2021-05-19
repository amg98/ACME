const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const { expect } = require("chai");
const TripSchema = require("../../source/models/TripSchema");
const ApplicationSchema = require("../../source/models/ApplicationSchema");
const FinderSchema = require("../../source/models/FinderSchema");

describe("Stats API", () => {

    const testURL = "/api/v1/stats";
    let authHeader;

    const IDs = [
        mongoose.Types.ObjectId().toHexString(),
        mongoose.Types.ObjectId().toHexString(),
        mongoose.Types.ObjectId().toHexString()
    ];

    beforeEach(async () => {
        await resetDB();
        const userData = await createUserAndLogin("ADMINISTRATOR");
        authHeader = userData.authHeader;
    });

    it("Trips per manager unauthorized", () => {
        return makeRequest()
            .get(`${testURL}/trips-per-manager`)
            .expect(401);
    });

    it("Trips per manager not found", () => {
        return makeRequest()
            .get(`${testURL}/trips-per-manager`)
            .set(authHeader)
            .expect(404);
    });

    it("Applications per trip unauthorized", () => {
        return makeRequest()
            .get(`${testURL}/applications-per-trip`)
            .expect(401);
    });

    it("Applications per trip not found", () => {
        return makeRequest()
            .get(`${testURL}/applications-per-trip`)
            .set(authHeader)
            .expect(404);
    });

    it("Average price per trip unauthorized", () => {
        return makeRequest()
            .get(`${testURL}/price-per-trips`)
            .expect(401);
    });

    it("Average price per trip not found", () => {
        return makeRequest()
            .get(`${testURL}/price-per-trips`)
            .set(authHeader)
            .expect(404);
    });

    it("Applications ratio unauthorized", () => {
        return makeRequest()
            .get(`${testURL}/applications-ratio`)
            .expect(401);
    });

    it("Applications ratio not found", () => {
        return makeRequest()
            .get(`${testURL}/applications-ratio`)
            .set(authHeader)
            .expect(404);
    });

    it("Average price in finders unauthorized", () => {
        return makeRequest()
            .get(`${testURL}/avg-price-finder`)
            .expect(401);
    });

    it("Average price in finders not found", () => {
        return makeRequest()
            .get(`${testURL}/avg-price-finder`)
            .set(authHeader)
            .expect(404);
    });

    it("Top 10 keywords in finders unauthorized", () => {
        return makeRequest()
            .get(`${testURL}/top-keywords`)
            .expect(401);
    });

    it("Top 10 keywords in finders not found", () => {
        return makeRequest()
            .get(`${testURL}/top-keywords`)
            .set(authHeader)
            .expect(200, []);
    });

    it("Trips per manager OK", async () => {

        const bakeTrip = (managerID) => ({
            managerID: IDs[managerID],
            endDate: new Date("2025-04-23T18:25:43.511Z"),
            isCancelled: false,
            isPublished: true,
        });

        const trips = [
            bakeTrip(0), bakeTrip(1), bakeTrip(0),
            bakeTrip(0), bakeTrip(1), bakeTrip(1),
            bakeTrip(0), bakeTrip(2), bakeTrip(0)
        ];

        await TripSchema.collection.insertMany(trips);

        return makeRequest()
            .get(`${testURL}/trips-per-manager`)
            .set(authHeader)
            .expect(200, {
                min: 1,
                max: 5,
                avg: 3,
                stdv: 1.632993161855452
            });
    });

    it("Applications per trip OK", async () => {

        const bakeApp = (tripID) => ({
            tripId: IDs[tripID]
        });

        const apps = [
            bakeApp(0), bakeApp(1), bakeApp(0),
            bakeApp(0), bakeApp(1), bakeApp(1),
            bakeApp(0), bakeApp(2), bakeApp(0)
        ];

        await ApplicationSchema.collection.insertMany(apps);

        return makeRequest()
            .get(`${testURL}/applications-per-trip`)
            .set(authHeader)
            .expect(200, {
                min: 1,
                max: 5,
                avg: 3,
                stdv: 1.632993161855452
            });
    });

    it("Average price per trip OK", async () => {

        const bakeTrip = (price) => ({ price });

        const trips = [
            bakeTrip(10), bakeTrip(40), bakeTrip(70),
            bakeTrip(20), bakeTrip(50), bakeTrip(80),
            bakeTrip(30), bakeTrip(60), bakeTrip(90)
        ];

        await TripSchema.collection.insertMany(trips);

        return makeRequest()
            .get(`${testURL}/price-per-trips`)
            .set(authHeader)
            .expect(200, {
                min: 10,
                max: 90,
                avg: 50,
                stdv: 25.81988897471611
            });
    });

    it("Applications ratio OK", async () => {

        const bakeApp = (status) => ({ status });

        const apps = [
            bakeApp("PENDING"), bakeApp("DUE"), bakeApp("REJECTED"),
            bakeApp("REJECTED"), bakeApp("ACCEPTED"), bakeApp("CANCELLED"),
            bakeApp("DUE"), bakeApp("ACCEPTED"), bakeApp("DUE")
        ];

        await ApplicationSchema.collection.insertMany(apps);

        return makeRequest()
            .get(`${testURL}/applications-ratio`)
            .set(authHeader)
            .expect(200, {
                accepted: 2 / apps.length * 100,
                cancelled: 1 / apps.length * 100,
                due: 3 / apps.length * 100,
                pending: 1 / apps.length * 100,
                rejected: 2 / apps.length * 100,
            });
    });

    it("Applications per ratio OK with missing status", async () => {
        const bakeApp = (status) => ({ status });

        const apps = [
            bakeApp("DUE"), bakeApp("REJECTED"),
            bakeApp("REJECTED"), bakeApp("ACCEPTED"), bakeApp("CANCELLED"),
            bakeApp("DUE"), bakeApp("ACCEPTED"), bakeApp("DUE")
        ];

        await ApplicationSchema.collection.insertMany(apps);

        return makeRequest()
            .get(`${testURL}/applications-ratio`)
            .set(authHeader)
            .expect(200, {
                accepted: 2 / apps.length * 100,
                cancelled: 1 / apps.length * 100,
                due: 3 / apps.length * 100,
                pending: 0,
                rejected: 2 / apps.length * 100,
            });
    });

    it("Average price in finders OK", async () => {
        const bakeFinder = (minPrice, maxPrice) => ({ minPrice, maxPrice });

        const finders = [
            bakeFinder(0, 20), bakeFinder(20, 40), bakeFinder(10, 10),
            bakeFinder(40, 80), bakeFinder(30, 90), bakeFinder(10, 110),
            bakeFinder(20, 30), bakeFinder(40, 180), bakeFinder(55, 95)
        ];

        await FinderSchema.collection.insertMany(finders);

        return makeRequest()
            .get(`${testURL}/avg-price-finder`)
            .set(authHeader)
            .expect(200, {
                maxPrice: 72.77777777777777,
                minPrice: 25
            });
    });

    it("Top 10 keywords in finders OK", async () => {

        const finders = [];
        const addKeywordSearch = (keyword, times) => {
            for(let i = 0; i < times; i++) {
                finders.push({ keyword });
            }
        }

        const searchData = [
            { keyword: "a", times: 100 },
            { keyword: "b", times: 90 },
            { keyword: "c", times: 80 },
            { keyword: "d", times: 70 },
            { keyword: "e", times: 60 },
            { keyword: "f", times: 50 },
            { keyword: "g", times: 40 },
            { keyword: "h", times: 30 },
            { keyword: "i", times: 20 },
            { keyword: "j", times: 10 },
            { keyword: "k", times: 5 },
        ];

        searchData.forEach(v => addKeywordSearch(v.keyword, v.times));
        
        await FinderSchema.collection.insertMany(finders);

        return makeRequest()
            .get(`${testURL}/top-keywords`)
            .set(authHeader)
            .expect(200, [
                { keyword: 'a', count: 100 },
                { keyword: 'b', count: 90 },
                { keyword: 'c', count: 80 },
                { keyword: 'd', count: 70 },
                { keyword: 'e', count: 60 },
                { keyword: 'f', count: 50 },
                { keyword: 'g', count: 40 },
                { keyword: 'h', count: 30 },
                { keyword: 'i', count: 20 },
                { keyword: 'j', count: 10 }
            ]);
    });
});
