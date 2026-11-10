const crypto = require('crypto');
const mongoose = require('mongoose');
const { isInMemoryActive } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const SOSSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pseudonymId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  },
  triggerType: {
    type: String,
    enum: ['manual_button', 'missed_checkin', 'fall_detection_mock', 'quick_tap'],
    default: 'manual_button'
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number, default: 10 },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    address: { type: String, default: 'Location Acquired via GPS' },
    timestamp: { type: Date, default: Date.now }
  },
  locationHistory: [{
    lat: Number,
    lng: Number,
    speed: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  alertRecipients: [{
    contactName: String,
    contactPhone: String,
    relationship: String,
    status: { type: String, enum: ['queued', 'delivered', 'failed'], default: 'delivered' },
    smsContent: String,
    deliveredAt: { type: Date, default: Date.now }
  }],
  caseId: {
    type: String,
    index: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

let MongooseSOSModel;
try {
  MongooseSOSModel = mongoose.model('SOSSession', SOSSessionSchema);
} catch {
  MongooseSOSModel = mongoose.models.SOSSession;
}

const getMemoryCol = () => {
  return memoryStore.getCollection('SOSSession', { preHooks: [] });
};

const createQueryPromise = (getDocFn) => {
  return {
    select: function () { return this; },
    populate: function () { return this; },
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

const SOSSessionProxy = {
  findOne(query) {
    if (isInMemoryActive()) {
      return createQueryPromise(() => getMemoryCol().findOne(query));
    }
    return MongooseSOSModel.findOne(query);
  },

  findById(id) {
    if (isInMemoryActive()) {
      return createQueryPromise(() => getMemoryCol().findById(id));
    }
    return MongooseSOSModel.findById(id);
  },

  find(query = {}) {
    if (isInMemoryActive()) {
      return createQueryPromise(() => getMemoryCol().find(query));
    }
    return MongooseSOSModel.find(query);
  },

  async create(data) {
    if (isInMemoryActive()) {
      const docData = { ...data };
      if (!docData.sessionId) {
        docData.sessionId = `SOS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      }
      return getMemoryCol().create(docData);
    }
    return MongooseSOSModel.create(data);
  },

  async deleteOne(query) {
    if (isInMemoryActive()) return getMemoryCol().deleteOne(query);
    return MongooseSOSModel.deleteOne(query);
  },

  async updateOne(query, update) {
    if (isInMemoryActive()) return getMemoryCol().updateOne(query, update);
    return MongooseSOSModel.updateOne(query, update);
  }
};

module.exports = SOSSessionProxy;

