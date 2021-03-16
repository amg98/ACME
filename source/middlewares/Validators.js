const SponsorshipSchema = require("../models/SponsorshipSchema");
const Trip = require("../models/TripSchema");
const Application = require("../models/ApplicationSchema");

/**
 * @typedef ValidationError
 * @property {string} reason   - User-friendly reason message
 */

module.exports.Required = (objectName, fieldName) => (req, res, next) => {
  if (
    req[objectName] &&
    req[objectName].hasOwnProperty(fieldName) &&
    req[objectName][fieldName]
  ) {
    next();
  } else {
    res.status(400).json({ reason: "Missing fields" });
  }
};

module.exports.Range = (objectName, fieldName, minValue, maxValue) => (
  req,
  res,
  next
) => {
  req[objectName][fieldName] = Number(req[objectName][fieldName]);
  const field = req[objectName][fieldName];
  if (field >= minValue && field <= maxValue) {
    next();
  } else {
    res.status(400).json({ reason: "Exceeded boundaries" });
  }
};

const CheckSponsorshipNotPaid = (
  objectName,
  subobjectName,
  fieldName
) => async (req, res) => {
  if (
    !req[objectName][subobjectName] ||
    !req[objectName][subobjectName].hasOwnProperty(fieldName) ||
    !req[objectName][subobjectName][fieldName]
  ) {
    res.status(400).json({ reason: "Missing sponsorship ID" });
    throw 400;
  }

  const id = req[objectName][subobjectName][fieldName];
  let docs;
  try {
    docs = await SponsorshipSchema.find({
      _id: id,
      sponsorID: req.sponsorID,
    }).exec();
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
    throw 500;
  }

  if (docs.length === 1) {
    if (docs[0].isPaid) {
      res.sendStatus(401);
      throw 401;
    }
  } else {
    res.sendStatus(404);
    throw 404;
  }
};

module.exports.CheckPaymentData = (objectName, fieldName) => async (
  req,
  res,
  next
) => {
  try {
    await CheckSponsorshipNotPaid(objectName, fieldName, "id")(req, res);
  } catch (errorCode) {
    return;
  }

  if (
    !req[objectName][fieldName].successURL ||
    !req[objectName][fieldName].cancelURL
  ) {
    return res.status(400).json({ reason: "Missing success/cancel URL" });
  }

  if (!req[objectName][fieldName].lang) {
    return res.status(400).json({ reason: "Missing language" });
  }

  if (
    req[objectName][fieldName].lang !== "eng" &&
    req[objectName][fieldName].lang !== "es"
  ) {
    return res.status(400).json({ reason: "Invalid language" });
  }

  next();
};

module.exports.CheckConfirmData = (objectName, fieldName) => async (
  req,
  res,
  next
) => {
  try {
    await CheckSponsorshipNotPaid(objectName, fieldName, "id")(req, res);
  } catch (errorCode) {
    return;
  }

  if (
    !req[objectName][fieldName].paymentID ||
    !req[objectName][fieldName].payerID
  ) {
    return res.status(400).json({ reason: "Missing paypal payment data" });
  }

  next();
};

module.exports.TripExists = (objectName, subobjectName, fieldName) => (
  req,
  res,
  next
) => {
  // TODO
  // fieldName puede ser undefined
  next();
};

module.exports.CheckDates = (objectName, fieldName) => (req, res, next) => {
  startDate = new Date(req[objectName][fieldName]["startDate"]);
  endDate = new Date(req[objectName][fieldName]["endDate"]);
  currentDate = new Date();

  if (startDate > currentDate && endDate > startDate) {
    next();
  } else {
    res.status(400).json({ reason: "Date chosen wrongly" });
  }
};

module.exports.CheckNotPublished = () => (req, res, next) => {
  Trip.findOne({ _id: req.params.id }, function (err, trip) {
    if (trip.isPublished) {
      res.status(400).json({ reason: "The trip has already been published" });
    } else {
      next();
    }
  });
};

module.exports.CheckNotStarted = () => (req, res, next) => {
  Trip.findOne({ _id: req.params.id }, function (err, trip) {
    if (Date(trip.startDate) < Date.now()) {
      res.status(400).json({ reason: "The trip has already started" });
    } else {
      next();
    }
  });
};

module.exports.CheckNoApplicationsAttached = () => (req, res, next) => {
  //TODO
  Application.find(
    { tripID: req.params.id, status: "ACCEPTED" },
    function (err, docs) {
      if (docs.length > 0) {
        res
          .status(400)
          .json({ reason: "This trip has applications associated" });
      } else {
        next();
      }
    }
  );
};
