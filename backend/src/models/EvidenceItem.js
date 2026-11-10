const crypto = require('crypto');
const mongoose = require('mongoose');
const { isInMemoryActive } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const EvidenceItemSchema = new mongoose.Schema({
  evidenceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  caseId: {
    type: String,
    index: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerPseudonym: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    default: 'application/octet-stream'
  },
  fileSizeBytes: {
    type: Number,
    required: true
  },
  encryptedFilePath: {
    type: String
  },
  iv: {
    type: String
  },
  authTag: {
    type: String
  },
  clientSha256: {
    type: String,
    required: true
  },
  serverSha256: {
    type: String,
    required: true
  },
  perceptualHash: {
    type: String
  },
  blockchainRecord: {
    isRegistered: { type: Boolean, default: false },
    txHash: { type: String, default: '' },
    blockNumber: { type: Number, default: 0 },
    contractAddress: { type: String, default: '' },
    registeredAt: { type: Date }
  },
  analysis: {
    detectedPersonsCount: { type: Number, default: 0 },
    detectedFacesCount: { type: Number, default: 0 },
    extractedKeyframes: [String],
    transcription: { type: String, default: '' },
    missingDetails: [String],
    completenessScore: { type: Number, default: 75 },
    factualSummary: { type: String, default: '' }
  },
  consentList: [{
    granteePseudonymOrRole: String,
    grantedToEmail: String,
    role: { type: String, enum: ['police', 'lawyer', 'ngo'] },
    validUntil: Date,
    revoked: { type: Boolean, default: false },
    grantedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

let MongooseEvidenceModel;
try {
  MongooseEvidenceModel = mongoose.model('EvidenceItem', EvidenceItemSchema);
} catch {
  MongooseEvidenceModel = mongoose.models.EvidenceItem;
}

const getMemoryCol = () => {
  return memoryStore.getCollection('EvidenceItem', { preHooks: [] });
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
        if (reject) reject(err);
        else throw err;
      }
    }
  };
};

const EvidenceItemProxy = {
  findOne(query) {
    if (isInMemoryActive()) return createQueryPromise(() => getMemoryCol().findOne(query));
    return MongooseEvidenceModel.findOne(query);
  },

  findById(id) {
    if (isInMemoryActive()) return createQueryPromise(() => getMemoryCol().findById(id));
    return MongooseEvidenceModel.findById(id);
  },

  find(query = {}) {
    if (isInMemoryActive()) return createQueryPromise(() => getMemoryCol().find(query));
    return MongooseEvidenceModel.find(query);
  },

  async create(data) {
    if (isInMemoryActive()) {
      const docData = { ...data };
      if (!docData.evidenceId) {
        docData.evidenceId = `EVD-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      }
      return getMemoryCol().create(docData);
    }
    return MongooseEvidenceModel.create(data);
  },

  async deleteOne(query) {
    if (isInMemoryActive()) return getMemoryCol().deleteOne(query);
    return MongooseEvidenceModel.deleteOne(query);
  },

  async updateOne(query, update) {
    if (isInMemoryActive()) return getMemoryCol().updateOne(query, update);
    return MongooseEvidenceModel.updateOne(query, update);
  }
};

module.exports = EvidenceItemProxy;
