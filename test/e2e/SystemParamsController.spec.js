const { resetDB, makeRequest, createUserAndLogin } = require("../utils");

describe("SystemParams API", () => {
    
    const testURL = "/api/v1/system-params";
    let authHeader;

    beforeEach(async () => {
        await resetDB();
        const userData = await createUserAndLogin("ADMINISTRATOR");
        authHeader = userData.authHeader;
    });

    it("Flat rate unauthorized", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .expect(401);
    });

    it("Flat rate missing value", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .set(authHeader)
            .expect(400, { reason: "Missing fields" });
    });

    it("Flat rate below minimum", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .set(authHeader)
            .query({ value: -1 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Flat rate beyond maximum", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .set(authHeader)
            .query({ value: 101 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Flat rate update", () => {
        return makeRequest()
            .put(`${testURL}/flat-rate`)
            .set(authHeader)
            .query({ value: 42 })
            .expect(200, "42");
    });

    it("Finder max results unauthorized", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .expect(401);
    });

    it("Finder max results missing value", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .set(authHeader)
            .expect(400, { reason: "Missing fields" });
    });

    it("Finder max results below minimum", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .set(authHeader)
            .query({ value: 0 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder max results beyond maximum", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .set(authHeader)
            .query({ value: 101 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder max results update", () => {
        return makeRequest()
            .put(`${testURL}/finder-max-results`)
            .set(authHeader)
            .query({ value: 42 })
            .expect(200, "42");
    });

    it("Finder results TTL unauthorized", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .expect(401);
    });

    it("Finder results TTL missing value", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .set(authHeader)
            .expect(400, { reason: "Missing fields" });
    });

    it("Finder results TTL below minimum", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .set(authHeader)
            .query({ value: 0 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder results TTL beyond maximum", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .set(authHeader)
            .query({ value: 25 })
            .expect(400, { reason: "Exceeded boundaries" });
    });

    it("Finder results TTL update", () => {
        return makeRequest()
            .put(`${testURL}/finder-results-ttl`)
            .set(authHeader)
            .query({ value: 15 })
            .expect(200, "15");
    });
});
