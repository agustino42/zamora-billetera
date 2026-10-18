import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";

const ZERO = "0x0000000000000000000000000000000000000000";
const MAX_DEADLINE = 2n ** 256n - 1n;

async function signPermit(
  token: any,
  owner: Signer,
  spender: string,
  value: bigint,
  deadline: bigint,
) {
  const ownerAddress = await owner.getAddress();
  const network = await ethers.provider.getNetwork();
  const domain = {
    name: await token.name(),
    version: "1",
    chainId: network.chainId,
    verifyingContract: await token.getAddress(),
  };
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const nonce = await token.nonces(ownerAddress);
  const message = { owner: ownerAddress, spender, value, nonce, deadline };
  const signature = await owner.signTypedData(domain, types, message);
  return ethers.Signature.from(signature);
}

// Relayer (admin) submits the permit that the student signed off-chain.
async function applyPermit(
  token: any,
  relayer: Signer,
  owner: Signer,
  spender: string,
  value: bigint,
) {
  const ownerAddress = await owner.getAddress();
  const { v, r, s } = await signPermit(token, owner, spender, value, MAX_DEADLINE);
  await token
    .connect(relayer)
    .permit(ownerAddress, spender, value, MAX_DEADLINE, v, r, s);
}

async function deployFixture() {
  const [admin, professor, student, other] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("ZamoraToken");
  const token = await Token.deploy("Zamora Token", "ZAM", admin.address);

  const Campus = await ethers.getContractFactory("ZamoraCampus");
  const campus = await Campus.deploy(admin.address, await token.getAddress());

  const Rewards = await ethers.getContractFactory("ZamoraRewards");
  const rewards = await Rewards.deploy(admin.address, await token.getAddress());

  const Collectibles = await ethers.getContractFactory("ZamoraCollectibles");
  const collectibles = await Collectibles.deploy(
    admin.address,
    "Zamora Collectibles",
    "ZCOLL",
  );

  const Courses = await ethers.getContractFactory("ZamoraCourses");
  const courses = await Courses.deploy(
    admin.address,
    await token.getAddress(),
    await collectibles.getAddress(),
  );

  const Forum = await ethers.getContractFactory("ZamoraForum");
  const forum = await Forum.deploy(admin.address, await token.getAddress());

  await token.grantRole(await token.MINTER_ROLE(), await campus.getAddress());
  await token.grantRole(await token.BURNER_ROLE(), await rewards.getAddress());
  await collectibles.grantRole(
    await collectibles.MINTER_ROLE(),
    await courses.getAddress(),
  );
  await collectibles.grantRole(
    await collectibles.MINTER_ROLE(),
    admin.address,
  );

  await campus.addProfessor(professor.address);
  await campus.registerStudent(student.address, "name-hash");

  return { admin, professor, student, other, token, campus, rewards, collectibles, courses, forum };
}

const hash = (text: string) => ethers.keccak256(ethers.toUtf8Bytes(text));

describe("ZamoraToken", () => {
  it("usa 0 decimales (1 ZAM = 1 unidad)", async () => {
    const { token } = await deployFixture();
    expect(await token.decimals()).to.equal(0n);
  });

  it("solo el MINTER puede acuñar", async () => {
    const { token, student } = await deployFixture();
    await expect(token.connect(student).mint(student.address, 10n, "x")).to.be.reverted;
    await token.mint(student.address, 10n, "test");
    expect(await token.balanceOf(student.address)).to.equal(10n);
  });

  it("permite quemar tokens propios", async () => {
    const { token, student } = await deployFixture();
    await token.mint(student.address, 100n, "seed");
    await token.connect(student).burn(40n, "boost");
    expect(await token.balanceOf(student.address)).to.equal(60n);
  });

  it("soporta permit (EIP-2612) y habilita transferFrom", async () => {
    const { token, admin, student, other } = await deployFixture();
    await token.mint(student.address, 100n, "seed");
    await applyPermit(token, admin, student, other.address, 30n);
    expect(await token.allowance(student.address, other.address)).to.equal(30n);
    await token.connect(other).transferFrom(student.address, other.address, 30n);
    expect(await token.balanceOf(other.address)).to.equal(30n);
  });

  it("adminBurn quema de una cuenta arbitraria (tesorería)", async () => {
    const { token, student } = await deployFixture();
    await token.mint(student.address, 50n, "seed");
    await token.adminBurn(student.address, 20n, "treasury");
    expect(await token.balanceOf(student.address)).to.equal(30n);
  });
});

