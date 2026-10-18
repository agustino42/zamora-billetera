import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const admin = await deployer.getAddress();

  console.log("Desplegando contratos Zamora...");
  console.log("Admin / System wallet:", admin);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(admin)),
    "ETH\n",
  );

  const Token = await ethers.getContractFactory("ZamoraToken");
  const token = await Token.deploy("Zamora Token", "ZAM", admin);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ZamoraToken:", tokenAddress);

  const Campus = await ethers.getContractFactory("ZamoraCampus");
  const campus = await Campus.deploy(admin, tokenAddress);
  await campus.waitForDeployment();
  const campusAddress = await campus.getAddress();
  console.log("ZamoraCampus:", campusAddress);

  const Rewards = await ethers.getContractFactory("ZamoraRewards");
  const rewards = await Rewards.deploy(admin, tokenAddress);
  await rewards.waitForDeployment();
  const rewardsAddress = await rewards.getAddress();
  console.log("ZamoraRewards:", rewardsAddress);

  const Collectibles = await ethers.getContractFactory("ZamoraCollectibles");
  const collectibles = await Collectibles.deploy(
    admin,
    "Zamora Collectibles",
    "ZCOLL",
  );
  await collectibles.waitForDeployment();
  const collectiblesAddress = await collectibles.getAddress();
  console.log("ZamoraCollectibles:", collectiblesAddress);

  const Courses = await ethers.getContractFactory("ZamoraCourses");
  const courses = await Courses.deploy(
    admin,
    tokenAddress,
    collectiblesAddress,
  );
  await courses.waitForDeployment();
  const coursesAddress = await courses.getAddress();
  console.log("ZamoraCourses:", coursesAddress);

  const Forum = await ethers.getContractFactory("ZamoraForum");
  const forum = await Forum.deploy(admin, tokenAddress);
  await forum.waitForDeployment();
  const forumAddress = await forum.getAddress();
  console.log("ZamoraForum:", forumAddress);

  console.log("\nConfigurando roles...");
  const MINTER = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const BURNER = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));

  await (await token.grantRole(MINTER, campusAddress)).wait();
  await (await token.grantRole(BURNER, rewardsAddress)).wait();
  await (await collectibles.grantRole(MINTER, coursesAddress)).wait();
  await (await collectibles.grantRole(MINTER, admin)).wait();
  console.log("Roles asignados: Campus(minter), Rewards(burner), Courses(minter collectibles)");

  const envBlock = [
    "",
    "# --- Contratos Zamora (Base Sepolia) ---",
    `NEXT_PUBLIC_ZAMORA_TOKEN_ADDRESS=${tokenAddress}`,
    `NEXT_PUBLIC_ZAMORA_CAMPUS_ADDRESS=${campusAddress}`,
    `NEXT_PUBLIC_ZAMORA_REWARDS_ADDRESS=${rewardsAddress}`,
    `NEXT_PUBLIC_ZAMORA_COLLECTIBLES_ADDRESS=${collectiblesAddress}`,
    `NEXT_PUBLIC_ZAMORA_COURSES_ADDRESS=${coursesAddress}`,
    `NEXT_PUBLIC_ZAMORA_FORUM_ADDRESS=${forumAddress}`,
    "",
  ].join("\n");

  console.log("\n=== Pega esto en tu .env ===\n" + envBlock);

  const outPath = path.join(__dirname, "..", "deployments.json");
  const deployBlock = await ethers.provider.getBlockNumber();
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        network: "baseSepolia",
        chainId: 84532,
        admin,
        deployBlock,
        contracts: {
          token: tokenAddress,
          campus: campusAddress,
          rewards: rewardsAddress,
          collectibles: collectiblesAddress,
          courses: coursesAddress,
          forum: forumAddress,
        },
      },
      null,
      2,
    ),
  );
  console.log("Deployment guardado en contracts/deployments.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
