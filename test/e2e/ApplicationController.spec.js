const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const TripSchema = require("../../source/models/TripSchema");
const ApplicationSchema = require("../../source/models/ApplicationSchema");
const { expect } = require("chai");

describe("Application API", () => {
 
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
    }).timeout(10000);;

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

  });
  