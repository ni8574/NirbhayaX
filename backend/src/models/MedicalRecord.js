const crypto = require('crypto');
const mongoose = require('mongoose');
const { isInMemoryActive } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const MedicalRecordSchema = new mongoose.Schema({
  recordId: {
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
  userPseudonym: {
    type: String,
    required: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  authTag: {
    type: String,
    required: true
  },
  mlcCaseNumber: {
    type: String,
    default: ''
  },
  injuryDocumentation: [{
    id: String,
    date: { type: Date, default: Date.now },
    bodyPart: String,
    injuryType: String,
    severity: String,
    notes: String,
    photoHash: String
  }],
  accessPasses: [{
    passCode: String,
    doctorName: String,
    hospitalName: String,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
    grantedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

let MongooseMedicalModel;
try {
  MongooseMedicalModel = mongoose.model('MedicalRecord', MedicalRecordSchema);
} catch {
  MongooseMedicalModel = mongoose.models.MedicalRecord;
}

const getMemoryCol = () => {
  return memoryStore.getCollection('MedicalRecord', { preHooks: [] });
};

const createQueryPromise = (getDocFn) => {
  return {
    select: function () { return this; },
    populate: function () { return this; },
    sort: function () { return this; },
    then: async function (resolve, reject) {
      try {
        const doc = await getDocFn();
        resolve(doc);
      } catch (err) {
        reject(err);
      }
    }
  };
};

const MedicalRecord = {
  create: async function (data) {
    if (isInMemoryActive()) {
      const col = getMemoryCol();
      return col.create(data, MedicalRecordSchema.methods);
    }
    return MongooseMedicalModel.create(data);
  },

  findOne: function (query) {
    if (isInMemoryActive()) {
      return createQueryPromise(async () => {
        const col = getMemoryCol();
        return col.findOne(query, MedicalRecordSchema.methods);
      });
    }
    return MongooseMedicalModel.findOne(query);
  },

  findById: function (id) {
    if (isInMemoryActive()) {
      return createQueryPromise(async () => {
        const col = getMemoryCol();
        return col.findById(id, MedicalRecordSchema.methods);
      });
    }
    return MongooseMedicalModel.findById(id);
  },

  find: function (query) {
    if (isInMemoryActive()) {
      return createQueryPromise(async () => {
        const col = getMemoryCol();
        return col.find(query, MedicalRecordSchema.methods);
      });
    }
    return MongooseMedicalModel.find(query);
  }
};

module.exports = MedicalRecord;