describe("ZamoraCampus", () => {
  it("registra estudiante y profesor", async () => {
    const { campus, student } = await deployFixture();
    expect(await campus.registered(student.address)).to.equal(true);
    expect(await campus.hasRole(await campus.STUDENT_ROLE(), student.address)).to.equal(true);
  });

  it("cualquiera puede leer, solo admin crea materias", async () => {
    const { campus, student } = await deployFixture();
    await expect(
      campus.connect(student).createSubject("INF-1", "Test", 3, student.address),
    ).to.be.reverted;
    await campus.createSubject("INF-301", "Estructuras", 4, student.address);
    expect(await campus.subjectCount()).to.equal(1n);
  });

  it("flujo de tarea: submit on-behalf + approve acuña recompensa", async () => {
    const { campus, token, admin, student } = await deployFixture();
    await campus.createSubject("INF-301", "Estructuras", 4, admin.address);
    await campus.createTask(1, "AVL", "Implementa", 60n);
    await campus.submitTask(1, hash("proof"), student.address);
    await campus.approveSubmission(1);
    expect(await token.balanceOf(student.address)).to.equal(60n);
    const s = await campus.submissions(1);
    expect(s.approved).to.equal(true);
    expect(s.student).to.equal(student.address);
  });

  it("recordGrade aprobado acuña creditos * 100", async () => {
    const { campus, token, admin, student } = await deployFixture();
    await campus.createSubject("INF-302", "BD", 3, admin.address);
    await campus.recordGrade(1, student.address, hash("18/20"), 3, true);
    expect(await token.balanceOf(student.address)).to.equal(300n);
  });

  it("recordGrade desaprobado no acuña", async () => {
    const { campus, token, admin, student } = await deployFixture();
    await campus.createSubject("INF-303", "Redes", 4, admin.address);
    await campus.recordGrade(1, student.address, hash("10/20"), 0, false);
    expect(await token.balanceOf(student.address)).to.equal(0n);
  });

  it("asistencia: checkIn on-behalf acuña 10 y evita duplicados", async () => {
    const { campus, token, admin, student, other } = await deployFixture();
    await campus.createSubject("INF-305", "Web3", 3, admin.address);
    await campus.openAttendance(1, hash("ZAM-1234"), 1800);
    await campus.checkIn(1, "ZAM-1234", student.address);
    expect(await token.balanceOf(student.address)).to.equal(10n);
    await expect(campus.checkIn(1, "ZAM-1234", student.address)).to.be.reverted;
    await expect(
      campus.connect(other).checkIn(1, "ZAM-1234", other.address),
    ).to.be.reverted;
  });

  it("award acuña a discreción del profesor/admin", async () => {
    const { campus, token, professor, student } = await deployFixture();
    await campus.connect(professor).award(student.address, 25n, "participacion");
    expect(await token.balanceOf(student.address)).to.equal(25n);
  });
});

describe("ZamoraCollectibles", () => {
  it("los badges son SBT (no transferibles)", async () => {
    const { collectibles, admin, other } = await deployFixture();
    await collectibles.mintBadge(admin.address, 1, "ipfs://badge");
    await expect(
      collectibles.connect(admin).transferFrom(admin.address, other.address, 1),
    ).to.be.revertedWith("Zamora: SBT no transferible");
  });

  it("los pases de conferencia sí se transfieren", async () => {
    const { collectibles, admin, other } = await deployFixture();
    await collectibles.mintPass(admin.address, 1, "ipfs://pass");
    await collectibles.connect(admin).transferFrom(admin.address, other.address, 1);
    expect(await collectibles.ownerOf(1)).to.equal(other.address);
  });

  it("los certificados son SBT", async () => {
    const { collectibles, admin, other } = await deployFixture();
    await collectibles.mintCertificate(admin.address, 1, "ipfs://cert");
    expect(await collectibles.isSoulbound(1)).to.equal(true);
    await expect(
      collectibles.connect(admin).transferFrom(admin.address, other.address, 1),
    ).to.be.reverted;
  });
});

