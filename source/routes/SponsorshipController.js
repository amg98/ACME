const { CheckSponsor } = require("../middlewares/Auth");
const Validators = require("../middlewares/Validators");
const SponsorshipSchema = require("../models/SponsorshipSchema");
const Payments = require("../Payments");
const SystemParamsController = require("./SystemParamsController");
const Messages = require("../Messages");

/**
 * Get a specific sponsorship for a sponsor
 * @route GET /sponsorships
 * @group Sponsorships - Trip advertising
 * @param {string} id.path              - Sponsorship identifier
 * @returns {Array.<Sponsorship>}   200 - Returns the requested sponsorship(s)
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getSponsorship = async (req, res) => {
    try {
        let docs;
        if (req.params.id) {
            docs = await SponsorshipSchema.find({ _id: req.params.id, sponsorID: req.sponsorID })
                .select("-sponsorID")
                .exec();
        } else {
            docs = await SponsorshipSchema.find({ sponsorID: req.sponsorID })
                .select("-sponsorID")
                .exec();
        }
        return res.status(200).json(docs);
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Create a new sponsorship for a specific sponsor
 * @route POST /sponsorships
 * @group Sponsorships - Trip advertising
 * @param {SponsorshipPost.model} sponsorship.body.required  - New sponsorship
 * @returns {string}                200 - Returns the sponsorship identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const createSponsorship = async (req, res) => {
    delete req.body.sponsorship._id;
    delete req.body.sponsorship.isPaid;
    req.body.sponsorship.sponsorID = req.sponsorID;
    try {
        const doc = await new SponsorshipSchema(req.body.sponsorship).save();
        res.status(200).send(doc._id);
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Update an existing sponsorship for a specific sponsor
 * @route PUT /sponsorships
 * @group Sponsorships - Trip advertising
 * @param {SponsorshipPut.model} sponsorship.body.required  - Sponsorship updates
 * @returns {Sponsorship}           200 - Returns the current state for this sponsorship
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const updateSponsorship = async (req, res) => {
    delete req.body.sponsorship.isPaid;
    delete req.body.sponsorship.sponsorID;
    try {
        let doc = await SponsorshipSchema.findOneAndUpdate({ _id: req.body.sponsorship._id, sponsorID: req.sponsorID }, req.body.sponsorship);
        if (doc) {
            doc = await SponsorshipSchema.findById(doc._id);
            return res.status(200).json(doc);
        } else {
            return res.sendStatus(401);
        }
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Delete an existing sponsorship for a specific sponsor
 * @route DELETE /sponsorships
 * @group Sponsorships - Trip advertising
 * @param {string} id.path.required     - Sponsorship identifier
 * @returns {Sponsorship}           200 - Returns the deleted sponsorship
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteSponsorship = async (req, res) => {
    try {
        const doc = await SponsorshipSchema.findOneAndDelete({ _id: req.params.id, sponsorID: req.sponsorID });
        if (doc) {
            return res.status(200).json(doc);
        } else {
            return res.sendStatus(401);
        }
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Generate a paypal URL for a sponsorship payment
 * @route POST /sponsorships/payment
 * @group Sponsorships - Trip advertising
 * @param {SponsorshipPayment.model} paymentData.body.required    - Payment data
 * @returns {string}                200 - Returns the paypal URL, which can be used to pay
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Specified sponsorship does not exist
 * @returns {DatabaseError}         500 - Database or payment error
 */
const createPayment = async (req, res) => {
    try {
        const flatRate = await SystemParamsController.getFlatRate();

        const paymentURL = await Payments.createPayment({
            successURL: req.body.paymentData.successURL,
            cancelURL: req.body.paymentData.cancelURL,
            itemList: [{
                "name": Messages.SUBSCRIPTION_PAYMENT_NAME[req.body.paymentData.lang],
                "sku": "001",
                "price": flatRate.toString(),
                "currency": "EUR",
                "quantity": 1
            }],
            amount: {
                "currency": "EUR",
                "total": flatRate.toString(),
            },
            description: Messages.SUBSCRIPTION_PAYMENT_DESC[req.body.paymentData.lang],
        });
        return res.status(200).send(paymentURL);
    } catch (err) {
        res.status(500).json({ reason: "Payment error" });
    }
};

/**
 * Confirm a paypal payment for a sponsorship
 * @route POST /sponsorships/payment-confirm
 * @group Sponsorships - Trip advertising
 * @param {SponsorshipPaymentConfirm.model} confirmData.body.required    - Payment confirmation data
 * @returns {}                      204 - Payment has been confirmed successfully
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Specified sponsorship does not exist
 * @returns {DatabaseError}         500 - Database error
 */
const confirmPayment = (req, res) => {
    try {

        const flatRate = await SystemParamsController.getFlatRate();

        await Payments.executePayment({
            payerID: req.body.confirmData.payerID,
            paymentID: req.body.confirmData.paymentID,
            amount: {
                "currency": "EUR",
                "total": flatRate.toString(),
            },
        });

        try {
            let doc = await SponsorshipSchema.findOneAndUpdate({ _id: req.body.confirmData.id, sponsorID: req.sponsorID }, { isPaid: true });
            if (doc) {
                return res.sendStatus(204);
            } else {
                throw "Database error";
            }
        } catch (err) {
            res.status(500).json({ reason: "Database error" });
        }
    } catch (err) {
        res.status(500).json({ reason: "Payment error" });
    }
};

module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/sponsorships`;
    router.get(`${apiURL}/:id?`, CheckSponsor, getSponsorship);
    router.post(apiURL, CheckSponsor, Validators.Required("body", "sponsorship"), Validators.TripExists("body", "sponsorship", "tripID"), createSponsorship);
    router.put(apiURL, CheckSponsor, Validators.Required("body", "sponsorship"), Validators.TripExists("body", "sponsorship", "tripID"), updateSponsorship);
    router.delete(`${apiURL}/:id?`, CheckSponsor, Validators.Required("params", "id"), deleteSponsorship);
    router.post(`${apiURL}/payment`, CheckSponsor, Validators.Required("body", "paymentData"), Validators.CheckPaymentData("body", "paymentData"), createPayment);
    router.post(`${apiURL}/payment-confirm`, CheckSponsor, Validators.Required("body", "confirmData"), Validators.CheckConfirmData("body", "confirmData"), confirmPayment);
};

/**
 * @typedef SponsorshipPost
 * @property {Sponsorship.model} sponsorship - Sponsorship to add
 */

/**
 * @typedef SponsorshipPut
 * @property {Sponsorship.model} sponsorship - Sponsorship to update
 */

/**
 * @typedef Sponsorship
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {string} bannerURL.required        - Banner URL
 * @property {string} landingPageURL.required   - Landing page URL
 * @property {string} tripID.required           - Trip to sponsor
 * @property {boolean} isPaid                   - Is this sponsorship paid? (ignored in POST/PUT requests)
 */

/**
 * @typedef SponsorshipPayment
 * @property {string} id                        - Sponsorship ID to pay
 * @property {string} successURL                - URL to redirect on payment success
 * @property {string} cancelURL                 - URL to redirect on payment cancellation
 * @property {string} lang                      - Language for descriptions. Available: eng/es
 */

/**
 * @typedef SponsorshipPaymentConfirm
 * @property {string} id                        - Sponsorship to pay
 * @property {string} paymentID                 - Paypal payment ID
 * @property {string} payerID                   - Paypal payer ID
 */
