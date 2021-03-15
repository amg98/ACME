const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const TripSchema = require("../../source/models/TripSchema");
const { expect } = require("chai");
const { deleteOne } = require("../../source/models/TripSchema");

describe.only("Trip API", () => {
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
  });

  it("Unauthorized in GET", () => {
    return makeRequest().get(`${testURL}/logged`).expect(401);
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

  it("Show non-existent trip", () => {
    return makeRequest()
      .get(`${testURL}/display/${mongoose.Types.ObjectId().toHexString()}`)
      .set(authHeader)
      .expect(404);
  });

  it("Show public trip", async () => {
    await createPublished(sampleTrips[0]);

    return makeRequest()
      .get(`${testURL}/display/${publishedID}`)
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

  it("Search trips using empty keyword", async () => {
    await createPublished(sampleTrips[0]);
    await createPublished(sampleTrips[1]);

    return makeRequest()
      .get(`${testURL}/search`)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });

  it("Search trips using a keyword", async () => {
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

  it("Show non-public trip as manager", async () => {
    await createPublished(sampleTrips[0]);

    return makeRequest()
      .get(`${testURL}/display/${publishedID}`)
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

  it("Unauthorized show non-public trip as manager", async () => {
    await createPublished(sampleTrips[0]);

    return makeRequest()
      .get(`${testURL}/display/${publishedID}`)
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
});
