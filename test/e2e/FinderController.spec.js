const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const FinderSchema = require("../../source/models/FinderSchema");

const { expect } = require("chai");

describe("Finder API", () => {
    const testURL = "/api/v1/finders";
    let authHeader;

    const sampleFinder = [
      {
        keyword: "key1",
        minPrice: 10,
        maxPrice: 1000,
        startDate: "2024-04-23T18:25:43.511Z",
        endDate: "2025-04-23T18:25:43.511Z",
        actorID: mongoose.Types.ObjectId().toHexString()
      },
      {
        keyword: "key2",
        minPrice: 50,
        maxPrice: 500,
        startDate: "2025-04-23T18:25:43.511Z",
        endDate: "2026-04-23T18:25:43.511Z",
        actorID: mongoose.Types.ObjectId().toHexString()
      }
    ];
  

    var createFinder = async function () {
      let testFinder = {};

      testFinder.keyword = "Demo";
      testFinder.minPrice = 0;
      testFinder.maxPrice = 1000;
      testFinder.startDate = Date.now();
      testFinder.endDate = Date.now();
      testFinder.trips = [mongoose.Types.ObjectId().toHexString()];
      testFinder.actorID = mongoose.Types.ObjectId().toHexString();
      
      let finder = await new FinderSchema(testFinder).save();

      return finder;
    };

    beforeEach(async () => {
      await resetDB();
    });

    it("Unauthorized in GET", () => {
      return makeRequest().get(testURL).expect(401);
    });

    it("Unauthorized in GET by actor", () => {
        return makeRequest().get(`${testURL}/actors`).expect(401);
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
  
    it("Get missing finder", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      return makeRequest()
        .get(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
        .set(authHeader)
        .expect(404);
    });

    it("PUT missing finder", async() => {
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;
  
        return makeRequest()
          .put(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
          .set(authHeader)
          .expect(404);
      });

      it("DELETE missing finder", async() => {
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;
  
        return makeRequest()
          .delete(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
          .set(authHeader)
          .expect(404);
      });
  

    it("Get single Finder", async() => {
      const userData = await createUserAndLogin("EXPLORER");
      authHeader = userData.authHeader;

      const finder = await createFinder();

      return makeRequest()
        .get(`${testURL}/${finder._id}`)
        .set(authHeader)
        .expect(200);
    }).timeout(10000);

    it("Get single Finder by ActorID", async() => {
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;
  
        const finder = await createFinder();
  
        return makeRequest()
          .get(`${testURL}/actors/${finder.actorID}`)
          .set(authHeader)
          .expect(200);
      }).timeout(10000);

      it("Trying POST with wrong prices", async() => {
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;
  
        return makeRequest()
        .post(testURL)
        .set(authHeader)
        .send({...sampleFinder[0],
        minPrice: "Esto no es un precio"})
        .expect(400)
      }).timeout(10000);


      it("Trying POST with wrong dates", async() => {
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;
  
        return makeRequest()
        .post(testURL)
        .set(authHeader)
        .send({...sampleFinder[0],
        startDate: "Esto no es una fecha"})
        .expect(400)
      }).timeout(10000);

      it("Correct POST", async() => {
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;
  
        return makeRequest()
        .post(testURL)
        .set(authHeader)
        .send(sampleFinder[0])
        .expect(200)
        .then((response) => {
          expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
            true
          );
          expect(response.body.keyword).to.equal(sampleFinder[0].keyword);
          expect(response.body.minPrice).to.equal(sampleFinder[0].minPrice);
          expect(response.body.startDate).to.equal(sampleFinder[0].startDate);
        });
      }).timeout(10000);

      it("Correct PUT", async() => {
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;

        return makeRequest()
        .post(testURL)
        .set(authHeader)
        .send(sampleFinder[1])
        .expect(200)
        .then((response) => {
          expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
            true
          );
          return makeRequest()
            .put(`${testURL}/${response.body._id}`)
            .set(authHeader)
            .send(sampleFinder[0])
            .expect(200)
            .then((response) => {
              expect(response.body.keyword).to.equal(sampleFinder[0].keyword);
              expect(response.body.minPrice).to.equal(
                sampleFinder[0].minPrice
              );
              expect(response.body.startDate).to.equal(
                sampleFinder[0].startDate
              );
            });
        });

      }).timeout(10000);
    });
  