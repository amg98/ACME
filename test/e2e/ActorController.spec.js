const { resetDB, makeRequest, createUserAndLogin, createSampleUserAndLogin } = require("../utils");
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
    },
    {
      name: "Actor Explorer banned",
      surname: "Díaz",
      email: "actor1banned@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 1",
      password: "passwordActor1banned",
      isBanned: true,
      roles: "EXPLORER"
    },
    
  ];

  const testURL = "/api/v1/actors";
  let authHeader;
  let actorID;

  var createSampleActor = async function (actor) {
    testActor = actor;

    return new ActorSchema(testActor).save().then((doc) => {
      actorID = doc._id;
    });
  };

  beforeEach(async () => {
    await resetDB();
  });


  it("Unauthorized in PUT", () => {
    return makeRequest().put(testURL).expect(401)
  });

  it("Missing fields in POST", () => {
    return makeRequest()
      .post(testURL)
      .expect(400, { reason: "Missing fields" });
  });

  it("Missing fields in PUT", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .put(testURL)
      .set(authHeader)
      .expect(400, { reason: "Missing fields" });
  });


  //----------------------- POST EXPLORER ------------------------------

  it("POST Explorer as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[0] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        expect(response.body.name).to.equal(sampleActors[0].name);
        expect(response.body.email).to.equal(sampleActors[0].email);
        expect(response.body.roles[0]).to.equal(sampleActors[0].roles);

      });
  });

  it("POST Explorer as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Explorer as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Explorer as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Explorer as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[0] })
      .expect(422, {reason: "New user has to be a Manager"})
  });


  //----------------------- POST MANAGER ------------------------------

  it("POST Manager as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "Only administrators can create managers"})
  });

  it("POST Manager as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Manager as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Manager as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[1] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Manager as Administrator", async () => {
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
        expect(response.body.email).to.equal(sampleActors[1].email);
        expect(response.body.roles[0]).to.equal(sampleActors[1].roles);

      });
  });

  //----------------------- POST SPONSOR ------------------------------

  it("POST Sponsor as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[2] })
      .expect(200)
      .then((response) => {
        expect(mongoose.Types.ObjectId.isValid(response.body._id)).to.equal(
          true
        );
        expect(response.body.name).to.equal(sampleActors[2].name);
        expect(response.body.email).to.equal(sampleActors[2].email);
        expect(response.body.roles[0]).to.equal(sampleActors[2].roles);

      });
  });

  it("POST Sponsor as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[2] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Sponsor as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[2] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Sponsor as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[2] })
      .expect(403, {reason: "You must be an administrator"})
  });

  it("POST Sponsor as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
    .post(testURL)
    .set(authHeader)
    .send({ actor: sampleActors[2] })
    .expect(422, {reason: "New user has to be a Manager"})
  });

  //----------------------- POST ADMINISTRATOR ------------------------------

  it("POST Administrator as anonymous user", async () => {
    return makeRequest()
      .post(testURL)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it("POST Administrator as Explorer", async () => {
    const userData = await createUserAndLogin("EXPLORER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it("POST Administrator as Manager", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it("POST Administrator as Sponsor", async () => {
    const userData = await createUserAndLogin("SPONSOR");
    authHeader = userData.authHeader;

    return makeRequest()
      .post(testURL)
      .set(authHeader)
      .send({ actor: sampleActors[3] })
      .expect(422, {reason: "Can't create an admin user"})
  });

  it("POST Administrator as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
    .post(testURL)
    .set(authHeader)
    .send({ actor: sampleActors[3] })
    .expect(422, {reason: "Can't create an admin user"})
  });


  //------------------------------  GET  -----------------------------------
  it("GET actor", async () => {
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

  it("GET non-existent actor", () => {
    return makeRequest()
      .get(`${testURL}/${mongoose.Types.ObjectId().toHexString()}`)
      .expect(404);
  });

  //---------------------------  BAN/UNBAN  -----------------------------

  it("BAN actor as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    await createSampleActor(sampleActors[0]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .set(authHeader)
    .send({ isBanned: true })
    .expect(200)
    .then((response) => {
      expect(response.body.isBanned).to.equal(true);
    });
  });

  it("BAN actor as non Admin logged", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    await createSampleActor(sampleActors[0]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .set(authHeader)
    .send({ isBanned: true })
    .expect(403, {message: "You have to be an Admin"})
  });

  it("BAN actor as anonymous user", async () => {
    await createSampleActor(sampleActors[0]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .send({ isBanned: true })
    .expect(401, {message: "No token provided or invalid one"})
  });

  it("BAN non-existent actor", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
    .put(`${testURL}/${mongoose.Types.ObjectId().toHexString()}/ban`)
    .set(authHeader)
    .send({ isBanned: true })
    .expect(404, {reason: "Actor to be banned not found"})
  });

  it("UNBAN actor as Administrator", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    await createSampleActor(sampleActors[4]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .set(authHeader)
    .send({ isBanned: false })
    .expect(200)
    .then((response) => {
      expect(response.body.isBanned).to.equal(false);
    });
  });

  it("UNBAN actor as non Admin logged", async () => {
    const userData = await createUserAndLogin("MANAGER");
    authHeader = userData.authHeader;

    await createSampleActor(sampleActors[4]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .set(authHeader)
    .send({ isBanned: false })
    .expect(403, {message: "You have to be an Admin"})
  });

  it("UNBAN actor as anonymous user", async () => {
    await createSampleActor(sampleActors[4]);

    return makeRequest()
    .put(`${testURL}/${actorID}/ban`)
    .send({ isBanned: false })
    .expect(401, {message: "No token provided or invalid one"})
  });

  it("UNBAN non-existent actor", async () => {
    const userData = await createUserAndLogin("ADMINISTRATOR");
    authHeader = userData.authHeader;

    return makeRequest()
    .put(`${testURL}/${mongoose.Types.ObjectId().toHexString()}/ban`)
    .set(authHeader)
    .send({ isBanned: false })
    .expect(404, {reason: "Actor to be banned not found"})
  });


  //---------------------------  PUT ACTOR  -----------------------------

  it("PUT Actor", async () => {
    const userData = await createSampleUserAndLogin(sampleActors[0]);
    
    authHeader = userData.authHeader;
    actorID = userData.userID;

    const modifiedActor = {
        _id: actorID,
        name: "Actor Explorer Modificado",
        surname: "Díaz",
        email: "actor1@gmail.com",
        phoneNumber: "666123123",
        address: "Direccion 1",
        password: ""
    }

    return makeRequest()
      .put(`${testURL}`)
      .set(authHeader)
      .send({ actor: modifiedActor })
      .expect(200)
      .then((response) => {
        expect(response.body._id).to.equal(modifiedActor._id);
        expect(response.body.name).to.equal(modifiedActor.name);
        expect(response.body.email).to.equal(modifiedActor.email);
      });
  });

  it("PUT Actor - invalid email format", async () => {
    const userData = await createSampleUserAndLogin(sampleActors[0]);
    
    authHeader = userData.authHeader;
    actorID = userData.userID;

    const modifiedActor = {
        _id: actorID,
        name: "Actor Explorer Modificado",
        surname: "Díaz",
        email: "actor1gmailcom",
        phoneNumber: "666123123",
        address: "Direccion 1",
        password: ""
    }

    return makeRequest()
      .put(`${testURL}`)
      .set(authHeader)
      .send({ actor: modifiedActor })
      .expect(500)
  });

  it("PUT Actor - empty mandatory fields", async () => {
    const userData = await createSampleUserAndLogin(sampleActors[0]);
    
    authHeader = userData.authHeader;
    actorID = userData.userID;

    const modifiedActor = {
        _id: actorID,
        name: "",
        surname: "Díaz",
        email: "actor1gmailcom",
        phoneNumber: "666123123",
        address: "Direccion 1",
        password: ""
    }

    return makeRequest()
      .put(`${testURL}`)
      .set(authHeader)
      .send({ actor: modifiedActor })
      .expect(500)
  });

  it("PUT Actor - invalid actorID", async () => {
    const userData = await createSampleUserAndLogin(sampleActors[0]);
    
    authHeader = userData.authHeader;
    actorID = userData.userID;

    const modifiedActor = {
        _id: actorID+1,
        name: "Actor Explorer Modificado",
        surname: "Díaz",
        email: "actor1@gmail.com",
        phoneNumber: "666123123",
        address: "Direccion 1",
        password: ""
    }

    return makeRequest()
      .put(`${testURL}`)
      .set(authHeader)
      .send({ actor: modifiedActor })
      .expect(403, {reason: "You are not allowed to edit this profile"})
  });

  it("PUT Actor - anonymous user", async () => {
    const userData = await createSampleUserAndLogin(sampleActors[0]);

    actorID = userData.userID;

    const modifiedActor = {
        _id: actorID,
        name: "Actor Explorer Modificado",
        surname: "Díaz",
        email: "actor1@gmail.com",
        phoneNumber: "666123123",
        address: "Direccion 1",
        password: ""
    }

    return makeRequest()
      .put(`${testURL}`)
      .send({ actor: modifiedActor })
      .expect(401, {message: "No token provided or invalid one"})
  });

});
