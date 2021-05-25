const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const { expect } = require("chai");

describe("Favourite Lists API", () => {

    const testURL = "/api/v1/favourite-lists/sync";
    let authHeader;

    const oldList = {
        timestamp: new Date(1000).toISOString(),
        favouriteLists: [
            { name: "old", trips: [mongoose.Types.ObjectId().toHexString(), mongoose.Types.ObjectId().toHexString(), mongoose.Types.ObjectId().toHexString()]}
        ]
    }

    const newList = {
        timestamp: new Date(2000).toISOString(),
        favouriteLists: [
            { name: "new", trips: [mongoose.Types.ObjectId().toHexString(), mongoose.Types.ObjectId().toHexString(), mongoose.Types.ObjectId().toHexString()]}
        ]
    }

    beforeEach(async () => {
        await resetDB();
        const userData = await createUserAndLogin("EXPLORER");
        authHeader = userData.authHeader;
    });

    it("Unauthorized in sync", async () => {
        return makeRequest().post(testURL).expect(401);
    })

    it("Missing fields in sync", async () => {
        return makeRequest()
            .post(testURL)
            .set(authHeader)
            .expect(400, { reason: "Missing fields" })
    })

    it("Inexistent favourite lists", async () => {
        return makeRequest()
            .post(testURL)
            .set(authHeader)
            .send({ lists: oldList })
            .expect(200)
            .then(response => {
                delete response.body.explorerID
                expect(response.body).to.deep.equal(oldList)
            })
    })

    it("Updating favourite lists", async () => {
        return makeRequest()
            .post(testURL)
            .set(authHeader)
            .send({ lists: oldList })
            .expect(200)
            .then(() => {
                return makeRequest()
                    .post(testURL)
                    .set(authHeader)
                    .send({ lists: newList })
                    .expect(200)
            })
            .then(response => {
                delete response.body.explorerID
                expect(response.body).to.deep.equal(newList)
            })
    })

    it("Updated favourite lists", async () => {
        return makeRequest()
            .post(testURL)
            .set(authHeader)
            .send({ lists: newList })
            .expect(200)
            .then(() => {
                return makeRequest()
                    .post(testURL)
                    .set(authHeader)
                    .send({ lists: oldList })
                    .expect(200)
            })
            .then(response => {
                delete response.body.explorerID
                delete response.body._id
                delete response.body.__v
                delete response.body.favouriteLists[0]._id
                expect(response.body).to.deep.equal(newList)
            })
    })
})
