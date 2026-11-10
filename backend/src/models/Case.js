const crypto = require('crypto');
const mongoose = require('mongoose');
const { isInMemoryActive } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const CaseSchema = new mongoose.Schema({
  caseId: {
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
  title: {
    type: String,
    default: 'Emergency Safety Incident'
  },
  currentStage: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  stageProgress: {
    stage1Protection: { type: Boolean, default: true },
    stage2Evidence: { type: Boolean, default: false },
    stage3Integrity: { type: Boolean, default: false },
    stage4Justice: { type: Boolean, default: false },
    stage5Support: { type: Boolean, default: false }
  },
  sosSessionId: {
    type: String
  },
  evidenceIds: [{
    type: String
  }],
  complaintTrackingId: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'evidence_collected', 'notarized_onchain', 'complaint_filed', 'resolved'],
    default: 'active'
  }
}, { timestamps: true });

let MongooseCaseModel;
try {
  MongooseCaseModel = mongoose.model('Case', CaseSchema);
} catch {
  MongooseCaseModel = mongoose.models.Case;
}

const getMemoryCol = () => {
  return memoryStore.getCollection('Case', { preHooks: [] });
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

const CaseProxy = {
  findOne(query) {
    if (isInMemoryActive()) return createQueryPromise(() => getMemoryCol().findOne(query));
    return MongooseCaseModel.findOne(query);
  },

  findById(id) {
    if (isInMemoryActive()) return createQueryPromise(() => getMemoryCol().findById(id));
    return MongooseCaseModel.findById(id);
  },

  find(query = {}) {
    if (isInMemoryActive()) return createQueryPromise(() => getMemoryCol().find(query));
    return MongooseCaseModel.find(query);
  },

  async create(data) {
    if (isInMemoryActive()) {
      const docData = { ...data };
      if (!docData.caseId) {
        docData.caseId = `CASE-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      }
      return getMemoryCol().create(docData);
    }
    return MongooseCaseModel.create(data);
  },

  async updateOne(query, update) {
    if (isInMemoryActive()) return getMemoryCol().updateOne(query, update);
    return MongooseCaseModel.updateOne(query, update);
  }
};

module.exports = CaseProxy;

