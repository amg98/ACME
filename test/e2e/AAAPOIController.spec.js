const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const TripSchema = require("../../source/models/TripSchema");
const POISchema = require("../../source/models/POISchema");

const { expect } = require("chai");

describe("POI API", () => {
    const testURL = "/api/v1/pois";
    let authHeader;

    const sampleTrip = {
      _id: mongoose.Types.ObjectId().toHexString(),
      managerID: mongoose.Types.ObjectId().toHexString(),
      title: "Excursion",
      startDate: Date.now(),
      endDate: Date.now(),
      ticker: "111111-AAAA",
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
    };
  
    const samplePOI = {
      title: "La Giralda",
      description: "Es muy bonita",
      coordinates: "37.386196--5.992634",
      type: "Historical Place",
    };

    var createPOI = async function () {  
      let poi = await new POISchema(samplePOI).save();

      return poi.id
    };

    var createTRIP = async function () {  
      let trip = await new TripSchema(sampleTrip).save();

      return trip.id
    };
  

    beforeEach(async () => {
      await resetDB();
    });

    it("Get all POIs", async() => {
      const userData = await createUserAndLogin("ADMINISTRATOR");
      authHeader = userData.authHeader;

      const poiID = await createPOI();

      return makeRequest()
        .get(`${testURL}`)
        .set(authHeader)
        .expect(200);
    }).timeout(10000);

    it("Get dashboard", async() => {
      const userData = await createUserAndLogin("ADMINISTRATOR");
      authHeader = userData.authHeader;

      const poiID = await createPOI();

      return makeRequest()
        .get(`${testURL}/dashboard`)
        .set(authHeader)
        .expect(200)
        .then((response) => {
          expect(response.body.length).to.equal(1);
          expect(response.body[0]).to.equal(samplePOI.type);
        });
    }).timeout(10000);

    it("Post POI", async() => {

      const userData = await createUserAndLogin("ADMINISTRATOR");
      authHeader = userData.authHeader;

      return makeRequest()
        .post(testURL)
        .set(authHeader)
        .send(samplePOI)
        .expect(200)
        .then((response) => {
          expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
            true
          );
          expect(response.body.title).to.equal(samplePOI.title);
        });
    }).timeout(10000);

    it("Correct POI delete", async() => {
      const userData = await createUserAndLogin("ADMINISTRATOR");
      authHeader = userData.authHeader;

      const poiID = await createPOI();

        return makeRequest()
          .delete(`${testURL}/poiID`)
          .set(authHeader)
          .send()
          .expect(200)
          .then((response) => {
            return makeRequest().get(testURL).set(authHeader).expect(200);
          })
          .then((response) => {
            expect(response.body.length).to.equal(0);
          })
      }).timeout(10000);
    
      it("Correct POI edit", async() => {
        const userData = await createUserAndLogin("ADMINISTRATOR");
        authHeader = userData.authHeader;
  
        const poiID = await createPOI();

        const newTitle = "Torre del oro";

        return makeRequest()
          .put(`${testURL}/${response.body}`)
          .set(authHeader)
          .send({ title: newTitle })
          .expect(200)
          .then((response) => {
            expect(response.body.title).to.equal(newTitle);
          })

      }).timeout(10000);

      it("Correct POI Assign", async() => {
        const userData = await createUserAndLogin("MANAGER");
        authHeader = userData.authHeader;
  
        const poiID = await createPOI();
        const tripID = await createTRIP();

        return makeRequest()
          .put(`${testURL}/${poiID}/assignStage`)
          .set(authHeader)
          .send({ tripID: tripID,
                  stageID: 0,
                  managerID: userData.userID })
          .expect(200)
          .then((response) => {
            expect(response.body.stage[0].poi[0]).to.equal(poiID);
          })

      }).timeout(10000);
});
  