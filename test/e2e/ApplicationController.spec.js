const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const ApplicationSchema = require("../../source/models/ApplicationSchema");
const TripSchema = require("../../source/models/TripSchema");

const { expect } = require("chai");

describe("Application API", () => {
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
      }
    ];

    const sampleApplications = [
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
      }
    ];



    const testURL = "/api/v1/applications";
    let authHeader;
    let testApplicationID;

    let testApplication =  {
      status: "DUE",
      comments: ["One comment"],
      rejectReason: "",
      explorerID: 0,
      tripID: mongoose.Types.ObjectId().toHexString(),
    }

    var createPublished = async function (trip) {
      testTrip = trip;
      testTrip.ticker = "000000-TEST";
      testTrip.managerID = mongoose.Types.ObjectId().toHexString();
      testTrip.isPublished = true;
  
      let published = await new TripSchema(testTrip).save();

      return published._id
    };
  

    var createApplication = async function (tripID) {
      let testApplication = {};

      testApplication.tripID = tripID;
      testApplication.explorerID = mongoose.Types.ObjectId().toHexString();
      
      let application = await new ApplicationSchema(testApplication).save();

      return application._id;
    };

    beforeEach(async () => {
      await resetDB();
    });

    it("Unauthorized in GET", () => {
      return makeRequest().get(testURL).expect(401);
    });
  
    it("Unauthorized in GET by TripID", () => {
       return makeRequest().get(`${testURL}/trips`).expect(401);
    });

    it("Unauthorized in GET by ExplorerID", () => {
        return makeRequest().get(`${testURL}/explorers`).expect(401);
    });
 
    it("Unauthorized in POST", () => {
        return makeRequest().post(testURL).expect(401);
    });
  
    it("Unauthorized in PUT", () => {
      return makeRequest().put(testURL).expect(401);
    });
  
    it("Unauthorized in EXPLORER CANCEL", () => {
      return makeRequest().put(`${testURL}/id/cancel`).expect(401);
    });
  
    it("Unauthorized in MANAGER UPDATE", () => {
        return makeRequest().put(`${testURL}/id/update`).expect(401);
    });

    it("Unauthorized in DELETE", () => {
      return makeRequest().delete(testURL).expect(401);
    });
  
    it("Unauthorized in PAYMENT", () => {
        return makeRequest().post(`${testURL}/payment`).expect(401);
    });

    it("Unauthorized in PAYMENT CONFIRM", () => {
        return makeRequest().post(`${testURL}/payment-confirm`).expect(401);
    });
  
    it("Missing fields in POST", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      return makeRequest()
        .post(testURL)
        .set(authHeader)
        .expect(400, { reason: "Missing fields" });
    });

    it("Missing fields in PUT", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;
      
      return makeRequest()
        .put(testURL)
        .set(authHeader)
        .expect(400, { reason: "Missing fields" });
    });

    it("Missing fields in DELETE", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      return makeRequest()
        .delete(testURL)
        .set(authHeader)
        .expect(400, { reason: "Missing fields" });
    });

    it("Missing fields in /payment", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      testApplication.explorerID = userData.userID;
      new ApplicationSchema(testApplication)
      .save()
      .then((doc) => {
        testApplicationID = doc._id;
      });

      return makeRequest()
          .post(`${testURL}/payment`)
          .set(authHeader)
          .expect(400, { reason: "Missing fields" })
          .then(() => {
              return makeRequest()
                  .post(`${testURL}/payment`)
                  .set(authHeader)
                  .send({
                      paymentData: {
                          id: testApplicationID,
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
                          id: testApplicationID,
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
                          id: testApplicationID,
                          successURL: "http://success.com",
                          cancelURL: "http://cancel.com",
                          lang: "random"
                      }
                  })
                  .expect(400, { reason: "Invalid language" });
          });
    }).timeout(30000);

    it("Wrong applicationID in /payment", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

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
    }).timeout(10000);

    it("Correct payment creation", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      testApplication.explorerID = userData.userID;
      const application = await new ApplicationSchema(testApplication)
      .save()
      .then((doc) => {
        testApplicationID = doc._id;
      });

      return makeRequest()
          .post(`${testURL}/payment`)
          .set(authHeader)
          .send({
              paymentData: {
                  id: testApplicationID,
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

    it("Missing fields in /payment-confirm", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      testApplication.explorerID = userData.userID;
      const application = await new ApplicationSchema(testApplication)
      .save()
      .then((doc) => {
        testApplicationID = doc._id;
      });

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
                          id: testApplicationID
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
                          id: testApplicationID,
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
                          id: testApplicationID,
                          paymentID: "123"
                      }
                  })
                  .expect(400, { reason: "Missing paypal payment data" })
          });
    });

    it("Wrong applicationID in /payment-confirm", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

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

    it("Wrong payment confirmation", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      testApplication.explorerID = userData.userID;
      const application = await new ApplicationSchema(testApplication)
      .save()
      .then((doc) => {
        testApplicationID = doc._id;
      });

      return makeRequest()
          .post(`${testURL}/payment-confirm`)
          .set(authHeader)
          .send({
              confirmData: {
                  id: testApplicationID,
                  payerID: "123",
                  paymentID: "123"
              }
          })
          .expect(500, { reason: "Payment error" });
    }).timeout(10000);

    // Can't test payment execution because we need to perform the payment in a web
    // browser in order to get a proper paymentID and payerID
    // It should better be tested in frontend

    it("Get missing application", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      return makeRequest()
        .get(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
        .set(authHeader)
        .expect(404);
    });

    it("Get single application", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      const tripID = await createPublished(sampleTrips[0]);
      const applicationID = await createApplication(tripID);

      return makeRequest()
        .get(`${testURL}/${applicationID}`)
        .set(authHeader)
        .expect(200);
    }).timeout(10000);

    it("Get all by tripID", async() => {
      const userData = await createUserAndLogin("MANAGER");
      authHeader = userData.authHeader;

      const tripID = await createPublished(sampleTrips[0]);
      const applicationID = await createApplication(tripID);

      return makeRequest()
        .get(`${testURL}/trips/${tripID}`)
        .set(authHeader)
        .expect(200);
    }).timeout(10000);

    it("Get all by explorerID", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      const tripID = await createPublished(sampleTrips[0]);
      const applicationID = await createApplication(tripID);

      return makeRequest()
        .get(`${testURL}/explorers/${userData.userID}?status=PENDING`)
        .set(authHeader)
        .expect(200);
    }).timeout(10000);

    it("Trying to POST with missing tripID", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      return makeRequest()
        .post(testURL)
        .set(authHeader)
        .send({
            explorerID: mongoose.Types.ObjectId().toHexString(),
            tripID: mongoose.Types.ObjectId().toHexString(),
          })
        .expect(422);
    }).timeout(10000);
  
    it("Correct application delete", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      let sponsorshipID;
      const tripID = await createPublished(sampleTrips[0]);

      return makeRequest()
        .post(testURL)
        .set(authHeader)
        .send({
              tripID: tripID,
              explorerID: userData.userID
            })
        .expect(200)
        .then((response) => {
          expect(mongoose.Types.ObjectId.isValid(response.body)).to.equal(true);
          applicationID = response.body;
          return makeRequest().get(testURL).set(authHeader).expect(404);
        })
    }).timeout(10000);


    it("Correct explorer reject", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      const tripID = await createPublished(sampleTrips[0]);
      const applicationID = await createApplication(tripID);

      return makeRequest()
      .post(`${testURL}/${applicationID}/cancel`)
      .set(authHeader)
      .expect(200);
    }).timeout(10000);

    it("Trying to reject with wrong status", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      testApplication = {};
      testApplication.tripID = await createPublished(sampleTrips[0]);
      testApplication.explorerID = mongoose.Types.ObjectId().toHexString();
      testApplication.status = "DUE"

      const applicationID = await new ApplicationSchema(testApplication).save();
      
      return makeRequest()
      .put(`${testURL}/${applicationID}/cancel`)
      .set(authHeader)
      .expect(400);
    }).timeout(10000);

    it("Correct manager update", () => {
    });

    it("Trying to update to a wrong status", () => {
    });

    it("Trying to update with a wrong status", () => {
    });
  });
  