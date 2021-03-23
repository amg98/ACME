const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const TripSchema = require("../../source/models/TripSchema");
const SponsorshipSchema = require("../../source/models/SponsorshipSchema");
const { expect } = require("chai");

describe("Sponsorship API", () => {
  const sampleTrip = {
    _id: mongoose.Types.ObjectId().toHexString(),
    managerID: mongoose.Types.ObjectId().toHexString(),
    title: "Excursion",
    startDate: Date.now(),
    endDate: Date.now(),
    ticker: "111111-AAAA",
    stages: [],
  };

  const sampleSponsorship = [
    {
      bannerURL: "https://google.es",
      landingPageURL: "https://google.es",
      tripID: sampleTrip._id,
    },
    {
      bannerURL: "https://facebook.es",
      landingPageURL: "https://facebook.es",
      tripID: sampleTrip._id,
    },
  ];

  const testURL = "/api/v1/sponsorships";
  let authHeader;

  beforeEach(async () => {
    await resetDB();
    await TripSchema.insertMany([sampleTrip]);
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;
  });

  it("Unauthorized in GET", () => {
    return makeRequest().get(testURL).expect(401);
  });

  it("Unauthorized in POST", () => {
    return makeRequest().post(testURL).expect(401);
  });

  it("Unauthorized in PUT", () => {
    return makeRequest().put(testURL).expect(401);
  });

  it("Unauthorized in DELETE", () => {
    return makeRequest().delete(testURL).expect(401);
  });

  it("Missing fields in POST", () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });

  it("Missing fields in PUT", () => {
    return makeRequest()
      .put(testURL)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });

  it("Missing fields in DELETE", () => {
    return makeRequest()
      .delete(testURL)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });

  it("Get missing sponsorship", () => {
    return makeRequest()
      .get(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
      .set(authHeader)
      .expect(404);
  });

  it("Correct read only one", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ sponsorship: sampleSponsorship[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest()
          .get(`${testURL}/${response.body}`)
          .set(authHeader)
          .expect(200);
      })
      .then((response) => {
        expect(response.body.bannerURL).to.equal(
          sampleSponsorship[0].bannerURL
        );
        expect(response.body.landingPageURL).to.equal(
          sampleSponsorship[0].landingPageURL
        );
        expect(response.body.tripID).to.equal(sampleSponsorship[0].tripID);
        expect(response.body.isPaid).to.equal(false);
      });
  });

  it("Correct read all sponsorships", () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ sponsorship: sampleSponsorship[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest()
          .post(testURL)
          .set(authHeader)
          .send({ sponsorship: sampleSponsorship[0] })
          .expect(200);
      })
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest().get(testURL).set(authHeader).expect(200);
      })
      .then((response) => {
        expect(response.body.length).to.equal(2);
        response.body.forEach((entry, i) => {
          expect(response.body[i].bannerURL).to.equal(
            sampleSponsorship[0].bannerURL
          );
          expect(response.body[i].landingPageURL).to.equal(
            sampleSponsorship[0].landingPageURL
          );
          expect(response.body[i].tripID).to.equal(sampleSponsorship[0].tripID);
          expect(response.body[i].isPaid).to.equal(false);
        });
      });
  });

  it("Trying to POST with missing tripID", () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({
        sponsorship: {
          ...sampleSponsorship[0],
          tripID: mongoose.Types.ObjectId().toHexString(),
        },
      })
      .expect(422);
  });

  it("Trying to POST with isPaid", () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({
        sponsorship: {
          ...sampleSponsorship[0],
          isPaid: true,
        },
      })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest()
          .get(`${testURL}/${response.body}`)
          .set(authHeader)
          .expect(200);
      })
      .then((response) => {
        expect(response.body.bannerURL).to.equal(
          sampleSponsorship[0].bannerURL
        );
        expect(response.body.landingPageURL).to.equal(
          sampleSponsorship[0].landingPageURL
        );
        expect(response.body.tripID).to.equal(sampleSponsorship[0].tripID);
        expect(response.body.isPaid).to.equal(false);
      });
  });

  it("Correct sponsorship delete", () => {
    let sponsorshipID;
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ sponsorship: sampleSponsorship[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        sponsorshipID = response.body;
        return makeRequest().get(testURL).set(authHeader).expect(200);
      })
      .then((response) => {
        expect(response.body.length).to.equal(1);
        return makeRequest()
          .delete(`${testURL}/${sponsorshipID}`)
          .set(authHeader)
          .expect(200);
      })
      .then((response) => {
        expect(response.body.bannerURL).to.equal(
          sampleSponsorship[0].bannerURL
        );
        expect(response.body.landingPageURL).to.equal(
          sampleSponsorship[0].landingPageURL
        );
        expect(response.body.tripID).to.equal(sampleSponsorship[0].tripID);
        expect(response.body.isPaid).to.equal(false);
        return makeRequest().get(testURL).set(authHeader).expect(200);
      })
      .then((response) => {
        expect(response.body.length).to.equal(0);
      });
  });

  it("Correct sponsorship edit", () => {
    const newBannerURL = "https://tuenti.com";
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ sponsorship: sampleSponsorship[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest()
          .put(`${testURL}/${response.body}`)
          .set(authHeader)
          .send({
            sponsorship: {
              bannerURL: newBannerURL,
            },
          })
          .expect(200);
      })
      .then((response) => {
        expect(response.body.bannerURL).to.equal(newBannerURL);
        return makeRequest().get(testURL).set(authHeader).expect(200);
      })
      .then((response) => {
        expect(response.body.length).to.equal(1);
      });
  });

  it("Trying to edit with missing tripID", () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ sponsorship: sampleSponsorship[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest()
          .put(`${testURL}/${response.body}`)
          .set(authHeader)
          .send({
            sponsorship: {
              tripID: mongoose.Types.ObjectId().toHexString(),
            },
          })
          .expect(422);
      });
  });

  it("Trying to edit isPaid", () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ sponsorship: sampleSponsorship[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest()
          .put(`${testURL}/${response.body}`)
          .set(authHeader)
          .send({
            sponsorship: {
              isPaid: true,
            },
          })
          .expect(200);
      })
      .then((response) => {
        expect(response.body.isPaid).to.equal(false);
      });
  });

  it("Trying to edit sponsorID", () => {
    const newSponsorID = mongoose.Types.ObjectId().toHexString(123);
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ sponsorship: sampleSponsorship[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
        return makeRequest()
          .put(`${testURL}/${response.body}`)
          .set(authHeader)
          .send({
            sponsorship: {
              sponsorID: newSponsorID,
            },
          })
          .expect(200);
      })
      .then((response) => {
        expect(response.body.sponsorID).not.to.be.equal(newSponsorID);
      });
  });

  it("Get random sponsorship for trip", async () => {
    const tripID = mongoose.Types.ObjectId();
    await TripSchema.collection.insertOne({
      _id: tripID,
    });

    const bakeSShip = (id) => ({
      tripID: tripID,
      bannerURL: `https://${id}.com`,
      landingPageURL: `https://${id}.com`,
      isPaid: true,
    });

    const sponsorships = [];
    for (let i = 0; i < 10; i++) {
      sponsorships.push(bakeSShip(i));
    }

    await SponsorshipSchema.collection.insertMany(sponsorships);

    return makeRequest()
      .get(`/api/v1/trips/${tripID.toHexString()}/random-sponsorship`)
      .expect(200);
  });

  it("Missing tripID for random sponsorship", () => {
    return makeRequest()
      .get(`/api/v1/trips/${mongoose.Types.ObjectId()}/random-sponsorship`)
      .expect(404)
      .then(() => {
        return makeRequest()
          .get(`/api/v1/trips/random-sponsorship`)
          .expect(404);
      })
      .then(() => {
        return makeRequest()
          .get(`/api/v1/trips/123/random-sponsorship`)
          .expect(500, { reason: "Database error" });
      });
  });
});
