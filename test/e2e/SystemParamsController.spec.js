const { resetDB, makeRequest } = require("../utils");

describe("SystemParams API", () => {
    
    const testURL = "/api/v1/system-params";

    beforeEach(resetDB);

    it("Flat rate missing value", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .expect(400, { reason: "Missing fields" });
    });

    it("Flat rate below minimum", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .query({ value: -1 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Flat rate beyond maximum", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .query({ value: 101 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Flat rate update", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .query({ value: 42 })
            .expect(200, "42");
    });

    it("Finder max results missing value", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .expect(400, { reason: "Missing fields" });
    });

    it("Finder max results below minimum", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .query({ value: 0 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder max results beyond maximum", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .query({ value: 101 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder max results update", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .query({ value: 42 })
            .expect(200, "42");
    });

    it("Finder results TTL missing value", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .expect(400, { reason: "Missing fields" });
    });

    it("Finder results TTL below minimum", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .query({ value: 0 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder results TTL beyond maximum", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .query({ value: 25 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder results TTL update", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .query({ value: 15 })
            .expect(200, "15");
    });
});
