# 🧪 NIRBHAYA X — QA & EVALUATOR TESTING CHEATSHEET
### *Comprehensive Test Verification & Evaluation Guide*

---

## ⚡ Quick Test Commands Matrix

| Scope | Command Line | Description | Expected Output |
| :--- | :--- | :--- | :--- |
| **All Monorepo Tests** | `npm test` | Runs Smart Contracts + all 8 Backend integration suites | `51/51 Tests Passing (100%)` |
| **Smart Contracts** | `cd contracts && npx hardhat test` | Tests Solidity contract registration, tamper checks, consent | `3 passing (1s)` |
| **All Backend Suites** | `cd backend && npm test` | Runs Auth, RBAC, SOS, Vault, AI, Justice, MediCare, Case | `48/48 Tests Passing` |
| **Auth & DB Suite** | `cd backend && node tests/auth.test.js` | Verifies user registration, bcrypt 10 rounds, JWT claims | `5 Passed, 0 Failed` |
| **RBAC Authorization** | `cd backend && node tests/rbac.test.js` | Verifies User, Authority (Police/Legal Aid), and Admin roles | `4 Passed, 0 Failed` |
| **SOS Emergency Hub** | `cd backend && node tests/sos.test.js` | Verifies SOS trigger, GPS broadcast, check-in timer | `7 Passed, 0 Failed` |
| **Vault & Web3** | `cd backend && node tests/vault.test.js` | Verifies client/server SHA-256, AES-256, 1-byte tamper demo | `7 Passed, 0 Failed` |
| **Evidence AI** | `cd backend && node tests/ai.test.js` | Verifies OpenCV count, Whisper STT, completeness gauge | `7 Passed, 0 Failed` |
| **Justice & Legal** | `cd backend && node tests/justice.test.js` | Verifies bilingual draft, Section 63 BSA certificate, QR | `7 Passed, 0 Failed` |
| **MediCare Healthcare** | `cd backend && node tests/medicare.test.js` | Verifies Haversine hospital sort, AES locker, doctor pass | `7 Passed, 0 Failed` |
| **Case Journey Engine** | `cd backend && node tests/case.test.js` | Verifies 5-stage case aggregator & 1-click judge seeder | `4 Passed, 0 Failed` |
| **Frontend Production** | `cd frontend && npm run build` | Compiles Vite production bundle with Tailwind CSS | `1728 modules transformed (0 errors)` |

---

## 👥 Pre-Seeded Test Personas & Credentials

The system comes pre-seeded with 4 test personas covering all role permissions:

| Persona Name | Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Priya Sharma** | `user` | `priya.sharma@nirbhayax.demo` | `Password123!` | Trigger SOS, upload evidence, file complaints, manage medical locker, view Case Journey |
| **Insp. Rajesh Sharma** | `authority` | `inspector.sharma@delhipolice.demo` | `Password123!` | Police IO role, inspect complaint dockets, issue ACK receipts, update case review status |
| **Adv. Meera Sen** | `authority` | `meera.sen@legalaid.demo` | `Password123!` | District Legal Services Authority (DLSA), review Section 63 BSA certificates, legal aid |
| **Nirbhaya X Admin** | `admin` | `admin@nirbhayax.org` | `Password123!` | Administrative vault access, system health inspection, immutable audit trail review |

---

## 📋 Interactive Verification Checklist for Evaluators

### 1. Phase 1 — Authentication, Database & RBAC
- [ ] Navigate to `/login`.
- [ ] Log in with user credentials (`priya.sharma@nirbhayax.demo` / `Password123!`).
- [ ] Verify JWT token stored securely in localStorage (`auth_token`).
- [ ] Log in as **Inspector Rajesh Sharma** (`inspector.sharma@delhipolice.demo`).
- [ ] Verify the navigation bar shows the **"Authority Docket"** badge.
- [ ] Attempt to access `/vault` as a regular user and verify access control behavior.

### 2. Phase 2 — NIRBHAYA SOS Module
- [ ] Navigate to `/sos`.
- [ ] Press the large central **SOS Emergency Button**:
  - [ ] Web Audio 880Hz alert tone sounds.
  - [ ] Pulsing visual ripple animation activates.
  - [ ] System automatically spawns a new Case ID (`CASE-2026-XXXX`).
- [ ] Open the **Public Tracking Link** (`/track/:sessionId`) in an incognito window:
  - [ ] Map renders live coordinates.
  - [ ] User identity is masked as `NX-XXXXXX` (Zero PII leaked).
- [ ] Start an **Emergency Check-in Timer** (e.g. 15 minutes):
  - [ ] Countdown timer ticks in real time.
  - [ ] Tap **"I am Safe"** to resolve and cancel the timer.
- [ ] Click the floating **"Quick Exit"** button:
  - [ ] View instantly switches to a functioning camouflage math calculator.

### 3. Phase 3 — NIRBHAYA VAULT & Smart Contract Integration
- [ ] Navigate to `/vault`.
- [ ] Verify the smart contract status badge: `Contract: 0x5FbDB...aa3`.
- [ ] Upload an image or audio file:
  - [ ] Client calculates SHA-256 in browser.
  - [ ] Backend calculates SHA-256 independently and compares.
  - [ ] Encrypted file is saved off-chain as `.enc` in `backend/vault_storage/`.
  - [ ] Smart contract registers hash on-chain with Ethereum block timestamp.
