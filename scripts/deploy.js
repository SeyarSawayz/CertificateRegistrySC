const hre = require("hardhat");

// CertificateRegistrySC;
// certificateRegistrySC;

async function main() {
  const CertificateRegistrySC = await hre.ethers.getContractFactory(
    "CertificateRegistrySC"
  );
  const upload = await CertificateRegistrySC.deploy();

  await upload.deployed();
  console.log("Compiled 1 Solidity file successfully");
  console.log("Smart contract deploye to: ", upload.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
