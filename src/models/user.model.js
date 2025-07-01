import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, "Phone number required"],
        unique: true,
        index: true

    },
    role: {
        type: String,
        enum: ["customer", "frenchies", "superAdmin"],
        default: "customer"
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true })

const frenchiesSchema = new mongoose.Schema({
    ...userSchema.obj,
    frenchiesID: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
    },
    city: {
        type: String,

    },
    state: {
        type: String,

    },
    country: {
        type: String,

    },
    address: {
        type: String,

    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    role: {
        type: String,
        enum: ["frenchies"],
        default: "frenchies"
    },
    refreshToken: {
        type: String,
    },
    isActivated: {
        type: Boolean,
        default: true
    }


}, { timestamps: true })


const superAdminSchema = new mongoose.Schema({
    ...userSchema.obj,
    role: {
        type: String,
        enum: ["superAdmin"],
        default: "superAdmin"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

    },
    password: {
        type: String,
        required: true
    },
    frenchies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Frenchies"
    }],
    refreshToken: {
        type: String,
    }

})


frenchiesSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
});

frenchiesSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

frenchiesSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        phone: this.phone,
        role: this.role

    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}
frenchiesSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role,
        phone: this.phone


    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}



// super admin work
superAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()

});
superAdminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


superAdminSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        phone: this.phone,
        role: this.role

    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}
superAdminSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role,
        phone: this.phone


    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

const User = mongoose.model('User', userSchema);
const Frenchies = mongoose.model('Frenchies', frenchiesSchema);

superAdminSchema.plugin(mongooseAggregatePaginate);
const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema)
    




export { User, Frenchies, SuperAdmin };
