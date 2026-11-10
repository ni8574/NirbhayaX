# 🌐 NIRBHAYA X — PRODUCTION DEPLOYMENT GUIDE
### *Public Multi-Cloud Deployment Guide: Vercel + Render + MongoDB Atlas + Ethereum Sepolia*

---

## 🏛️ Public Deployment Architecture Overview

```mermaid
flowchart TD
    User["🌍 End-User Mobile / Desktop Browser"]

    subgraph VercelCloud["▲ Vercel Edge Network (Global CDN)"]
        FrontendSPA["📱 React 19 + Vite Frontend\n(https://nirbhaya-x.vercel.app)"]
    end

    subgraph RenderCloud["☁️ Render Cloud Platform (Oregon / Frankfurt)"]
        BackendNode["📡 Node.js + Express API Gateway\n& WebSocket Real-Time Hub\n(https://nirbhaya-x-backend.onrender.com)"]
        AIServicePy["🐍 Python FastAPI AI Engine\n(OpenCV 5.0 + Whisper STT)\n(https://nirbhaya-x-ai.onrender.com)"]
    end

    subgraph DatabaseCloud["🍃 MongoDB Atlas (Cloud Database)"]
        MongoCluster["🔒 Multi-Region MongoDB Atlas M0 Cluster\n(mongodb+srv://...)"]
    end

    subgraph Web3Network["⛓️ Decentralized Ledger (Public Ethereum Testnet)"]
        SepoliaChain["📜 EvidenceRegistry.sol\n(Ethereum Sepolia / Polygon Amoy)"]
    end

    User <-->|HTTPS (Port 443)| FrontendSPA
    FrontendSPA <-->|REST API & WSS WebSockets| BackendNode
    BackendNode <-->|Private Internal HTTP / REST| AIServicePy
    BackendNode <-->|TLS Encrypted Connection (Mongoose)| MongoCluster
    BackendNode <-->|JSON-RPC via Infura/Alchemy| SepoliaChain
    FrontendSPA -.->|Optional Direct Read RPC| SepoliaChain
```

---

## 📋 Pre-Deployment Checklist & Accounts Needed

