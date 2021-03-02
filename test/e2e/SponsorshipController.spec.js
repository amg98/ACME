const { resetDB, makeRequest } = require("../utils");

describe("Sponsorship API", () => {

    const testURL = "/api/v1/sponsorships";

    beforeEach(resetDB);

    it("Missing fields in POST", () => {
        return makeRequest()
            .post(testURL)
            .expect(400, { reason: "Missing fields" });
    });

    it("Missing fields in PUT", () => {
        return makeRequest()
            .put(testURL)
            .expect(400, { reason: "Missing fields" });
    });

    it("Missing fields in DELETE", () => {
        return makeRequest()
            .delete(testURL)
            .expect(400, { reason: "Missing fields" });
    });

    it("Correct read only one", () => {

    });

    it("Correct read all sponsorships", () => {

    });

    it("Get missing sponsorship", () => {

    });

    it("Trying to POST with isPaid", () => {

    });

    it("Trying to change sponsorID", () => {

    });

    it("Trying to edit isPaid", () => {

    });

    it("Trying to edit foreign sponsorship", () => {

    });

    it("Trying to delete foreign sponsorship", () => {

    });

    it("Correct sponsorship edit", () => {

    });

    it("Correct sponsorship delete", () => {

    });
});
