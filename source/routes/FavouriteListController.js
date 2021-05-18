const { CheckExplorer } = require("../middlewares/Auth");
const Validators = require("../middlewares/Validators");
const FavouriteLists = require("../models/FavouriteList");

/**
 * Synchronize favourite lists
 * @route POST /favourite-lists/sync
 * @group Favourite lists
 * @param {FavouriteListsReq.model} lists.body.required     - Favourite lists
 * @returns {FavouriteLists.model}   200 - Returns the synchronized favourite lists
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
const syncFavouriteLists = async (req, res) => {

    delete req.body.lists._id
    req.body.lists.explorerID = req.explorerID

    try {
        const docs = await FavouriteLists.find({ explorerID: req.explorerID }).exec();
        if(docs.length === 0) {
            await new FavouriteLists(req.body.lists).save();
            return res.status(200).json(req.body.lists);
        }
        
        if(docs[0].timestamp > new Date(req.body.lists.timestamp)) {
            return res.status(200).json(docs[0])
        } else {
            await FavouriteLists.findOneAndUpdate({ explorerID: req.explorerID }, req.body.lists)
            return res.status(200).json(req.body.lists)
        }
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
}

module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/favourite-lists`;
    router.post(`${apiURL}/sync`, CheckExplorer, Validators.Required("body", "lists"), syncFavouriteLists);
};

/**
 * @typedef FavouriteList
 * @property {string} name              - List name
 * @property {Array.<string>} trips     - List favourite trips
 */

/**
 * @typedef FavouriteListsReq
 * @property {string} timestamp.required            - Timestamp
 * @property {Array.<FavouriteList>} favouriteLists - Favourite lists
 */

 /**
 * @typedef FavouriteLists
 * @property {string} _id                           - Unique identifier
 * @property {string} explorerID                    - Explorer identifier
 * @property {string} timestamp.required            - Timestamp
 * @property {Array.<FavouriteList>} favouriteLists - Favourite lists
 */