| Platform | Role in NIRBHAYA X | Cost Tier | Account Sign-up URL |
| :--- | :--- | :--- | :--- |
| **GitHub** | Source Code Control & CI/CD deployment triggers | Free | [github.com](https://github.com/) |
| **Vercel** | High-performance CDN hosting for Vite React Frontend | Free Hobby Tier | [vercel.com](https://vercel.com/) |
| **Render** | Docker/Native hosting for Node.js API & Python FastAPI | Free Web Service Tier | [render.com](https://render.com/) |
| **MongoDB Atlas**| Cloud-hosted managed NoSQL database cluster | Free Shared M0 (512MB) | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| **Sepolia Faucet**| Free Testnet ETH for Smart Contract deployment | Free | [sepoliafaucet.com](https://sepoliafaucet.com/) |

---

## 🚀 Step 1: Initialize Git & Push to GitHub

Ensure you are in the root directory of the project: `C:\Users\sanje\Desktop\NirbhayaX`.

```bash
# 1. Initialize git repository in NirbhayaX
git init

# 2. Verify .gitignore is active and staging does not contain .env
git status

# 3. Stage and commit all files
git add .
git commit -m "feat: complete NIRBHAYA X production-ready platform"

# 4. Create a new repository on GitHub (named 'nirbhaya-x') and link remote
git branch -M main
git remote add origin https://github.com/<your-github-username>/nirbhaya-x.git
git push -u origin main
```

> [!CAUTION]
> Double check that `.env` is NOT tracked by Git. Run `git status --ignored` to confirm that `.env` files are ignored.

---

## 🍃 Step 2: Set Up MongoDB Atlas Database

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a **New Project** named `NirbhayaX`.
3. Click **Build a Database** and select the **M0 Free Shared Tier** (AWS / Oregon or closest region).
4. **Security Setup — Database User:**
   - Create a database user (e.g., `nirbhaya_admin`).
   - Generate a strong password (e.g., `SuperSecurePass2026!`).
5. **Security Setup — Network Access:**
   - Go to **Network Access** > **Add IP Address**.
   - Select **Allow Access From Anywhere (`0.0.0.0/0`)** so Render web service containers can connect dynamically.
6. **Obtain Connection String:**
   - Go to **Database** > **Connect** > **Drivers** (Node.js).
   - Copy your connection string:
     ```text
     mongodb+srv://nirbhaya_admin:<password>@cluster0.xxxxx.mongodb.net/nirbhaya_x?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password and ensure the database name is `nirbhaya_x`.

---

## ⛓️ Step 3: Deploy Smart Contract to Ethereum Sepolia / Polygon Amoy (Optional but Recommended)

If you wish to anchor hashes to a live public testnet:

1. Obtain a Sepolia RPC URL from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/) (or use public `https://rpc.sepolia.org`).
2. Get free Sepolia ETH from [sepoliafaucet.com](https://sepoliafaucet.com/) into your MetaMask deployer wallet.
3. Export your wallet Private Key from MetaMask (Account Details > Show Private Key).
4. Run the Hardhat deployment script:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network sepolia
   ```
5. Note the deployed contract address (e.g. `0x1234567890abcdef1234567890abcdef12345678`).

*(Note: NIRBHAYA X backend includes an automatic **Resilient Web3 Engine**; if no testnet RPC is configured, the backend automatically simulates on-chain blocks and transactions without breaking the user experience).*

---

## 🐍 Step 4: Deploy Python AI Microservice on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your `nirbhaya-x` GitHub repository.
4. Configure the service settings:
   - **Name:** `nirbhaya-x-ai`
   - **Region:** `Oregon (US West)` (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** `ai-service`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
5. **Environment Variables:**
   - Add `PYTHON_VERSION` = `3.11.9`
   - Add `ENVIRONMENT` = `production`
6. Click **Create Web Service**.
7. Wait 2–3 minutes for the build to complete.
8. Copy your deployed AI service URL:
   `https://nirbhaya-x-ai.onrender.com`

---

## 📡 Step 5: Deploy Node.js Backend API Gateway on Render

1. On your Render Dashboard, click **New +** > **Web Service**.
2. Select your `nirbhaya-x` GitHub repository.
3. Configure the settings:
   - **Name:** `nirbhaya-x-backend`
   - **Region:** `Oregon (US West)` (same region as AI service)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** `Free`
4. **Environment Variables (under Environment tab):**

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment flag |
| `DEMO_MODE` | `true` | Enables pre-seeded demo accounts & simulated SMS |
| `PORT` | `10000` | Injected by Render automatically |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 2 |
| `JWT_SECRET` | `generate-random-secret-key-32-chars` | Random 32+ character secret |
| `JWT_EXPIRES_IN`| `7d` | Session expiration window |
| `ENCRYPTION_KEY`| `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` | 32-byte hex key for AES-256 |
| `AI_SERVICE_URL`| `https://nirbhaya-x-ai.onrender.com` | Deployed Python AI URL from Step 4 |
| `CLIENT_URL` | `https://nirbhaya-x.vercel.app` | Your Vercel frontend URL (from Step 6) |
| `FRONTEND_URL` | `https://nirbhaya-x.vercel.app` | Secondary CORS allowed origin |

5. Click **Create Web Service**.
6. When deployment finishes, test the health endpoint in your browser:
   `https://nirbhaya-x-backend.onrender.com/api/health`
7. Copy your deployed Backend URL:
   `https://nirbhaya-x-backend.onrender.com`

---

## 📱 Step 6: Deploy React Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/) with your GitHub account.
2. Click **Add New...** > **Project**.
3. Import your `nirbhaya-x` repository.
4. Configure Project Settings:
   - **Project Name:** `nirbhaya-x`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `frontend`
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `dist`
5. **Environment Variables (Expand Environment Variables section):**

| Name | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://nirbhaya-x-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://nirbhaya-x-backend.onrender.com` |
| `VITE_AI_URL` | `https://nirbhaya-x-ai.onrender.com` |
| `VITE_CONTRACT_ADDRESS` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` (or Sepolia address) |
| `VITE_RPC_URL` | `https://rpc.sepolia.org` |

6. Click **Deploy**.
7. Vercel will build and assign you a global domain:
   `https://nirbhaya-x.vercel.app`
8. **Final CORS Sync:** Go back to Render for `nirbhaya-x-backend`, update `CLIENT_URL` with your exact assigned Vercel URL, and trigger a quick redeploy.

---

## 🎯 Alternative: 1-Click Render Blueprint Deployment

If you prefer deploying the entire backend infrastructure with one click, use Render Blueprints:
1. In Render Dashboard, click **New +** > **Blueprint**.
2. Select your `nirbhaya-x` repository. Render will automatically detect the [render.yaml](file:///c:/Users/sanje/Desktop/NirbhayaX/render.yaml) file.
3. Fill in the prompted `MONGODB_URI` and `CLIENT_URL`.
4. Click **Apply Blueprint**. Render will build both `nirbhaya-x-backend` and `nirbhaya-x-ai` simultaneously.

---

## ✅ Post-Deployment Smoke Test & Verification Checklist

Once deployed, perform these quick verifications:

- [ ] **1. Public Availability**: Open your Vercel URL (`https://your-app.vercel.app`) in an incognito window.
- [ ] **2. Backend Health**: Check `https://your-backend.onrender.com/api/health` returns HTTP 200 `{ status: 'healthy', database: { connected: true } }`.
- [ ] **3. Authentication**: Log in as Priya Sharma (`priya.sharma@nirbhayax.demo` / `Password123!`).
- [ ] **4. One-Tap SOS**: Tap the SOS Pulse button; verify audio alert, pulsing ripple, and location capture.
- [ ] **5. Evidence AI**: Upload an image; verify OpenCV person count and Whisper transcript display without errors.
- [ ] **6. 1-Click Tamper Demo**: Navigate to `/vault` and trigger the byte-tamper test; verify the `MISMATCH ❌ REJECTED` alert.
- [ ] **7. Section 63 BSA PDF**: Navigate to `/justice`, view the generated complaint, and verify the QR code and Section 63 BSA electronic certificate render crisply.
- [ ] **8. MediCare Locker**: Navigate to `/medicare`, view encrypted allergies (`Penicillin`), and generate a 24-hour doctor access pass.
- [ ] **9. Proof-to-Justice Journey**: Navigate to `/journey` and click **Launch 3-Minute Guided Demo** to confirm end-to-end integration across all 5 stages.

