const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying EvidenceRegistry smart contract...");

  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const contract = await EvidenceRegistry.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ EvidenceRegistry deployed successfully to: ${contractAddress}`);

  // Contract artifact
  const artifactPath = path.resolve(__dirname, "../artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json");
  let artifact = {};
  if (fs.existsSync(artifactPath)) {
    artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  const exportData = {
    address: contractAddress,
    abi: artifact.abi || [],
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  // Export to backend config
  const backendConfigDir = path.resolve(__dirname, "../../backend/src/config");
  if (fs.existsSync(backendConfigDir)) {
    fs.writeFileSync(
      path.join(backendConfigDir, "contractData.json"),
      JSON.stringify(exportData, null, 2)
    );
    console.log(`📝 Exported contract info to backend config: ${contractAddress}`);
  }

  // Export to frontend config
  const frontendConfigDir = path.resolve(__dirname, "../../frontend/src/config");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendConfigDir, "contractData.json"),
    JSON.stringify(exportData, null, 2)
  );
  console.log(`📝 Exported contract info to frontend config: ${contractAddress}`);
}

main().catch((error) => {
  console.error("❌ Contract deployment failed:", error);
  process.exitCode = 1;
});

