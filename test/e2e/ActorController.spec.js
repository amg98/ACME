const { resetDB, makeRequest, createUserAndLogin } = require("../utils");
const mongoose = require("mongoose");
const ActorSchema = require("../../source/models/ActorSchema");

const { expect } = require("chai");

describe("Actor API", () => {
  const sampleActors = [
    {
      name: "Actor Explorer",
      surname: "Díaz",
      email: "actor1@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 1",
      password: "passwordActor1",
      isBanned: false,
      roles: "EXPLORER"
    },
    {
      name: "Actor Manager",
      surname: "Díaz",
      email: "actor2@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 2",
      password: "passwordActor2",
      isBanned: false,
      roles: "MANAGER"
    },
    {
      name: "Actor Sponsor",
      surname: "Díaz",
      email: "actor3@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 3",
      password: "passwordActor3",
      isBanned: false,
      roles: "SPONSOR"
    },

    {
      name: "Actor Administrator",
      surname: "Díaz",
      email: "actor4@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 4",
      password: "passwordActor4",
      isBanned: false,
      roles: "ADMINISTRATOR"
    }
    
  ];

  const testURL = "/api/v1/actors";
  let authHeader;

  var createSampleActor = async function (actor) {
    testActor = actor;

    return new ActorSchema(testActor).save().then((doc) => {
      actorID = doc._id;
    });
  };

  beforeEach(async () => {
    await resetDB();
  });


  it.only("Unauthorized in PUT", () => {
    return makeRequest().put(testURL).expect(401)
  });

  it.only("Missing fields in POST", () => {
    return makeRequest()
      .post(testURL)
      .expect(400, { reason: "Missing fields" });
  });

  it.only("Missing fields in PUT", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .put(testURL)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });


  //----------------------- POST EXPLORER ------------------------------

  it.only("POST Explorer as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        expect(response.body.name).to.equal(sampleActors[0].name);
        expect(response.body.surname).to.equal(sampleActors[0].surname);
        expect(response.body.email).to.equal(sampleActors[0].email);
        expect(response.body.phoneNumber).to.equal(sampleActors[0].phoneNumber);
        expect(response.body.address).to.equal(sampleActors[0].address);
        expect(response.body.roles[0]).to.equal(sampleActors[0].roles);

      });
  });

  it.only("POST Explorer as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Explorer as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Explorer as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Explorer as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(422, {reason: "New user has to be a Manager"})
  });


  //----------------------- POST MANAGER ------------------------------

  it.only("POST Manager as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "Only administrators can create managers"})
  });

  it.only("POST Manager as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Manager as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Manager as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Manager as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[1] })
      .expect(200)
      
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        expect(response.body.name).to.equal(sampleActors[1].name);
        expect(response.body.surname).to.equal(sampleActors[1].surname);
        expect(response.body.email).to.equal(sampleActors[1].email);
        expect(response.body.phoneNumber).to.equal(sampleActors[1].phoneNumber);
        expect(response.body.address).to.equal(sampleActors[1].address);
        expect(response.body.roles[0]).to.equal(sampleActors[1].roles);

      });
  });

  //----------------------- POST SPONSOR ------------------------------

  it.only("POST Sponsor as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[2] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        expect(response.body.name).to.equal(sampleActors[2].name);
        expect(response.body.surname).to.equal(sampleActors[2].surname);
        expect(response.body.email).to.equal(sampleActors[2].email);
        expect(response.body.phoneNumber).to.equal(sampleActors[2].phoneNumber);
        expect(response.body.address).to.equal(sampleActors[2].address);
        expect(response.body.roles[0]).to.equal(sampleActors[2].roles);

      });
  });

  it.only("POST Sponsor as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[2] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Sponsor as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[2] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Sponsor as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[2] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it.only("POST Sponsor as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
    .post(testURL)
    .set(authHeader)
    .send({ actor: sampleActors[2] })
    .expect(422, {reason: "New user has to be a Manager"})
  });

  //----------------------- POST ADMINISTRATOR ------------------------------

  it.only("POST Administrator as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it.only("POST Administrator as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it.only("POST Administrator as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it.only("POST Administrator as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it.only("POST Administrator as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
    .post(testURL)
    .set(authHeader)
    .send({ actor: sampleActors[3] })
    .expect(422, {reason: "Can't create an admin user"})
  });

  // -----------------------------------------------------------------------

  //------------------------------  GET  -----------------------------------
  it.only("GET actor", async () => {
    await createSampleActor(sampleActors[0]);

    return makeRequest()
      .get(`${testURL}/${actorID}`)
      .expect(200)
      .then((response) => {
        expect(response.body.name).to.equal(sampleActors[0].name);
        expect(response.body.surname).to.equal(sampleActors[0].surname);
        expect(response.body.email).to.equal(sampleActors[0].email);
        expect(response.body.phoneNumber).to.equal(sampleActors[0].phoneNumber);
        expect(response.body.address).to.equal(sampleActors[0].address);
        expect(response.body.roles[0]).to.equal(sampleActors[0].roles);
      });
  });

  it.only("GET non-existent actor", () => {
    return makeRequest()
      .get(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
      .expect(404);
  });

  //---------------------------  BAN/UNBAN  -----------------------------

  it.only("BAN actor as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    await createSampleActor(sampleActors[0]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .set(authHeader)
    .send({ isBanned: true })
    .expect(200)
    .then((response) => {
      expect(response.body.actor.isBanned).to.equal(true);
    });
  });

  it.only("BAN actor as non Admin logged", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    await createSampleActor(sampleActors[0]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .set(authHeader)
    .send({ isBanned: true })
    .expect(403, {message: "You have to be an Admin"})
  });

  it.only("BAN actor as anonymous user", async () => {
    await createSampleActor(sampleActors[0]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .send({ isBanned: true })
    .expect(401, {message: "No token provided or invalid one"})
  });


});
