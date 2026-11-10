const crypto = require('crypto');
const mongoose = require('mongoose');
const { isInMemoryActive } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  caseId: {
    type: String,
    required: true,
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
  complainantName: {
    type: String,
    default: 'Anonymous Citizen (Protected Identity)'
  },
  complainantPhone: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'bilingual'],
    default: 'bilingual'
  },
  incidentDetails: {
    incidentType: {
      type: String,
      required: true,
      default: 'harassment_or_distress'
    },
    whatHappened: {
      type: String,
      required: true
    },
    dateTime: {
      type: Date,
      default: Date.now
    },
    location: {
      address: String,
      landmark: String,
      lat: Number,
      lng: Number
    },
    suspectDescription: {
      type: String,
      default: 'Unidentified individual(s) observed at scene.'
    },
    witnesses: [{
      name: String,
      contact: String,
      statementSummary: String
    }],
    detailedNarrative: {
      type: String,
      default: ''
    }
  },
  aiDraftSuggestion: {
    english: String,
    hindi: String
  },
  evidenceReferences: [{
    evidenceId: String,
    originalFilename: String,
    mimeType: String,
    sha256: String,
    txHash: String,
    blockNumber: Number,
    verificationStatus: String
  }],
  status: {
    type: String,
    enum: ['drafted', 'submitted', 'acknowledged', 'under_review', 'resolved'],
    default: 'drafted'
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
    updatedBy: String
  }],
  policeStation: {
    name: { type: String, default: 'Central Women Safety Police Station' },
    stationName: { type: String, default: 'Central Women Safety Police Station' },
    district: { type: String, default: 'Central Delhi' },
    state: { type: String, default: 'Delhi' }
  },
  acknowledgement: {
    receiptNumber: String,
    acknowledgedAt: Date,
    officerBadgeNumber: String,
    isSimulatedDemo: { type: Boolean, default: true }
  },
  verificationQrDataUrl: {
    type: String,
    default: ''
  },
  bsaCertificate: {
    certificateId: String,
    generatedAt: Date,
    certifierPseudonym: String,
    hashAlgorithm: { type: String, default: 'SHA-256' },
    legalDeclaration: String
  }
}, { timestamps: true });

let MongooseComplaintModel;
try {
  MongooseComplaintModel = mongoose.model('Complaint', ComplaintSchema);
} catch {
  MongooseComplaintModel = mongoose.models.Complaint;
}

const getMemoryCol = () => {
  return memoryStore.getCollection('Complaint', { preHooks: [] });
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

const Complaint = {
  create: async function (data) {
    if (isInMemoryActive()) {
      const col = getMemoryCol();
      return col.create(data, ComplaintSchema.methods);
    }
    return MongooseComplaintModel.create(data);
  },

  findOne: function (query) {
    if (isInMemoryActive()) {
      return createQueryPromise(async () => {
        const col = getMemoryCol();
        return col.findOne(query, ComplaintSchema.methods);
      });
    }
    return MongooseComplaintModel.findOne(query);
  },

  findById: function (id) {
    if (isInMemoryActive()) {
      return createQueryPromise(async () => {
        const col = getMemoryCol();
        return col.findById(id, ComplaintSchema.methods);
      });
    }
    return MongooseComplaintModel.findById(id);
  },

  find: function (query) {
    if (isInMemoryActive()) {
      return createQueryPromise(async () => {
        const col = getMemoryCol();
        return col.find(query, ComplaintSchema.methods);
      });
    }
    return MongooseComplaintModel.find(query);
  },

  countDocuments: async function (query) {
    if (isInMemoryActive()) {
      const col = getMemoryCol();
      return col.countDocuments(query);
    }
    return MongooseComplaintModel.countDocuments(query);
  }
};

module.exports = Complaint;