describe("ZamoraRewards", () => {
  it("canjea quemando ZAM del estudiante vía permit", async () => {
    const { rewards, token, admin, student } = await deployFixture();
    await rewards.createReward("Cafe", "1 semana", 60n, 100n);
    await token.mint(student.address, 100n, "seed");
    const rewardsAddr = await rewards.getAddress();
    await applyPermit(token, admin, student, rewardsAddr, 60n);
    await rewards.redeem(1, student.address);
    expect(await token.balanceOf(student.address)).to.equal(40n);
    expect(await token.totalSupply()).to.equal(40n);
    const r = await rewards.rewards(1);
    expect(r.redeemed).to.equal(1n);
  });

  it("no permite canjear sin allowance", async () => {
    const { rewards, token, student } = await deployFixture();
    await rewards.createReward("Cafe", "1 semana", 60n, 100n);
    await token.mint(student.address, 100n, "seed");
    await expect(rewards.redeem(1, student.address)).to.be.reverted;
  });

  it("respeta el stock", async () => {
    const { rewards, token, admin, student, other } = await deployFixture();
    await rewards.createReward("Beca", "x", 10n, 1n);
    await token.mint(student.address, 100n, "s");
    await token.mint(other.address, 100n, "s");
    const addr = await rewards.getAddress();
    await applyPermit(token, admin, student, addr, 10n);
    await rewards.redeem(1, student.address);
    await applyPermit(token, admin, other, addr, 10n);
    await expect(rewards.redeem(1, other.address)).to.be.revertedWith(
      "Zamora: agotado",
    );
  });
});

describe("ZamoraCourses", () => {
  it("inscribe con permit y reparte 80/20 (instructor / quema)", async () => {
    const { courses, token, admin, professor, student } = await deployFixture();
    await courses.createCourse("Solidity", "Curso", 100n, 10n, professor.address);
    await token.mint(student.address, 200n, "seed");
    const addr = await courses.getAddress();
    await applyPermit(token, admin, student, addr, 100n);
    await courses.enroll(1, student.address);
    expect(await token.balanceOf(professor.address)).to.equal(80n);
    expect(await token.balanceOf(student.address)).to.equal(100n);
    // 200 acuñados - 20 quemados (20% del precio) = 180
    expect(await token.totalSupply()).to.equal(180n);
    expect(await courses.isEnrolled(1, student.address)).to.equal(true);
  });

  it("completa el curso y acuña certificado SBT", async () => {
    const { courses, token, admin, professor, student } = await deployFixture();
    await courses.createCourse("Solidity", "Curso", 0n, 10n, professor.address);
    await courses.connect(admin).enroll(1, student.address); // price 0
    await courses.completeCourse(1, student.address, "ipfs://cert");
    expect(await courses.completed(1, student.address)).to.equal(true);
  });

  it("no permite inscribir dos veces", async () => {
    const { courses, admin, student } = await deployFixture();
    await courses.createCourse("X", "x", 0n, 10n, admin.address);
    await courses.enroll(1, student.address);
    await expect(courses.enroll(1, student.address)).to.be.revertedWith(
      "Zamora: ya inscrito",
    );
  });

  it("solo admin crea cursos", async () => {
    const { courses, student } = await deployFixture();
    await expect(
      courses.connect(student).createCourse("X", "x", 0n, 1n, student.address),
    ).to.be.reverted;
  });
});

describe("ZamoraForum", () => {
  it("cobra peaje y lo devuelve al alcanzar el umbral de upvotes", async () => {
    const { forum, token, admin, student } = await deployFixture();
    await token.mint(student.address, 5n, "seed");
    const forumAddr = await forum.getAddress();
    await applyPermit(token, admin, student, forumAddr, 5n);
    await forum.createPost(hash("hola"), student.address);
    expect(await token.balanceOf(student.address)).to.equal(0n);
    const signers = await ethers.getSigners();
    for (let i = 10; i < 15; i++) {
      await forum.upvote(1, signers[i].address);
    }
    expect(await token.balanceOf(student.address)).to.equal(5n);
  });

  it("remover un post no reembolsado quema el peaje", async () => {
    const { forum, token, admin, student } = await deployFixture();
    await token.mint(student.address, 5n, "seed");
    const forumAddr = await forum.getAddress();
    await applyPermit(token, admin, student, forumAddr, 5n);
    await forum.createPost(hash("spam"), student.address);
    const supplyBefore = await token.totalSupply();
    await forum.removePost(1);
    expect(await token.totalSupply()).to.equal(supplyBefore - 5n);
  });
});
