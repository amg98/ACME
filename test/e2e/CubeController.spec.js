const { resetDB, makeRequest, createUserAndLogin, createSampleUserAndLogin } = require("../utils");
const mongoose = require("mongoose");

const ApplicationSchema = require("../../source/models/ApplicationSchema");
const ActorSchema = require("../../source/models/ActorSchema");
const TripSchema = require("../../source/models/TripSchema");

const { expect } = require("chai");

describe("Cubes API", () => {

  const sampleActors = [
    {
      name: "Actor Explorer 1",
      surname: "Díaz",
      email: "actor1@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 1",
      password: "passwordActor1",
      isBanned: false,
      roles: "EXPLORER"
    },

    {
      name: "Actor Explorer 2",
      surname: "Díaz",
      email: "actor2@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 1",
      password: "passwordActor2",
      isBanned: false,
      roles: "EXPLORER"
    },

    {
      name: "Actor Explorer 3",
      surname: "Díaz",
      email: "actor4@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 4",
      password: "passwordActor4",
      isBanned: false,
      roles: "EXPLORER"
    },

    {
      name: "Actor Manager",
      surname: "Díaz",
      email: "actor5@gmail.com",
      phoneNumber: "666123123",
      address: "Direccion 5",
      password: "passwordActor5",
      isBanned: false,
      roles: "MANAGER"
    },
    
  ];

  function xDaysAgo(days) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - days);
  }

  const sampleTrips = [
    {
      title: "Best trip money can buy",
      description: "My description is short",
      requirements: ["requirement 1", "requirement 2"],
      startDate: "2021-03-01T18:00:00.00Z",
      endDate: "2021-03-15T18:00:00.00Z",
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
      startDate: "2021-02-07T18:00:00.00Z",
      endDate: "2021-02-15T18:00:00.00Z",
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

    {
      title: "The third trip",
      description: "My description for third trip is",
      requirements: ["Number aaaa"],
      startDate: "2021-01-07T18:00:00.00Z",
      endDate: "2021-01-15T18:00:00.00Z",
      pictures: [
        "https://www.wonderfultrips.com/uploads/8/8/0/4/88049104/shutterstock-358732994_1.jpg",
      ],
      stages: [
        {
          title: "From Jaen to Tunez",
          description: "Delightful sightseen",
          price: 100,
        },
        {
          title: "From Tunez to Alcalá de Guadaira",
          description: "Lovely mazapanes",
          price: 200,
        },
      ],
    },

    {
      title: "Cuarto trip",
      description: "My desc for cuarto trip",
      requirements: ["Numero uno", "Numero dos"],
      startDate: "2020-02-07T18:00:00.00Z",
      endDate: "2020-02-15T18:00:00.00Z",
      pictures: [
        "https://www.wonderfultrips.com/uploads/8/8/0/4/88049104/shutterstock-358732994_1.jpg",
      ],
      stages: [
        {
          title: "From A to B",
          description: "Delightful sightseen",
          price: 800,
        },
        {
          title: "From B to C",
          description: "Lovely mazapanes",
          price: 1000,
        },
      ],
    }
  ];

  const testURL = "/api/v1/cubes";

  let authHeader;

  beforeEach(async () => {
    await resetDB();
  });


  var createPublished = async function (trip) {
    testTrip = trip;
    testTrip.ticker = "000000-TEST";
    testTrip.managerID = mongoose.Types.ObjectId().toHexString();
    testTrip.isPublished = true;

    let published = await new TripSchema(testTrip).save();

    return published._id
  };


  
  var createTripAndApplication = async function (explorerID, trip, timeStamp) {
    const tripID = await createPublished(trip);

    application = {
      tripID: tripID,
      explorerID : explorerID,
      status : "ACCEPTED",
      timeStamp: timeStamp
    }
    
    await new ApplicationSchema(application).save();
  };


// ---------------------------------  POST  ----------------------------------------------------

  it("POST Cubes", async() => {

    const tripID = await createPublished(sampleTrips[0]); //724.5

    const explorer = await createSampleUserAndLogin(sampleActors[0]);
    explorerID = explorer.userID;
    
    let testApplication = {
      status: "ACCEPTED",
      tripID: tripID,
      comments: ["did", "nothing", "wrong"],
      explorerID: explorerID,
    };
    const app = await new ApplicationSchema(testApplication).save();

    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."});
  }).timeout(50000);


  it("POST Cubes as anonymous user", async() => {

    const tripID = await createPublished(sampleTrips[0]); //724.5

    const explorer = await createSampleUserAndLogin(sampleActors[0]);
    explorerID = explorer.userID;
    
    let testApplication = {
      status: "ACCEPTED",
      tripID: tripID,
      comments: ["did", "nothing", "wrong"],
      explorerID: explorerID,
    };
    const app = await new ApplicationSchema(testApplication).save();

    return makeRequest()
        .post(`${testURL}`)
        .expect(401, {message: "No token provided or invalid one"});
  }).timeout(50000);


  it("POST Cubes as non-admin user", async() => {

    const tripID = await createPublished(sampleTrips[0]); //724.5

    const explorer = await createSampleUserAndLogin(sampleActors[0]);
    explorerID = explorer.userID;
    
    let testApplication = {
      status: "ACCEPTED",
      tripID: tripID,
      comments: ["did", "nothing", "wrong"],
      explorerID: explorerID,
    };
    const app = await new ApplicationSchema(testApplication).save();

    const manager = await createUserAndLogin("MANAGER");
    authHeader = manager.authHeader;
    userID = manager.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(403, { message: "You have to be an Admin" });
  }).timeout(50000);



// ---------------------------------  GET CUBE  ----------------------------------------------------

  it("GET Cube by explorer0, trip0 and M01 - last 20 days", async() => {

    const explorer  = await new ActorSchema(sampleActors[0]).save();
    const period1 = "M01";
    const timeStamp = xDaysAgo(20);

    //Trip0: 724.5
    await createTripAndApplication(explorer._id, sampleTrips[0], timeStamp);
    
    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(200, { "Cube amount": 724.5});
      })

  }).timeout(50000);



  it("GET Cube by explorer0, trip0 and M01 - last 40 days", async() => {

    const explorer  = await new ActorSchema(sampleActors[0]).save();
    const period1 = "M01";
    const timeStamp = xDaysAgo(40);

    //Trip0: 724.5
    await createTripAndApplication(explorer._id, sampleTrips[0], timeStamp);
    
    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(404, {"error":"Cube was not computed"});
      })

  }).timeout(50000);


  it("GET Cube by explorer0, trip2 and M06 - last 155 days", async() => {
    //155 días - 5 meses y poco
    const explorer  = await new ActorSchema(sampleActors[0]).save();
    const period1 = "M06";
    const timeStamp = xDaysAgo(155);

    //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
    await createTripAndApplication(explorer._id, sampleTrips[2], timeStamp);
    
    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(200, { "Cube amount": 300});
      })

  }).timeout(50000);

  it("GET Cube by explorer1, trip1, trip2 and M20 - last 25 days", async() => {

    const explorer  = await new ActorSchema(sampleActors[1]).save();
    const period1 = "M20";
    const timeStamp = xDaysAgo(25);

    //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
    await createTripAndApplication(explorer._id, sampleTrips[1], timeStamp);
    await createTripAndApplication(explorer._id, sampleTrips[2], timeStamp);

    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(200, { "Cube amount": 1088.5});
      })

  }).timeout(50000);
  
  
  it("GET Cube by explorer0, trip0 and Y01 - last 40 days", async() => {

    const explorer  = await new ActorSchema(sampleActors[0]).save();
    const period1 = "Y01";
    const timeStamp = xDaysAgo(40);

    //Trip0: 724.5
    await createTripAndApplication(explorer._id, sampleTrips[0], timeStamp);
    
    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(200, { "Cube amount": 724.5});
      })

  }).timeout(50000);


  it("GET Cube by explorer0, trip0 and Y01 - last 400 days", async() => {

    const explorer  = await new ActorSchema(sampleActors[0]).save();
    const period1 = "Y01";
    const timeStamp = xDaysAgo(400);

    //Trip0: 724.5
    await createTripAndApplication(explorer._id, sampleTrips[0], timeStamp);
    
    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(404, {"error":"Cube was not computed"});
      })

  }).timeout(50000);


  it("GET Cube by explorer0, trip2 and Y03 - last 1200 days", async() => {
    //1200 días son más de 3 años, se escapa del período Y03
    const explorer  = await new ActorSchema(sampleActors[0]).save();
    const period1 = "Y03";
    const timeStamp = xDaysAgo(1200);

    //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
    await createTripAndApplication(explorer._id, sampleTrips[2], timeStamp);
    
    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(404, {"error":"Cube was not computed"});
      })

  }).timeout(50000);


  it("GET Cube by invalid explorer Id", async() => {

    const explorer  = await new ActorSchema(sampleActors[0]).save();
    const period1 = "M20";
    const timeStamp = xDaysAgo(25);

    //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
    await createTripAndApplication(explorer._id, sampleTrips[1], timeStamp);

    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/49832402382/period/${period1}`)
            .set(authHeader)
            .expect(404, {"error":"Error while getting the user"});
      })

  }).timeout(50000);


  it("GET Cube by invalid period", async() => {

    const explorer  = await new ActorSchema(sampleActors[1]).save();
    const period1 = "M40";
    const timeStamp = xDaysAgo(25);

    //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
    await createTripAndApplication(explorer._id, sampleTrips[1], timeStamp);

    const admin = await createUserAndLogin("ADMINISTRATOR");
    authHeader = admin.authHeader;
    userID = admin.userID;

    return makeRequest()
        .post(`${testURL}`)
        .set(authHeader)
        .expect(200, {result:"Cubes computed succesfully."})
        .then(() => {
          return makeRequest()
            .get(`${testURL}/${explorer._id}/period/${period1}`)
            .set(authHeader)
            .expect(400, {error: "Invalid period format"});
      })

  }).timeout(50000);


// ---------------------------------  GET BY CONDITIONS  ----------------------------------------------------
//                    explorers?period=y01&condition=gt&amount=1000

it("GET explorers by condition: M01 - gt - 1000", async() => {

  const explorer1  = await new ActorSchema(sampleActors[0]).save();
  const explorer2  = await new ActorSchema(sampleActors[1]).save();
  const explorer3  = await new ActorSchema(sampleActors[2]).save();

  const period = "M01";
  const amount = 1000;
  const condition = "gt"; //"eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)

  const timeStamp1 = xDaysAgo(20);
  const timeStamp2 = xDaysAgo(15);
  const timeStamp3 = xDaysAgo(25);

  //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
  await createTripAndApplication(explorer1._id, sampleTrips[2], timeStamp1);
  await createTripAndApplication(explorer2._id, sampleTrips[2], timeStamp2);
  await createTripAndApplication(explorer3._id, sampleTrips[3], timeStamp3);

  const admin = await createUserAndLogin("ADMINISTRATOR");
  authHeader = admin.authHeader;
  userID = admin.userID;

  const explorerExpected = await ActorSchema.findById(explorer3._id);

  return makeRequest()
      .post(`${testURL}`)
      .set(authHeader)
      .expect(200, {result:"Cubes computed succesfully."})
      .then(() => {
        return makeRequest()
          .get(`${testURL}/explorers?period=${period}&condition=${condition}&amount=${amount}`) //explorers?period=y01&condition=gt&amount=1000
          .set(authHeader)
          .then((response) => {
            expect((response.body.explorers[0]._id).toString()).to.equal((explorerExpected._id).toString());
          })
      })
}).timeout(50000);

it("GET explorers by condition: M01 - eq - 1000", async() => {

  const explorer1  = await new ActorSchema(sampleActors[0]).save();
  const explorer2  = await new ActorSchema(sampleActors[1]).save();
  const explorer3  = await new ActorSchema(sampleActors[2]).save();

  const period = "M01";
  const amount = 1000;
  const condition = "eq"; //"eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)

  const timeStamp1 = xDaysAgo(20);
  const timeStamp2 = xDaysAgo(15);
  const timeStamp3 = xDaysAgo(25);

  //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
  await createTripAndApplication(explorer1._id, sampleTrips[2], timeStamp1);
  await createTripAndApplication(explorer2._id, sampleTrips[2], timeStamp2);
  await createTripAndApplication(explorer3._id, sampleTrips[3], timeStamp3);

  const admin = await createUserAndLogin("ADMINISTRATOR");
  authHeader = admin.authHeader;
  userID = admin.userID;

  return makeRequest()
      .post(`${testURL}`)
      .set(authHeader)
      .expect(200, {result:"Cubes computed succesfully."})
      .then(() => {
        return makeRequest()
          .get(`${testURL}/explorers?period=${period}&condition=${condition}&amount=${amount}`) //explorers?period=y01&condition=gt&amount=1000
          .set(authHeader)
          .then((response) => {
            expect(response.body.explorers).to.be.empty;
          })
      })
}).timeout(50000);


it("GET explorers by condition: M01 - ne - 1500", async() => {

  const explorer1  = await new ActorSchema(sampleActors[0]).save();
  const explorer2  = await new ActorSchema(sampleActors[1]).save();
  const explorer3  = await new ActorSchema(sampleActors[2]).save();

  const period = "M01";
  const amount = 1000;
  const condition = "ne"; //"eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)

  const timeStamp1 = xDaysAgo(20);
  const timeStamp2 = xDaysAgo(15);
  const timeStamp3 = xDaysAgo(25);

  //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
  await createTripAndApplication(explorer1._id, sampleTrips[1], timeStamp1);
  await createTripAndApplication(explorer1._id, sampleTrips[2], timeStamp1);
  await createTripAndApplication(explorer2._id, sampleTrips[2], timeStamp2);
  await createTripAndApplication(explorer3._id, sampleTrips[3], timeStamp3);

  const admin = await createUserAndLogin("ADMINISTRATOR");
  authHeader = admin.authHeader;
  userID = admin.userID;

  const explorerExpected1 = await ActorSchema.findById(explorer1._id);
  const explorerExpected2 = await ActorSchema.findById(explorer2._id);
  const explorerExpected3 = await ActorSchema.findById(explorer3._id);

  return makeRequest()
      .post(`${testURL}`)
      .set(authHeader)
      .expect(200, {result:"Cubes computed succesfully."})
      .then(() => {
        return makeRequest()
          .get(`${testURL}/explorers?period=${period}&condition=${condition}&amount=${amount}`) //explorers?period=y01&condition=gt&amount=1000
          .set(authHeader)
          .then((response) => {
            const [e1, e2, e3] = response.body.explorers;
            expect(e1).to.include({name: explorerExpected1.name})
            expect(e2).to.include({name: explorerExpected2.name})
            expect(e3).to.include({name: explorerExpected3.name})
          })
      })
}).timeout(50000);



it("GET explorers by condition: M08 - gte - 1577", async() => {

  const explorer1  = await new ActorSchema(sampleActors[0]).save();
  const explorer2  = await new ActorSchema(sampleActors[1]).save();
  const explorer3  = await new ActorSchema(sampleActors[2]).save();

  const period = "M08";
  const amount = 1577;
  const condition = "gte"; //"eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)

  const timeStamp1 = xDaysAgo(250);
  const timeStamp2 = xDaysAgo(15);
  const timeStamp3 = xDaysAgo(25);

  //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
  await createTripAndApplication(explorer1._id, sampleTrips[1], timeStamp1);  //788.5
  await createTripAndApplication(explorer1._id, sampleTrips[2], timeStamp1);  //788.5 = 1577, explorer1 cumple con la condición pero no con el periodo
  await createTripAndApplication(explorer2._id, sampleTrips[2], timeStamp2);  //300
  await createTripAndApplication(explorer3._id, sampleTrips[3], timeStamp3);  //1800

  const admin = await createUserAndLogin("ADMINISTRATOR");
  authHeader = admin.authHeader;
  userID = admin.userID;

  const explorerExpected = await ActorSchema.findById(explorer3._id);

  return makeRequest()
      .post(`${testURL}`)
      .set(authHeader)
      .expect(200, {result:"Cubes computed succesfully."})
      .then(() => {
        return makeRequest()
          .get(`${testURL}/explorers?period=${period}&condition=${condition}&amount=${amount}`) //explorers?period=y01&condition=gt&amount=1000
          .set(authHeader)
          .then((response) => {
            expect((response.body.explorers[0]._id).toString()).to.equal((explorerExpected._id).toString());
          })
      })
}).timeout(50000);


it("GET explorers by condition: Y02 - lt - 500", async() => {

  const explorer1  = await new ActorSchema(sampleActors[0]).save();
  const explorer2  = await new ActorSchema(sampleActors[1]).save();
  const explorer3  = await new ActorSchema(sampleActors[2]).save();

  const period = "Y02";
  const amount = 500;
  const condition = "lt"; //"eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)

  const timeStamp1 = xDaysAgo(320);
  const timeStamp2 = xDaysAgo(400);
  const timeStamp3 = xDaysAgo(50);

  //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
  await createTripAndApplication(explorer1._id, sampleTrips[1], timeStamp1);  //788.5
  await createTripAndApplication(explorer2._id, sampleTrips[2], timeStamp2);  //300
  await createTripAndApplication(explorer3._id, sampleTrips[3], timeStamp3);  //1800

  const admin = await createUserAndLogin("ADMINISTRATOR");
  authHeader = admin.authHeader;
  userID = admin.userID;

  const explorerExpected = await ActorSchema.findById(explorer2._id);

  return makeRequest()
      .post(`${testURL}`)
      .set(authHeader)
      .expect(200, {result:"Cubes computed succesfully."})
      .then(() => {
        return makeRequest()
          .get(`${testURL}/explorers?period=${period}&condition=${condition}&amount=${amount}`) //explorers?period=y01&condition=gt&amount=1000
          .set(authHeader)
          .then((response) => {
            expect((response.body.explorers[0]._id).toString()).to.equal((explorerExpected._id).toString());
          })
      })
}).timeout(50000);


it("GET explorers by condition: missing field", async() => {

  const explorer1  = await new ActorSchema(sampleActors[0]).save();
  const explorer2  = await new ActorSchema(sampleActors[1]).save();
  const explorer3  = await new ActorSchema(sampleActors[2]).save();

  const period = "Y02";
  const amount = 500;
  const condition = "lt"; //"eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)

  const timeStamp1 = xDaysAgo(320);
  const timeStamp2 = xDaysAgo(400);
  const timeStamp3 = xDaysAgo(50);

  //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
  await createTripAndApplication(explorer1._id, sampleTrips[1], timeStamp1);  //788.5
  await createTripAndApplication(explorer2._id, sampleTrips[2], timeStamp2);  //300
  await createTripAndApplication(explorer3._id, sampleTrips[3], timeStamp3);  //1800

  const admin = await createUserAndLogin("ADMINISTRATOR");
  authHeader = admin.authHeader;
  userID = admin.userID;

  return makeRequest()
      .post(`${testURL}`)
      .set(authHeader)
      .expect(200, {result:"Cubes computed succesfully."})
      .then(() => {
        return makeRequest()
          .get(`${testURL}/explorers?period=${period}&condition=${condition}&amount=${amount}`) //explorers?period=y01&condition=gt&amount=1000
          .set(authHeader)
          .then(() => {
            expect(400, { reason: "Missing fields" });
          })
      })
}).timeout(50000);


it("GET explorers by condition: anonymous user", async() => {

  const explorer1  = await new ActorSchema(sampleActors[0]).save();
  const explorer2  = await new ActorSchema(sampleActors[1]).save();
  const explorer3  = await new ActorSchema(sampleActors[2]).save();

  const amount = 500;
  const condition = "lt"; //"eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)

  const timeStamp1 = xDaysAgo(320);
  const timeStamp2 = xDaysAgo(400);
  const timeStamp3 = xDaysAgo(50);

  //trip0: 724.5 - trip1: 788.5 - trip2: 300 - trip3: 1800
  await createTripAndApplication(explorer1._id, sampleTrips[1], timeStamp1);  //788.5
  await createTripAndApplication(explorer2._id, sampleTrips[2], timeStamp2);  //300
  await createTripAndApplication(explorer3._id, sampleTrips[3], timeStamp3);  //1800

  const admin = await createUserAndLogin("ADMINISTRATOR");
  authHeader = admin.authHeader;
  userID = admin.userID;

  return makeRequest()
      .post(`${testURL}`)
      .set(authHeader)
      .expect(200, {result:"Cubes computed succesfully."})
      .then(() => {
        return makeRequest()
          .get(`${testURL}/explorers?period=${condition}&condition=${condition}&amount=${amount}`) //explorers?period=y01&condition=gt&amount=1000
          .then(() => {
            expect(401,{ message: "No token provided or invalid one" });
          })
      })
}).timeout(50000);

});
  