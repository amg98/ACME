const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const { expect } = require("chai");
const SponsorshipSchema = require("../../source/models/SponsorshipSchema");

describe("Sponsorship payments API", () => {

    let testSponsorship = {
        bannerURL: "https://google.es",
        landingPageURL: "https://google.es",
        sponsorID: 0,
        tripID: mongoose.Types.ObjectId().toHexString()
    };

    let testSponsorshipID;
    let authHeader;

    const testURL = "/api/v1/sponsorships";

    beforeEach(async () => {
        await resetDB();
        const userData = await createUserAndLogin("SPONSOR");
        authHeader = userData.authHeader;
        testSponsorship.sponsorID = userData.userID;
        return new SponsorshipSchema(testSponsorship)
            .save()
            .then((doc) => {
                testSponsorshipID = doc._id;
            });
    });

    it("Unauthorized in /payment", () => {
        return makeRequest()
            .post(`${testURL}/payment`)
            .expect(401);
    });

    it("Missing fields in /payment", () => {
        return makeRequest()
            .post(`${testURL}/payment`)
            .set(authHeader)
            .expect(400, { reason: "Missing fields" })
            .then(() => {
                return makeRequest()
                    .post(`${testURL}/payment`)
                    .set(authHeader)
                    .send({
                        paymentData: {}
                    })
                    .expect(400, { reason: "Missing sponsorship ID" });
            })
            .then(() => {
                return makeRequest()
                    .post(`${testURL}/payment`)
                    .set(authHeader)
                    .send({
                        paymentData: {
                            id: testSponsorshipID,
                            successURL: "http://success.com"
                        }
                    })
                    .expect(400, { reason: "Missing success/cancel URL" });
            })
            .then(() => {
                return makeRequest()
                    .post(`${testURL}/payment`)
                    .set(authHeader)
                    .send({
                        paymentData: {
                            id: testSponsorshipID,
                            successURL: "http://success.com",
                            cancelURL: "http://cancel.com"
                        }
                    })
                    .expect(400, { reason: "Missing language" });
            })
            .then(() => {
                return makeRequest()
                    .post(`${testURL}/payment`)
                    .set(authHeader)
                    .send({
                        paymentData: {
                            id: testSponsorshipID,
                            successURL: "http://success.com",
                            cancelURL: "http://cancel.com",
                            lang: "random"
                        }
                    })
                    .expect(400, { reason: "Invalid language" });
            });
    });

    it("Wrong sponsorshipID in /payment", () => {
        return makeRequest()
            .post(`${testURL}/payment`)
            .set(authHeader)
            .send({
                paymentData: {
                    id: mongoose.Types.ObjectId().toHexString(),
                    successURL: "http://success.com",
                    cancelURL: "http://cancel.com",
                    lang: "eng"
                }
            })
            .expect(404);
    });

    it("Correct payment creation", () => {
        return makeRequest()
            .post(`${testURL}/payment`)
            .set(authHeader)
            .send({
                paymentData: {
                    id: testSponsorshipID,
                    successURL: "http://success.com",
                    cancelURL: "http://cancel.com",
                    lang: "es"
                }
            })
            .expect(200);
    }).timeout(10000);

    it("Unauthorized in /payment-confirm", () => {
        return makeRequest()
            .post(`${testURL}/payment-confirm`)
            .expect(401);
    });

    it("Missing fields in /payment-confirm", () => {
        return makeRequest()
            .post(`${testURL}/payment-confirm`)
            .set(authHeader)
            .expect(400, { reason: "Missing fields" })
            .then(() => {
                return makeRequest()
                    .post(`${testURL}/payment-confirm`)
                    .set(authHeader)
                    .send({
                        confirmData: {
                            id: testSponsorshipID
                        }
                    })
                    .expect(400, { reason: "Missing paypal payment data" })
            })
            .then(() => {
                return makeRequest()
                    .post(`${testURL}/payment-confirm`)
                    .set(authHeader)
                    .send({
                        confirmData: {
                            id: testSponsorshipID,
                            payerID: "123"
                        }
                    })
                    .expect(400, { reason: "Missing paypal payment data" })
            })
            .then(() => {
                return makeRequest()
                    .post(`${testURL}/payment-confirm`)
                    .set(authHeader)
                    .send({
                        confirmData: {
                            id: testSponsorshipID,
                            paymentID: "123"
                        }
                    })
                    .expect(400, { reason: "Missing paypal payment data" })
            });
    });

    it("Wrong sponsorshipID in /payment-confirm", () => {
        return makeRequest()
            .post(`${testURL}/payment-confirm`)
            .set(authHeader)
            .send({
                confirmData: {
                    id: mongoose.Types.ObjectId().toHexString(),
                    payerID: "123",
                    paymentID: "123"
                }
            })
            .expect(404);
    });

    it("Wrong payment confirmation", () => {
        return makeRequest()
            .post(`${testURL}/payment-confirm`)
            .set(authHeader)
            .send({
                confirmData: {
                    id: testSponsorshipID,
                    payerID: "123",
                    paymentID: "123"
                }
            })
            .expect(500, { reason: "Payment error" });
    }).timeout(10000);

    // Can't test payment execution because we need to perform the payment in a web
    // browser in order to get a proper paymentID and payerID
    // It should better be tested in frontend
});
