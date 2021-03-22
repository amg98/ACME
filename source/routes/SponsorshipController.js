const { CheckSponsor } = require("../middlewares/Auth");
const Validators = require("../middlewares/Validators");
const SponsorshipSchema = require("../models/SponsorshipSchema");
const Payments = require("../Payments");
const SystemParamsController = require("./SystemParamsController");
const Messages = require("../Messages");

/**
 * Get a specific sponsorship for a sponsor
 * @route GET /sponsorships/{id}
 * @group Sponsorships - Trip advertising
 * @param {string} id.path.required     - Sponsorship identifier
 * @returns {Array.<Sponsorship>}   200 - Returns the requested sponsorship(s)
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Sponsorship not found
 * @returns {DatabaseError}         500 - Database error
 */

/**
* Get all sponsorships for a sponsor
* @route GET /sponsorships
* @group Sponsorships - Trip advertising
* @returns {Array.<Sponsorship>}   200 - Returns the requested sponsorship(s)
* @returns {}                      401 - User is not authorized to perform this operation
* @returns {DatabaseError}         500 - Database error
*/
const getSponsorship = async (req, res) => {
    try {
        if (req.params.id) {
            const docs = await SponsorshipSchema.find({ _id: req.params.id, sponsorID: req.sponsorID })
                .select("-sponsorID -paymentID")
                .exec();
            if (docs.length > 0) {
                return res.status(200).json(docs[0]);
            } else {
                return res.sendStatus(404);
            }
        } else {
            const docs = await SponsorshipSchema.find({ sponsorID: req.sponsorID })
                .select("-sponsorID")
                .exec();
            return res.status(200).json(docs);
        }
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Get a random paid sponsorship for a trip
 * @route GET /trips/{id}/random-sponsorship
 * @group Trip - Trip
 * @param {string} id.path.required     - Trip identifier
 * @returns {Sponsorship.model}     200 - Returns the random paid sponsorship
 * @returns {}                      404 - Trip not found
 * @returns {DatabaseError}         500 - Database error
 */
const getRandomSponsorship = async (req, res) => {
    try {
        const docs = await SponsorshipSchema.find({ tripID: req.params.id, isPaid: true })
            .select("-sponsorID -paymentID -tripID -isPaid")
            .exec();
        if (docs.length > 0) {
            return res.status(200).json(docs[(Math.random() * (docs.length + 1)) << 0]);
        } else {
            return res.sendStatus(404);
        }
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
 * @returns {}                      422 - If trip does not exist
 * @returns {DatabaseError}         500 - Database error
 */
const createSponsorship = async (req, res) => {
    delete req.body.sponsorship._id;
    delete req.body.sponsorship.isPaid;
    delete req.body.sponsorship.paymentID;
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
 * @route PUT /sponsorships/{id}
 * @group Sponsorships - Trip advertising
 * @param {string} id.path.required     - Sponsorship identifier
 * @param {SponsorshipPut.model} sponsorship.body.required  - Sponsorship updates
 * @returns {Sponsorship}           200 - Returns the current state for this sponsorship
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      422 - If trip does not exist
 * @returns {DatabaseError}         500 - Database error
 */
const updateSponsorship = async (req, res) => {
    delete req.body.sponsorship._id;
    delete req.body.sponsorship.isPaid;
    delete req.body.sponsorship.sponsorID;
    delete req.body.sponsorship.paymentID;

    try {
        let doc = await SponsorshipSchema.findOneAndUpdate({ _id: req.params.id, sponsorID: req.sponsorID }, req.body.sponsorship);
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
 * @route DELETE /sponsorships/{id}
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
 * @param {SponsorshipPaymentPost.model} paymentData.body.required    - Payment data
 * @returns {string}                200 - Returns the paypal URL, which can be used to pay
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Specified sponsorship does not exist
 * @returns {DatabaseError}         500 - Database or payment error
 */
const createPayment = async (req, res) => {
    try {
        const flatRate = await SystemParamsController.getFlatRate();

        const payment = await Payments.createPayment({
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

        try {
            let doc = await SponsorshipSchema.findOneAndUpdate({ _id: req.body.paymentData.id, sponsorID: req.sponsorID }, { paymentID: payment.paymentID });
            if (!doc) {
                throw "Database error";
            }
        } catch (err) {
            res.status(500).json({ reason: "Database error" });
        }

        return res.status(200).send(payment.paymentURL);
    } catch (err) {
        res.status(500).json({ reason: "Payment error" });
    }
};

/**
 * Confirm a paypal payment for a sponsorship
 * @route POST /sponsorships/payment-confirm
 * @group Sponsorships - Trip advertising
 * @param {SponsorshipPaymentConfirmPost.model} confirmData.body.required    - Payment confirmation data
 * @returns {}                      204 - Payment has been confirmed successfully
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Specified sponsorship does not exist
 * @returns {DatabaseError}         500 - Database error
 */
const confirmPayment = async (req, res) => {
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
            let doc = await SponsorshipSchema.findOneAndUpdate({
                _id: req.body.confirmData.id,
                sponsorID: req.sponsorID,
                paymentID: req.body.confirmData.paymentID
            }, { isPaid: true });
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
    router.get(`${apiPrefix}/trips/:id/random-sponsorship`, getRandomSponsorship);
    router.post(apiURL, CheckSponsor, Validators.Required("body", "sponsorship"), Validators.TripExists("body", "sponsorship", "tripID"), createSponsorship);
    router.put(`${apiURL}/:id?`, CheckSponsor, Validators.Required("body", "sponsorship"), Validators.TripExists("body", "sponsorship", "tripID", true), Validators.Required("params", "id"), updateSponsorship);
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
* @typedef SponsorshipPaymentPost
* @property {SponsorshipPayment.model} paymentData - Sponsorship to add
*/

/**
 * @typedef SponsorshipPayment
 * @property {string} id                        - Sponsorship ID to pay
 * @property {string} successURL                - URL to redirect on payment success
 * @property {string} cancelURL                 - URL to redirect on payment cancellation
 * @property {string} lang                      - Language for descriptions. Available: eng/es
 */

/**
* @typedef SponsorshipPaymentConfirmPost
* @property {SponsorshipPaymentConfirm.model} confirmData - Sponsorship to update
*/

/**
 * @typedef SponsorshipPaymentConfirm
 * @property {string} id                        - Sponsorship to pay
 * @property {string} paymentID                 - Paypal payment ID
 * @property {string} payerID                   - Paypal payer ID
 */
