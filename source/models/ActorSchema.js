const mongoose = require("mongoose");
const Bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const ActorSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "The email format is not valid"
        },
        unique: true
    },

    phoneNumber: String,

    address: String,

    password: {
        type: String,
        required: true,
        minLength: 5
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    roles: [{
        type: String,
        enum: ['MANAGER', 'EXPLORER', 'SPONSOR', 'ADMINISTRATOR'],
        required: true
    }]

});

ActorSchema.pre('save', function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = Bcrypt.hashSync(this.password, 10);
    next();
});

ActorSchema.pre('updateOne', async function() {
    const docToUpdate = await this.model.findOne(this.getQuery())

    if (docToUpdate.password !== this._update.password) {
      const newPassword = Bcrypt.hashSync(this._update.password, 10)
      this._update.password = newPassword
    }
  })

module.exports = mongoose.model("Actor", ActorSchema);
