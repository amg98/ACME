const { resetDB, makeRequest } = require("../utils");
const mongoose = require("mongoose");
const { expect } = require("chai");

describe("Sponsorship API", () => {

    const sampleSponsorship = [
        {
            bannerURL: "https://google.es",
            landingPageURL: "https://google.es",
            tripID: mongoose.Types.ObjectId().toHexString()
        },
        {
            bannerURL: "https://facebook.es",
            landingPageURL: "https://facebook.es",
            tripID: mongoose.Types.ObjectId().toHexString()
        }
    ];

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

    it("Get missing sponsorship", () => {
        return makeRequest()
            .get(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
            .expect(404);
    });

    it("Correct read only one", async () => {
        return makeRequest()
            .post(testURL)
            .send({ sponsorship: sampleSponsorship[0] })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                return makeRequest()
                    .get(`${testURL}/${response.body}`)
                    .expect(200);
            })
            .then(response => {
                expect(response.body.bannerURL).to.equal(sampleSponsorship[0].bannerURL);
                expect(response.body.landingPageURL).to.equal(sampleSponsorship[0].landingPageURL);
                expect(response.body.tripID).to.equal(sampleSponsorship[0].tripID);
                expect(response.body.isPaid).to.equal(false);
            });
    });

    it("Correct read all sponsorships", () => {
        return makeRequest()
            .post(testURL)
            .send({ sponsorship: sampleSponsorship[0] })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                return makeRequest()
                    .post(testURL)
                    .send({ sponsorship: sampleSponsorship[0] })
                    .expect(200)
            })
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                return makeRequest()
                    .get(testURL)
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).to.equal(2);
                response.body.forEach((entry, i) => {
                    expect(response.body[i].bannerURL).to.equal(sampleSponsorship[0].bannerURL);
                    expect(response.body[i].landingPageURL).to.equal(sampleSponsorship[0].landingPageURL);
                    expect(response.body[i].tripID).to.equal(sampleSponsorship[0].tripID);
                    expect(response.body[i].isPaid).to.equal(false);
                })
            });
    });

    it("Trying to POST with isPaid", () => {
        return makeRequest()
            .post(testURL)
            .send({
                sponsorship: {
                    ...sampleSponsorship[0],
                    isPaid: true
                }
            })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                return makeRequest()
                    .get(`${testURL}/${response.body}`)
                    .expect(200);
            })
            .then(response => {
                expect(response.body.bannerURL).to.equal(sampleSponsorship[0].bannerURL);
                expect(response.body.landingPageURL).to.equal(sampleSponsorship[0].landingPageURL);
                expect(response.body.tripID).to.equal(sampleSponsorship[0].tripID);
                expect(response.body.isPaid).to.equal(false);
            });
    });

    it("Correct sponsorship delete", () => {
        let sponsorshipID;
        return makeRequest()
            .post(testURL)
            .send({ sponsorship: sampleSponsorship[0] })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                sponsorshipID = response.body;
                return makeRequest()
                    .get(testURL)
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).to.equal(1);
                return makeRequest()
                    .delete(`${testURL}/${sponsorshipID}`)
                    .expect(200);
            })
            .then(response => {
                expect(response.body.bannerURL).to.equal(sampleSponsorship[0].bannerURL);
                expect(response.body.landingPageURL).to.equal(sampleSponsorship[0].landingPageURL);
                expect(response.body.tripID).to.equal(sampleSponsorship[0].tripID);
                expect(response.body.isPaid).to.equal(false);
                return makeRequest()
                    .get(testURL)
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).to.equal(0);
            })
    });

    it("Correct sponsorship edit", () => {
        const newBannerURL = "https://tuenti.com";
        return makeRequest()
            .post(testURL)
            .send({ sponsorship: sampleSponsorship[0] })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                return makeRequest()
                    .put(`${testURL}/${response.body}`)
                    .send({
                        sponsorship: {
                            bannerURL: newBannerURL
                        }
                    })
                    .expect(200)
            })
            .then(response => {
                expect(response.body.bannerURL).to.equal(newBannerURL);
                return makeRequest()
                    .get(testURL)
                    .expect(200);
            })
            .then(response => {
                expect(response.body.length).to.equal(1);
            });
    });

    it("Trying to edit isPaid", () => {
        return makeRequest()
            .post(testURL)
            .send({ sponsorship: sampleSponsorship[0] })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                return makeRequest()
                    .put(`${testURL}/${response.body}`)
                    .send({
                        sponsorship: {
                            isPaid: true
                        }
                    })
                    .expect(200)
            })
            .then(response => {
                expect(response.body.isPaid).to.equal(false);
            });
    });

    it("Trying to edit sponsorID", () => {
        const newSponsorID = mongoose.Types.ObjectId().toHexString(123);
        return makeRequest()
            .post(testURL)
            .send({ sponsorship: sampleSponsorship[0] })
            .expect(200)
            .then(response => {
                expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
                return makeRequest()
                    .put(`${testURL}/${response.body}`)
                    .send({
                        sponsorship: {
                            sponsorID: newSponsorID
                        }
                    })
                    .expect(200)
            })
            .then(response => {
                expect(response.body.sponsorID).not.to.be.equal(newSponsorID);
            });
    });
});
