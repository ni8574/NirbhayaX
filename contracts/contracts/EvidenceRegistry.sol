// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @dev Tamper-evident evidence notarization contract for NIRBHAYA X.
 * Strictly stores hashes and pseudonyms. Zero personal identifiable information (PII).
 */
contract EvidenceRegistry {
    struct EvidenceRecord {
        bytes32 fileHash;
        bytes32 ownerPseudonym;
        uint256 timestamp;
        string evidenceId;
        bool exists;
    }

    struct AccessGrant {
        bytes32 granteePseudonym;
        uint256 validUntil;
        bool isActive;
    }

    // Hash => EvidenceRecord
    mapping(bytes32 => EvidenceRecord) public records;

    // Hash => granteePseudonym => AccessGrant
    mapping(bytes32 => mapping(bytes32 => AccessGrant)) public accessPermissions;

    // Events
    event EvidenceRegistered(
        bytes32 indexed fileHash,
        bytes32 indexed ownerPseudonym,
        string evidenceId,
        uint256 timestamp
    );

    event EvidenceVerified(
        bytes32 indexed fileHash,
        bool isAuthentic,
        uint256 checkedAt
    );

    event AccessGranted(
        bytes32 indexed fileHash,
        bytes32 indexed granteePseudonym,
        uint256 validUntil
    );

    event AccessRevoked(
        bytes32 indexed fileHash,
        bytes32 indexed granteePseudonym
    );

    function registerEvidence(
        bytes32 _fileHash,
        bytes32 _ownerPseudonym,
        string memory _evidenceId
    ) external returns (bool) {
        require(!records[_fileHash].exists, "Evidence hash already registered");

        records[_fileHash] = EvidenceRecord({
            fileHash: _fileHash,
            ownerPseudonym: _ownerPseudonym,
            timestamp: block.timestamp,
            evidenceId: _evidenceId,
            exists: true
        });

        emit EvidenceRegistered(_fileHash, _ownerPseudonym, _evidenceId, block.timestamp);
        return true;
    }

    function verifyEvidence(bytes32 _fileHash)
        external
        view
        returns (bool isAuthentic, uint256 registeredAt, string memory evidenceId)
    {
        if (records[_fileHash].exists) {
            return (true, records[_fileHash].timestamp, records[_fileHash].evidenceId);
        }
        return (false, 0, "");
    }

    function grantAccess(
        bytes32 _fileHash,
        bytes32 _granteePseudonym,
        uint256 _durationSeconds
    ) external {
        require(records[_fileHash].exists, "Evidence record not found");

        accessPermissions[_fileHash][_granteePseudonym] = AccessGrant({
            granteePseudonym: _granteePseudonym,
            validUntil: block.timestamp + _durationSeconds,
            isActive: true
        });

        emit AccessGranted(_fileHash, _granteePseudonym, block.timestamp + _durationSeconds);
    }

    function revokeAccess(bytes32 _fileHash, bytes32 _granteePseudonym) external {
        require(records[_fileHash].exists, "Evidence record not found");
        accessPermissions[_fileHash][_granteePseudonym].isActive = false;

        emit AccessRevoked(_fileHash, _granteePseudonym);
    }

    function checkAccess(bytes32 _fileHash, bytes32 _granteePseudonym)
        external
        view
        returns (bool hasAccess)
    {
        AccessGrant memory grant = accessPermissions[_fileHash][_granteePseudonym];
        if (grant.isActive && block.timestamp <= grant.validUntil) {
            return true;
        }
        return false;
    }
}

