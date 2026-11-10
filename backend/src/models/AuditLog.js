const crypto = require('crypto');
const mongoose = require('mongoose');
const { isInMemoryActive } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const AuditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'EVIDENCE_UPLOAD',
      'HASH_REGISTERED_ONCHAIN',
      'INTEGRITY_VERIFIED',
      'TAMPER_DETECTED',
      'ACCESS_GRANTED',
      'ACCESS_REVOKED',
      'EVIDENCE_VIEWED',
      'SOS_TRIGGERED'
    ],
    required: true
  },
  evidenceId: {
    type: String,
    index: true
  },
  caseId: {
    type: String,
    index: true
  },
  actorPseudonym: {
    type: String,
    required: true
  },
  fileHash: {
    type: String
  },
  txHash: {
    type: String
  },
  blockNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'TAMPER_ALERT', 'PENDING'],
    default: 'SUCCESS'
  },
  details: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

let MongooseAuditModel;
try {
  MongooseAuditModel = mongoose.model('AuditLog', AuditLogSchema);
} catch {
  MongooseAuditModel = mongoose.models.AuditLog;
}

const getMemoryCol = () => {
  return memoryStore.getCollection('AuditLog', { preHooks: [] });
};

const createQueryPromise = (getDocFn) => {
  return {
    select: function () { return this; },
    populate: function () { return this; },
    sort: function (sortObj) {
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

const AuditLogProxy = {
  find(query = {}) {
    if (isInMemoryActive()) {
      return createQueryPromise(async () => {
        const docs = await getMemoryCol().find(query);
        // Sort descending by timestamp
        return docs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
    }
    return MongooseAuditModel.find(query).sort({ timestamp: -1 });
  },

  async create(data) {
    if (isInMemoryActive()) {
      const docData = { ...data };
      if (!docData.logId) {
        docData.logId = `AUDIT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      }
      if (!docData.timestamp) {
        docData.timestamp = new Date();
      }
      return getMemoryCol().create(docData);
    }
    return MongooseAuditModel.create(data);
  }
};

module.exports = AuditLogProxy;