- [ ] Click **"Run 1-Click 1-Byte Tamper Demo"**:
  - [ ] 1 byte is modified in the encrypted file.
  - [ ] New SHA-256 hash diverges by >90% (Avalanche Effect).
  - [ ] Smart contract verification query returns `MISMATCH ❌ REJECTED`.
- [ ] Grant temporary viewing consent to **Insp. Rajesh Sharma** and verify revocation.

### 4. Phase 4 — NIRBHAYA EVIDENCE AI
- [ ] Navigate to `/evidence`.
- [ ] Upload an incident photo:
  - [ ] OpenCV analysis displays: `2 Persons Detected`, `2 Faces Counted`.
  - [ ] Verify explicit disclaimer: **Strictly Person/Face Count Only — No Facial Recognition or Biometric Tracking**.
- [ ] Upload or inspect an audio recording:
  - [ ] Whisper speech-to-text transcript displays transcribed speech.
  - [ ] Acoustic distress badge displays `HIGH_DISTRESS` or `ALERT`.
- [ ] Inspect the **Visual Evidence Timeline** and **Completeness Gauge** (0–100%).

### 5. Phase 5 — NIRBHAYA JUSTICE Module
- [ ] Navigate to `/justice`.
- [ ] Fill out the 4-step Complaint Filing Wizard:
  - [ ] Step 1: Complainant details (Auto-filled from pseudonymous profile).
  - [ ] Step 2: Incident details (Barakhamba Metro Harassment).
  - [ ] Step 3: Evidentiary attachments from Vault.
  - [ ] Step 4: Legal declaration & submission.
- [ ] View the generated **Bilingual Complaint Form (English & Hindi)**:
  - [ ] Aligned with BNS Sections 74 and 78.
- [ ] Inspect the **Section 63 BSA 2023 Electronic Evidence Certificate**:
  - [ ] Verified algorithmic parameters: `SHA-256 (FIPS 180-4)`.
  - [ ] High-density cryptographic QR code rendered.
  - [ ] Official police intake receipt issued: `ACK-2026-XXXX`.

### 6. Phase 6 — NIRBHAYA MEDICARE Module
- [ ] Navigate to `/medicare`.
- [ ] Inspect the **Emergency Facilities Map**:
  - [ ] AIIMS Apex Trauma Center, Lady Hardinge, RML, and Safdarjung sorted by Haversine distance.
- [ ] Test the **Ambulance Quick-Dialers** (102, 108, 1099, 112).
- [ ] Unlock the **AES-256 Encrypted Medical Locker**:
  - [ ] Displays Blood Group `B+` and Allergies `[Penicillin, Sulfa Drugs]`.
  - [ ] MLC Case Reference Number: `MLC-AIIMS-2026-8812`.
- [ ] Click **"Generate 24-Hour Doctor Access Pass"**:
  - [ ] Code generated: `PASS-XXXXXX`.
- [ ] Click **"Start Emergency Teleconsultation"**:
  - [ ] Simulated WebRTC physician session opens with Dr. Sunita Rao, MD.

### 7. Phase 7 — PROOF-TO-JUSTICE CASE JOURNEY DASHBOARD
- [ ] Navigate to `/journey`.
- [ ] Click **"⚡ Launch 3-Minute Guided Demo"**:
  - [ ] 180-second countdown timer initiates.
  - [ ] Guided step-by-step walkthrough highlights all 5 stages.
- [ ] Verify the 5-Stage Case Progress Tracker:
  - [x] Stage 1: Protection (SOS Session Active / Resolved)
  - [x] Stage 2: Evidence (Responsible OpenCV Count & Whisper STT)
  - [x] Stage 3: Integrity (Blockchain Hardhat Block Notarized)
  - [x] Stage 4: Complaint (Bilingual PDF + Section 63 BSA Cert)
  - [x] Stage 5: Support (Emergency Trauma Facility & Doctor Pass)

---

## 🛠️ Developer Troubleshooting Guide

### 1. Port Conflicts (e.g. Port 5000 or 8545 already in use)
```powershell
# Find process using port 5000:
netstat -ano | findstr :5000
# Kill process by PID:
Stop-Process -Id <PID> -Force
```

### 2. MongoDB Not Running Locally
- NIRBHAYA X is equipped with an automated **Zero-Setup Resilient In-Memory Database Store**.
- If MongoDB is not running on `127.0.0.1:27017`, the system automatically activates the memory store. All tests and demo features work out-of-the-box with zero configuration needed.

### 3. Hardhat Local Node Not Running
- If the Hardhat node on port 8545 is offline, the backend automatically engages its **Resilient Web3 Fallback Engine**, simulating on-chain transaction hashes, block numbers, and cryptographic byte comparisons without breaking the user experience.

### 4. Python Environment / OpenCV Alpha Variations
- If Python 3.14 or a newer OpenCV release does not support legacy cascades (`cv2.CascadeClassifier`), the AI microservice seamlessly executes its pure OpenCV YCrCb skin-region segmentation algorithm, correctly detecting persons and faces without external binary dependencies.

