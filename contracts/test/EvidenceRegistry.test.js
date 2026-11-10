const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EvidenceRegistry Smart Contract", function () {
  let EvidenceRegistry;
  let registry;
  let owner, user, police, lawyer;

  beforeEach(async function () {
    [owner, user, police, lawyer] = await ethers.getSigners();
    EvidenceRegistry = await ethers.getContractFactory("EvidenceRegistry");
    registry = await EvidenceRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("Should register evidence hash with pseudonymous identity and emit event", async function () {
    const fileHash = ethers.keccak256(ethers.toUtf8Bytes("demo_video_evidence_bytes"));
    const pseudonym = ethers.keccak256(ethers.toUtf8Bytes("NX-PRIYA-SHARMA"));
    const evidenceId = "EVD-2026-001";

    await expect(registry.registerEvidence(fileHash, pseudonym, evidenceId))
      .to.emit(registry, "EvidenceRegistered")
      .withArgs(fileHash, pseudonym, evidenceId, (ts) => ts > 0);

    const [isAuthentic, registeredAt, retrievedId] = await registry.verifyEvidence(fileHash);
    expect(isAuthentic).to.be.true;
    expect(retrievedId).to.equal(evidenceId);
    expect(registeredAt).to.be.gt(0);
  });

  it("Should return false for unregistered or tampered evidence hash", async function () {
    const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("tampered_corrupted_bytes"));
    const [isAuthentic, registeredAt, retrievedId] = await registry.verifyEvidence(fakeHash);
    expect(isAuthentic).to.be.false;
    expect(registeredAt).to.equal(0);
    expect(retrievedId).to.equal("");
  });

  it("Should grant and revoke time-limited access to authorized roles", async function () {
    const fileHash = ethers.keccak256(ethers.toUtf8Bytes("confidential_medical_record"));
    const ownerPseudonym = ethers.keccak256(ethers.toUtf8Bytes("NX-OWNER"));
    const policePseudonym = ethers.keccak256(ethers.toUtf8Bytes("NX-POLICE-OFFICER"));

    await registry.registerEvidence(fileHash, ownerPseudonym, "EVD-2026-MED");

    // Initially no access
    let hasAccess = await registry.checkAccess(fileHash, policePseudonym);
    expect(hasAccess).to.be.false;

    // Grant access for 1 hour (3600 seconds)
    await registry.grantAccess(fileHash, policePseudonym, 3600);
    hasAccess = await registry.checkAccess(fileHash, policePseudonym);
    expect(hasAccess).to.be.true;

    // Revoke access
    await registry.revokeAccess(fileHash, policePseudonym);
    hasAccess = await registry.checkAccess(fileHash, policePseudonym);
    expect(hasAccess).to.be.false;
  });
});

