const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { generatePseudonym } = require('../utils/pseudonym');
const { isInMemoryActive } = require('../config/db');
const memoryStore = require('../config/memoryStore');

// Common User Methods
const userMethods = {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },
  getSignedJwtToken() {
    return jwt.sign(
      {
        id: this._id,
        pseudonymId: this.pseudonymId,
        role: this.role,
        email: this.email,
        fullName: this.fullName
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  },
  toSafeObject() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }
};

// Define Mongoose Schema
const SafetyContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  relationship: { type: String, default: 'Contact' },
  notifyViaSms: { type: Boolean, default: true },
  notifyViaPush: { type: Boolean, default: true }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  pseudonymId: { type: String, unique: true, index: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'trusted-contact', 'authority', 'admin'], default: 'user' },
  languagePreference: { type: String, enum: ['en', 'hi'], default: 'en' },
  safetyCircle: [SafetyContactSchema],
  checkInTimer: {
    active: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: 30 },
    expiresAt: { type: Date },
    status: { type: String, enum: ['idle', 'running', 'expired_alerted', 'resolved'], default: 'idle' }
  },
  medicalLocker: {
    bloodGroup: { type: String, default: '' },
    allergies: [String],
    emergencyNotes: { type: String, default: '' },
    encryptedData: { type: String, default: '' },
    isShareableWithFirstResponders: { type: Boolean, default: true }
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.pseudonymId) {
    this.pseudonymId = generatePseudonym('NX');
  }
  if (this.isModified && this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (next) next();
});

Object.assign(UserSchema.methods, userMethods);

let MongooseUserModel;
try {
  MongooseUserModel = mongoose.model('User', UserSchema);
} catch {
  MongooseUserModel = mongoose.models.User;
}

// In-Memory Helper with Pre-hooks
const userMemoryPreHook = async function () {
  if (!this.pseudonymId) {
    this.pseudonymId = generatePseudonym('NX');
  }
  if (this.password && !this.password.startsWith('$2')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (!this.role) this.role = 'user';
  if (!this.safetyCircle) this.safetyCircle = [];
};

const getMemoryCol = () => {
  return memoryStore.getCollection('User', { preHooks: [userMemoryPreHook] }, userMethods);
};

const createQueryPromise = (getDocFn) => {
  return {
    select: function () {
      return this;
    },
    populate: function () {
      return this;
    },
    then: async function (resolve, reject) {
      try {
        const doc = await getDocFn();
        resolve(doc);
      } catch (err) {
        if (reject) reject(err);
        else throw err;
      }
    }
  };
};

// Unified Model Proxy
const UserModelProxy = {
  findOne(query) {
    if (isInMemoryActive()) {
      const q = { ...query };
      if (q.email) q.email = q.email.toLowerCase();
      return createQueryPromise(() => getMemoryCol().findOne(q));
    }
    return MongooseUserModel.findOne(query);
  },

  findById(id) {
    if (isInMemoryActive()) {
      return createQueryPromise(() => getMemoryCol().findById(id));
    }
    return MongooseUserModel.findById(id);
  },

  find(query = {}) {
    if (isInMemoryActive()) {
      return createQueryPromise(() => getMemoryCol().find(query));
    }
    return MongooseUserModel.find(query);
  },

  async create(data) {
    if (isInMemoryActive()) {
      const col = getMemoryCol();
      const docData = { ...data };
      if (docData.email) docData.email = docData.email.toLowerCase();
      return col.create(docData);
    }
    return MongooseUserModel.create(data);
  },

  async deleteOne(query) {
    if (isInMemoryActive()) {
      return getMemoryCol().deleteOne(query);
    }
    return MongooseUserModel.deleteOne(query);
  },

  async deleteMany(query) {
    if (isInMemoryActive()) {
      return getMemoryCol().deleteMany(query);
    }
    return MongooseUserModel.deleteMany(query);
  },

  async updateOne(query, update) {
    if (isInMemoryActive()) {
      return getMemoryCol().updateOne(query, update);
    }
    return MongooseUserModel.updateOne(query, update);
  }
};

module.exports = UserModelProxy;
