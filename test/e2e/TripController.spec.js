const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const TripSchema = require("../../source/models/TripSchema");
const ApplicationSchema = require("../../source/models/ApplicationSchema");
const { expect } = require("chai");

describe("Trip API", () => {
  const sampleTrips = [
    {
      title: "Best trip money can buy",
      description: "My description is short",
      requirements: ["requirement 1", "requirement 2"],
      startDate: "2024-04-23T18:25:43.511Z",
      endDate: "2025-04-23T18:25:43.511Z",
      pictures: [
        "https://www.wonderfultrips.com/uploads/8/8/0/4/88049104/smaller-girl-on-beach-with_orig.png",
        "https://www.wonderfultrips.com/uploads/8/8/0/4/88049104/shutterstock-358732994_1.jpg",
      ],
      stages: [
        {
          title: "From Paris to New York",
          description: "My description is wonderful",
          price: 124.5,
        },
        {
          title: "From New York to Spain",
          description: "My description is awful",
          price: 600,
        },
      ],
    },
    {
      title: "The second trip",
      description: "My description for second trip is",
      requirements: ["Number one"],
      startDate: "2026-04-23T18:25:43.511Z",
      endDate: "2027-04-23T18:25:43.511Z",
      pictures: [
        "https://www.wonderfultrips.com/uploads/8/8/0/4/88049104/shutterstock-358732994_1.jpg",
      ],
      stages: [
        {
          title: "From Jaen to Tunez",
          description: "Delightful sightseen",
          price: 500.5,
        },
        {
          title: "From Tunez to Alcalá de Guadaira",
          description: "Lovely mazapanes",
          price: 288,
        },
      ],
    },
  ];

  const testURL = "/api/v1/trips";
  let authHeader;
  let userID;
  let publishedID;

  var createPublished = async function (trip) {
    testTrip = trip;
    testTrip.ticker = "000000-TEST";
    testTrip.managerID = mongoose.Types.ObjectId().toHexString();
    testTrip.isPublished = true;

    return new TripSchema(testTrip).save().then((doc) => {
      publishedID = doc._id;
    });
  };

  beforeEach(async () => {
    await resetDB();
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;
    userID = userData.userID;
  });

  it("Unauthorized in GET", () => {
    return makeRequest().get(`${testURL}/manager`).expect(401);
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

  it("Unauthorized in CANCEL", () => {
    return makeRequest().delete(testURL).expect(401);
  });

  it("Unauthorized in PUBLISH", () => {
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

  it("Missing fields in SHOW", () => {
    return makeRequest()
      .get(`${testURL}/display`)
      .expect(400, { reason: "Missing fields" });
  });

  it("Missing fields in CANCEL", () => {
    return makeRequest()
      .put(`${testURL}/cancel`)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });

  it("Missing fields in PUBLISH", () => {
    return makeRequest()
      .put(`${testURL}/publish`)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });

  it("POST trip", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        expect(response.body.title).to.equal(sampleTrips[0].title);
        expect(response.body.description).to.equal(sampleTrips[0].description);
        expect(response.body.requirements[0]).to.equal(
          sampleTrips[0].requirements[0]
        );
      });
  });

  it("PUT trip", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[1] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .put(`${testURL}/${response.body._id}`)
          .set(authHeader)
          .send({ trip: sampleTrips[0] })
          .expect(200)
          .then((response) => {
            expect(response.body.title).to.equal(sampleTrips[0].title);
            expect(response.body.description).to.equal(
              sampleTrips[0].description
            );
            expect(response.body.requirements[0]).to.equal(
              sampleTrips[0].requirements[0]
            );
          });
      });
  });

  it("PUBLISH trip", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .put(`${testURL}/${response.body._id}/publish`)
          .set(authHeader)
          .expect(200);
      });
  });

  it("DELETE trip", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .delete(`${testURL}/${response.body._id}`)
          .set(authHeader)
          .expect(200)
          .then((response) => {
            return makeRequest()
              .get(`${testURL}/${response.body._id}/display/manager`)
              .set(authHeader)
              .expect(404);
          });
      });
  });

  it("CANCEL trip", async () => {
    const cancelReason = "because I want";

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .put(`${testURL}/${response.body._id}/publish`)
          .set(authHeader)
          .expect(200)
          .then((response) => {
            return makeRequest()
              .put(`${testURL}/${response.body._id}/cancel`)
              .send({ cancelReason: cancelReason })
              .set(authHeader)
              .expect(200)
              .then((response) => {
                expect(response.body.isCancelled).is.equal(true);
                expect(response.body.cancelReason).is.equal(cancelReason);
              });
          });
      });
  });

  it("GET all public trips", async () => {
    await createPublished(sampleTrips[0]);
    await createPublished(sampleTrips[1]);
    await createPublished(sampleTrips[0]);

    return makeRequest()
      .get(`${testURL}`)
      .expect(200)
      .then((response) => {
        expect(response.body.length).to.equal(3);
        expect(response.body[0].title).to.equal(sampleTrips[0].title);
        expect(response.body[1].title).to.equal(sampleTrips[1].title);
        expect(response.body[2].title).to.equal(sampleTrips[0].title);
      });
  });

  it("GET public trip", async () => {
    await createPublished(sampleTrips[0]);

    return makeRequest()
      .get(`${testURL}/${publishedID}/display`)
      .set(authHeader)
      .expect(200)
      .then((response) => {
        expect(response.body.title).to.equal(sampleTrips[0].title);
        expect(response.body.description).to.equal(sampleTrips[0].description);
        expect(response.body.requirements[0]).to.equal(
          sampleTrips[0].requirements[0]
        );
      });
  });

  it("GET my trips as manager", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .post(testURL)
          .set(authHeader)
          .send({ trip: sampleTrips[1] })
          .expect(200)
          .then((response) => {
            expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
              true
            );
            return makeRequest()
              .get(`${testURL}/manager`)
              .set(authHeader)
              .expect(200)
              .then((response) => {
                expect(response.body.length).to.equal(2);
                expect(response.body[0].title).to.equal(sampleTrips[0].title);
                expect(response.body[1].title).to.equal(sampleTrips[1].title);
              });
          });
      });
  });

  it("SEARCH trips using a keyword", async () => {
    await createPublished(sampleTrips[0]);
    await createPublished(sampleTrips[1]);
    //Only the second trip contains the word 'second' in its desciption both in title
    const keyword = "second";

    return makeRequest()
      .get(`${testURL}/search/${keyword}`)
      .set(authHeader)
      .expect(200)
      .then((response) => {
        expect(response.body.length).to.equal(1);
        expect(response.body[0].description).to.equal(
          sampleTrips[1].description
        );
        expect(response.body[0].title).to.equal(sampleTrips[1].title);
      });
  });

  it("GET my trip as manager", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .get(`${testURL}/${response.body._id}/display/manager`)
          .set(authHeader)
          .expect(200)
          .then((response) => {
            expect(response.body.title).to.equal(sampleTrips[0].title);
          });
      });
  });

  it("Trying to GET non-existent trip", () => {
    return makeRequest()
      .get(`${testURL}/${mongoose.Types.ObjectId().toHexString()}/display`)
      .set(authHeader)
      .expect(404);
  });

  it("Trying to SHOW non-published", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .get(`${testURL}/${response.body._id}/display`)
          .expect(404);
      });
  });

  it("Trying to SEARCH non-published", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .get(`${testURL}/search/${sampleTrips[0].title}`)
          .expect(200)
          .then((response) => {
            expect(response.body.length).to.equal(0);
          });
      });
  });

  it("Trying to SEARCH trips using empty keyword", async () => {
    await createPublished(sampleTrips[0]);
    await createPublished(sampleTrips[1]);

    return makeRequest()
      .get(`${testURL}/search`)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });

  it("Trying to GET unauthorized non-public trip as manager", async () => {
    const userDataAux = await createUserAndLogin("MANAGER", "aux@gmail.com");
    authHeaderAux = userDataAux.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .get(`${testURL}/${response.body._id}/display/manager`)
          .set(authHeaderAux)
          .expect(404);
      });
  });

  it("Trying to POST trip endDate before startDate", async () => {
    let trip = { ...sampleTrips[0] };
    trip.startDate = "2060-04-23T18:25:43.511Z";
    trip.endDate = "2059-04-23T18:25:43.511Z";

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: trip })
      .expect(400, { reason: "Date chosen wrongly" });
  });

  it("Trying to POST inconsistent trip", async () => {
    var tripPost = { ...sampleTrips[0] };

    const isPusblised = true;
    const isCancelled = true;
    const price = 288;
    const cancelReason = "nothing";
    const managerID = mongoose.Types.ObjectId().toHexString(123);

    tripPost.isPublished = isPusblised;
    tripPost.isCancelled = isCancelled;
    tripPost.price = price;
    tripPost.cancelReason = cancelReason;
    tripPost.managerID = managerID;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: tripPost })
      .expect(200)
      .then((response) => {
        expect(response.status, "response.status").to.equal(200);
        expect(response.body.isPublished).is.equal(false);
        expect(response.body.isCancelled).is.equal(false);
        expect(response.body.price).is.not.equal(price);
        expect(response.body.cancelReason).is.not.equal(cancelReason);
        expect(response.body.managerID).is.not.equal(managerID);
      });
  });

  it("Trying to PUT inconsistent trip", async () => {
    let trip = { ...sampleTrips[0] };

    const isPusblised = true;
    const isCancelled = true;
    const price = 288;
    const cancelReason = "nothing";
    const managerID = mongoose.Types.ObjectId().toHexString(123);

    trip.isPublished = isPusblised;
    trip.isCancelled = isCancelled;
    trip.price = price;
    trip.cancelReason = cancelReason;
    trip.managerID = managerID;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[1] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .put(`${testURL}/${response.body._id}`)
          .set(authHeader)
          .send({ trip: trip })
          .expect(200)
          .then((response) => {
            expect(response.body.isPublished).is.equal(false);
            expect(response.body.isCancelled).is.equal(false);
            expect(response.body.price).is.not.equal(price);
            expect(response.body.cancelReason).is.not.equal(cancelReason);
            expect(response.body.managerID).is.not.equal(managerID);
          });
      });
  });

  it("Trying to DELETE published trip", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .put(`${testURL}/${response.body._id}/publish`)
          .set(authHeader)
          .expect(200)
          .then((response) => {
            return makeRequest()
              .delete(`${testURL}/${response.body._id}`)
              .set(authHeader)
              .expect(400, { reason: "The trip has already been published" });
          });
      });
  });

  it("Trying to PUBLISH when startDate has expired", async () => {
    let testTrip = { ...sampleTrips[0] };
    testTrip.ticker = "000000-TEST";
    testTrip.managerID = mongoose.Types.ObjectId().toHexString();
    testTrip.isPublished = false;
    testTrip.startDate = "2000-04-23T18:25:43.511Z";

    const doc = await new TripSchema(testTrip).save();

    return makeRequest()
      .put(`${testURL}/${doc._id}/publish`)
      .set(authHeader)
      .expect(400);
  });

  it("Trying to CANCEL without reason why", async () => {
    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ trip: sampleTrips[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        return makeRequest()
          .put(`${testURL}/${response.body._id}/publish`)
          .set(authHeader)
          .expect(200)
          .then((response) => {
            return makeRequest()
              .put(`${testURL}/${response.body._id}/cancel`)
              .send({ rejectReason: "" })
              .set(authHeader)
              .expect(400, { reason: "Missing fields" });
          });
      });
  });

  it("Trying to CANCEL when trip has already started", async () => {
    let testTrip = { ...sampleTrips[0] };
    testTrip.ticker = "000000-TEST";
    testTrip.managerID = userID;
    testTrip.isPublished = true;
    testTrip.startDate = "2000-04-23T18:25:43.511Z";

    const doc = await new TripSchema(testTrip).save();

    return makeRequest()
      .put(`${testURL}/${doc._id}/cancel`)
      .send({ cancelReason: "no reason" })
      .set(authHeader)
      .expect(400, { reason: "Trip can't be cancelled" });
  });

  it("Trying to CANCEL with applications associated", async () => {
    let testTrip = { ...sampleTrips[0] };
    testTrip.ticker = "000000-TEST";
    testTrip.managerID = userID;
    testTrip.isPublished = true;

    const trip = await new TripSchema(testTrip).save();

    let testApplication = {
      status: "ACCEPTED",
      tripID: trip._id,
      comments: ["did", "nothing", "wrong"],
      explorerID: mongoose.Types.ObjectId().toHexString(),
    };

    const app = await new ApplicationSchema(testApplication).save();

    return makeRequest()
      .put(`${testURL}/${trip._id}/cancel`)
      .send({ cancelReason: "no reason" })
      .set(authHeader)
      .expect(400, { reason: "Trip has applications associated" });
  });
});
