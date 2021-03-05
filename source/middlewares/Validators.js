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

module.exports.CheckPaymentData = (objectName, fieldName) => (
  req,
  res,
  next
) => {
  // TODO
  next();
};

module.exports.CheckConfirmData = (objectName, fieldName) => (
  req,
  res,
  next
) => {
  // TODO
  next();
};

module.exports.TripExists = () => (req, res, next) => {
  // TODO
  // req.body.sponsorship.tripID
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
  let id;
  if (req.body.trip) {
    id = req.body.trip._id;
  } else {
    id = req.params.id;
  }
  Trip.findOne({ _id: id }, function (err, trip) {
    if (trip.isPublished) {
      res.status(400).json({ reason: "The trip has already been published" });
    } else {
      next();
    }
  });
};

module.exports.CheckNotStarted = () => (req, res, next) => {
  let id;
  if (req.body.trip) {
    id = req.body.trip._id;
  } else {
    id = req.params.id;
  }
  Trip.findOne({ _id: id }, function (err, trip) {
    if (Date(trip.startDate) > Date.now()) {
      res.status(400).json({ reason: "The trip has already started" });
    } else {
      next();
    }
  });
};

module.exports.CheckNoApplicationsAttached = () => (req, res, next) => {
  //TODO
  Application.find({ tripID: req.params.id }, function (err, docs) {
    if (docs.length > 0) {
      res.status(400).json({ reason: "This trip has applications associated" });
    } else {
      next();
    }
  });
};
