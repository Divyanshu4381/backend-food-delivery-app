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
        enum: ["customer", "frenchies", "deliveryBoy", "superAdmin"],
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
        unique: true,
        index: true
    },
    ownerName: {
        type: String,
        required: [true, "Owner Name is required"]
    },
    frenchieName: {
        type: String,
        required: true,
        // unique: true,
        index: true
    },
    profilePhoto: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    contact_no: {
        type: String
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
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    customers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    Delivery_Boy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Delivery_Boy"
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],

    salesCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Approved", "Rejected", "Pending"],
        default: "Approved"
    },

    isActivated: {
        type: Boolean,
        default: true
    }


}, { timestamps: true })


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




const deliveryBoySchema = new mongoose.Schema({
  deliveryBoyID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  frenchiesID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Frenchies",
    index: true
  },

  name: {
    type: String,
    required: [true, "Delivery Boy Name is required"],
    index: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"],
    index: true
  },

  alternameContact_no: {
    type: String,
  },

  profilePhoto: {
    type: String,
  },

  password: {
    type: String,
    required: true,
  },

  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false
  },

  address: String,
  city: String,
  state: String,
  country: String,


  isAvailable: {
    type: Boolean,
    default: true
  },

  role: {
    type: String,
    enum: ["deliveryBoy"],
    default: "deliveryBoy"
  },

  refreshToken: String,

  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  }],
  totalOrder: {
    type: Number,
    default: 0
  },
  completeOrder: {
    type: Number,
    default: 0
  },
  pendingOrder: {
    type: Number,
    default: 0
  },

  ratings: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },

  aadharNumber: {
    type: String,
    required: true
  },

  vehicleDetails: {
    type: Object, // Example: { number: 'DL01AB1234', type: 'bike' }
    default: {}
  },

  documentsUploaded: {
    type: Boolean,
    default: false
  },


  isActivated: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });


// 🔐 Hash password before save
deliveryBoySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});





const superAdminSchema = new mongoose.Schema({
    ...userSchema.obj,
    role: {
        type: String,
        enum: ["superAdmin"],
        default: "superAdmin"
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
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

}, { timestamps: true })





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

frenchiesSchema.index({ location: "2dsphere" });
const Frenchies = mongoose.model('Frenchies', frenchiesSchema);
const Delivery_Boy = mongoose.model('Delivery_Boy', deliveryBoySchema);

superAdminSchema.plugin(mongooseAggregatePaginate);
const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema)





export { User, Frenchies,Delivery_Boy, SuperAdmin };
