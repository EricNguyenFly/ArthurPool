// import { expect } from "chai";
// import { parseEther, parseUnits } from "ethers/lib/utils";
// import { upgrades, ethers } from "hardhat";
// import { ZERO_ADDRESS as AddressZero, MAX_UINT256 as MaxUint256, BN, ZERO_ADDRESS, getTimestamp } from "./utils";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import {
//   Admin__factory,
//   Admin,
//   ClaimPool__factory,
//   ClaimPool,
//   ClaimPoolFactory__factory,
//   ClaimPoolFactory,
//   HLPClaimPool__factory,
//   HLPClaimPool,
//   Project__factory,
//   Project,
//   HLPToken__factory,
//   HLPToken,
//   Randomizer__factory,
//   Randomizer,
//   HLPeaceGenesisAngel__factory,
//   HLPeaceGenesisAngel,
//   Treasury__factory,
//   Treasury,
//   TaskManager,
//   TaskManager__factory,
//   Reward__factory,
//   Reward,
// } from "../typechain-types";
// import { CollectionInfoStruct } from "../typechain-types/contracts/Project";
// import ClaimPoolJSON from "../artifacts/contracts/ClaimFactory/ClaimPool.sol/ClaimPool.json";
// import bigDecimal from "js-big-decimal";
// import { BigNumber } from "ethers";

// // signer variables
// let owner: SignerWithAddress;
// let admin1: SignerWithAddress;
// let admin2: SignerWithAddress;
// let projectOwner1: SignerWithAddress;
// let projectOwner2: SignerWithAddress;
// let user1: SignerWithAddress;
// let accounts: SignerWithAddress[];

// // contract instance
// let project: Project;
// let hlpClaimPool: HLPClaimPool;
// let claimPoolFactory: ClaimPoolFactory;
// let hlpToken: HLPToken;
// let genesis: HLPeaceGenesisAngel;
// let randomizer: Randomizer;
// let treasury: Treasury;
// let taskManager: TaskManager;
// let reward: Reward;
// let admin: Admin;

// // constants
// const FEE_NUMERATOR = 100;
// const METADATA = "Example metadata";
// let DENOMINATOR: BN;

// describe("MerlinPoolFactory", () => {
//   beforeEach(async () => {
//     [owner, admin1, admin2, projectOwner1, projectOwner2, user1, ...accounts] = await ethers.getSigners();

//     const HLPToken: HLPToken__factory = await ethers.getContractFactory("HLPToken");
//     hlpToken = (await HLPToken.deploy()) as HLPToken;

//     const Admin: Admin__factory = await ethers.getContractFactory("Admin");
//     admin = (await upgrades.deployProxy(Admin, [owner.address])) as Admin;
//     await admin.deployed();

//     const ClaimPool: ClaimPool__factory = await ethers.getContractFactory("ClaimPool");
//     const claimPool: ClaimPool = await ClaimPool.deploy();

//     const ClaimPoolFactory: ClaimPoolFactory__factory = await ethers.getContractFactory("ClaimPoolFactory");
//     claimPoolFactory = (await upgrades.deployProxy(ClaimPoolFactory, [claimPool.address, owner.address])) as ClaimPoolFactory;
//     await claimPoolFactory.deployed();

//     const HLPClaimPool: HLPClaimPool__factory = await ethers.getContractFactory("HLPClaimPool");
//     hlpClaimPool = (await upgrades.deployProxy(HLPClaimPool, [admin.address])) as HLPClaimPool;
//     await hlpClaimPool.deployed();

//     const Reward: Reward__factory = await ethers.getContractFactory("Reward");
//     reward = (await upgrades.deployProxy(Reward, [admin.address])) as Reward;

//     const Project: Project__factory = await ethers.getContractFactory("Project");
//     project = (await upgrades.deployProxy(Project, [admin.address, claimPoolFactory.address, hlpClaimPool.address, reward.address])) as Project;

//     const TaskManager: TaskManager__factory = await ethers.getContractFactory("TaskManager");
//     taskManager = (await upgrades.deployProxy(TaskManager, [admin.address, project.address, owner.address])) as TaskManager;

//     const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");

//     const Treasury: Treasury__factory = await ethers.getContractFactory("Treasury");
//     treasury = (await upgrades.deployProxy(Treasury, [admin.address, owner.address, owner.address, hlpClaimPool.address, 3000, 3000, 4000])) as Treasury;

//     genesis = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//     await hlpToken.mint(projectOwner1.address, "10000000000000000000000");
//     await hlpToken.connect(projectOwner1).approve(project.address, MaxUint256);

//     DENOMINATOR = BigNumber.from(10000);

//     // set project is admin of claim pool and claim pool factory
//     await claimPoolFactory.connect(owner).setAdmin(project.address, true);
//     await admin.connect(owner).setAdmin(admin1.address, true);
//     await admin.connect(owner).setAdmin(admin2.address, true);
//   });

//   describe("Deployment", () => {
//     it("should revert with contract is already initialized", async () => {
//       await expect(project.initialize(admin.address, claimPoolFactory.address, hlpClaimPool.address, reward.address)).to.be.revertedWith("Initializable: contract is already initialized");
//     });
//     it("HLP Claim Pool already has project", async () => {
//       const Admin: Admin__factory = await ethers.getContractFactory("Admin");
//       const admin: Admin = (await upgrades.deployProxy(Admin, [owner.address])) as Admin;
//       await admin.deployed();

//       const Project: Project__factory = await ethers.getContractFactory("Project");
//       const newProject: Project = (await upgrades.deployProxy(Project, [admin.address, claimPoolFactory.address, hlpClaimPool.address, reward.address])) as Project;
//       await newProject.deployed();

//       expect(await hlpClaimPool.project()).to.equal(project.address);
//     });

//     it("Check parameters of project", async () => {
//       expect(await project.maxCollectionInProject()).to.equal(20);
//       expect(await hlpClaimPool.project()).to.equal(project.address);
//     });
//   });

//   describe("setClaimPoolFactory", () => {
//     it("should revert with caller is not owner", async () => {
//       await expect(project.connect(admin1).setClaimPoolFactory(claimPoolFactory.address)).to.be.revertedWith("Caller is not owner");
//     });

//     it("should revert with invalid address", async () => {
//       await expect(project.connect(owner).setClaimPoolFactory(AddressZero)).to.be.revertedWith("Invalid address");
//     });

//     it("should revert with claimPoolFactory already exists", async () => {
//       await expect(project.connect(owner).setClaimPoolFactory(claimPoolFactory.address)).to.be.revertedWith("ClaimPoolFactory already exists");
//     });

//     it("should setClaimPoolFactory successfully", async () => {
//       const ClaimPool: ClaimPool__factory = await ethers.getContractFactory("ClaimPool");
//       const claimPool: ClaimPool = await ClaimPool.deploy();

//       const ClaimPoolFactory: ClaimPoolFactory__factory = await ethers.getContractFactory("ClaimPoolFactory");
//       const newClaimPoolFactory = (await upgrades.deployProxy(ClaimPoolFactory, [claimPool.address, owner.address])) as ClaimPoolFactory;
//       await newClaimPoolFactory.deployed();

//       await expect(project.connect(owner).setClaimPoolFactory(newClaimPoolFactory.address))
//         .to.emit(project, "SetClaimPoolFactory")
//         .withArgs(claimPoolFactory.address, newClaimPoolFactory.address);
//     });
//   });

//   describe("setHLPClaimPool", () => {
//     it("should revert with caller is not owner", async () => {
//       await expect(project.connect(user1).setHLPClaimPool(hlpClaimPool.address)).to.be.revertedWith("Caller is not owner");
//     });

//     it("should revert with invalid address", async () => {
//       await expect(project.connect(owner).setHLPClaimPool(AddressZero)).to.be.revertedWith("Invalid address");
//     });

//     it("should revert with HLPClaimPool already exists", async () => {
//       await expect(project.connect(owner).setHLPClaimPool(hlpClaimPool.address)).to.be.revertedWith("HLPClaimPool already exists");
//     });

//     it("should setHLPClaimPool successfully", async () => {
//       const Admin: Admin__factory = await ethers.getContractFactory("Admin");
//       const admin: Admin = (await upgrades.deployProxy(Admin, [owner.address])) as Admin;
//       await admin.deployed();

//       const HLPClaimPool: HLPClaimPool__factory = await ethers.getContractFactory("HLPClaimPool");
//       const newHlpClaimPool = (await upgrades.deployProxy(HLPClaimPool, [admin.address])) as HLPClaimPool;
//       await newHlpClaimPool.deployed();

//       await expect(project.connect(owner).setHLPClaimPool(newHlpClaimPool.address))
//         .to.emit(project, "SetHLPClaimPool")
//         .withArgs(hlpClaimPool.address, newHlpClaimPool.address);
//     });
//   });

//   describe("registerTaskManager", () => {
//     it("should revert with Already register", async () => {
//       await expect(project.connect(admin1).registerTaskManager()).to.be.revertedWith("Already register");
//     });

//     it("should registerTaskManager successfully", async () => {
//       const Admin: Admin__factory = await ethers.getContractFactory("Admin");
//       const admin: Admin = (await upgrades.deployProxy(Admin, [owner.address])) as Admin;
//       await admin.deployed();

//       const Project: Project__factory = await ethers.getContractFactory("Project");
//       const newProject = (await upgrades.deployProxy(Project, [admin.address, claimPoolFactory.address, hlpClaimPool.address, reward.address])) as Project;

//       await expect(newProject.connect(owner).registerTaskManager())
//         .to.emit(newProject, "RegisterTaskManager")
//         .withArgs(owner.address);

//       expect(await newProject.taskManager()).to.equal(owner.address);
//     });
//   });

//   describe("setMaxCollectionInProject", () => {
//     it("should revert with caller is not owner", async () => {
//       await expect(project.connect(admin1).setMaxCollectionInProject(12)).to.be.revertedWith("Caller is not owner");
//     });

//     it("should revert with invalid amount", async () => {
//       await expect(project.connect(owner).setMaxCollectionInProject(0)).to.be.revertedWith("Invalid amount");
//     });

//     it("should revert with maxCollectionInProject already exists", async () => {
//       await expect(project.connect(owner).setMaxCollectionInProject(20)).to.be.revertedWith("MaxCollectionInProject already exists");
//     });

//     it("should setMaxCollectionInProject successfully", async () => {
//       await expect(project.connect(owner).setMaxCollectionInProject(10))
//         .to.emit(project, "SetMaxCollectionInProject")
//         .withArgs(20, 10);
//     });
//   });

//   describe("createProject", () => {
//     const BUDGET = parseUnits("400", 18);
//     const collectionInfos: CollectionInfoStruct[] = [
//       {
//         collectionAddress: AddressZero,
//         rewardPercent: 1e4,
//         rewardRarityPercents: [],
//       },
//     ];

//     it("should revert with invalid length", async () => {
//       await expect(project.connect(projectOwner1).createProject("97", hlpToken.address, BUDGET, [])).to.be.revertedWith("Invalid length");
//     });

//     it("should revert with Invalid collection address or collection is already in use", async () => {
//       await expect(project.connect(projectOwner1).createProject("97", hlpToken.address, BUDGET, collectionInfos)).to.be.revertedWith("Invalid collection address or collection is already in use");

//       collectionInfos[0].collectionAddress = genesis.address;
//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);

//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       const newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos.push({
//         collectionAddress: newHLPeaceGenesisAngel.address,
//         rewardPercent: 1e4,
//         rewardRarityPercents: [],
//       });

//       await expect(project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos)).to.be.revertedWith("Invalid collection address or collection is already in use");

//       collectionInfos.pop();
//     });

//     it("it should revert with the total percentage must be equal to 100%", async () => {
//       collectionInfos[0].rewardRarityPercents = [4 * 1e3, 5 * 1e3];
//       await expect(project.connect(projectOwner1).createProject("97", hlpToken.address, BUDGET, collectionInfos)).to.be.revertedWith("The total percentage must be equal to 100%");
//       collectionInfos[0].rewardRarityPercents = [];
//     });

//     it("shoud revert with invalid amount", async () => {
//       await expect(
//         project.connect(projectOwner1).createProject("97", AddressZero, parseEther("10"), collectionInfos, {
//           value: parseEther("9"),
//         })
//       ).to.be.revertedWith("Invalid amount");
//     });

//     it("should revert with transfer amount exceeds balance", async () => {
//       await hlpToken.connect(projectOwner2).approve(project.address, MaxUint256);
//       await expect(project.connect(projectOwner2).createProject("97", hlpToken.address, BUDGET, collectionInfos)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
//     });

//     it("should revert with insufficient allowance", async () => {
//       await hlpToken.mint(projectOwner2.address, "10000000000000000000000");

//       await expect(project.connect(projectOwner2).createProject("97", hlpToken.address, BUDGET, collectionInfos)).to.be.revertedWith("ERC20: insufficient allowance");
//     });

//     it("should revert with The total percentage must be equal to 100%", async () => {
//       collectionInfos[0].rewardPercent = 1e3;
//       await expect(project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos)).to.be.revertedWith("The total percentage must be equal to 100%");
//     });

//     it("should create new project successfully", async () => {
//       // Project 1
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       let projectId: number = (await project.getProjectCounter()).toNumber() + 1;

//       await expect(project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos))
//         .to.emit(project, "CreatedProject")
//         .withArgs(projectId, "97");
//       let currentProject = await project.getProjectById(projectId);
//       expect(currentProject.projectId).to.equal(projectId);
//       expect(currentProject.idOffChain).to.equal("97");
//       expect(currentProject.paymentToken).to.equal(hlpToken.address);
//       expect(currentProject.projectOwner).to.equal(projectOwner1.address);
//       expect(currentProject.budget).to.equal(0);
//       expect(currentProject.status).to.be.true;
//       expect(currentProject.claimPool).not.equal(AddressZero);
//       expect((await project.collectionInfos(genesis.address, projectId)).rewardPercent).to.equal(1e4);
//       expect((await project.collectionInfos(genesis.address, projectId)).collectionAddress).to.equal(genesis.address);
//       expect(await project.collectionToProjects(genesis.address)).to.equal(projectId);

//       // Project 2
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos[0] = {
//         collectionAddress: newHLPeaceGenesisAngel.address,
//         rewardPercent: 1e4,
//         rewardRarityPercents: [],
//       };

//       projectId = (await project.getProjectCounter()).toNumber() + 1;
//       await expect(project.connect(projectOwner1).createProject("97", hlpToken.address, BUDGET, collectionInfos))
//         .to.emit(project, "CreatedProject")
//         .withArgs(projectId, "97")
//         .to.changeTokenBalance(hlpToken, projectOwner1.address, `-${BUDGET}`);

//       currentProject = await project.getProjectById(projectId);
//       expect(currentProject.projectId).to.equal(projectId);
//       expect(currentProject.paymentToken).to.equal(hlpToken.address);
//       expect(currentProject.projectOwner).to.equal(projectOwner1.address);
//       expect(currentProject.budget).to.equal(BUDGET);
//       expect(currentProject.status).to.be.true;
//       expect(currentProject.claimPool).not.equal(AddressZero);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).rewardPercent).to.equal(1e4);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).collectionAddress).to.equal(newHLPeaceGenesisAngel.address);
//       expect(await project.collectionToProjects(newHLPeaceGenesisAngel.address)).to.equal(projectId);
//       expect(await hlpToken.balanceOf(currentProject.claimPool)).to.equal(BUDGET);

//       const provider = ethers.provider;
//       let claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.project()).to.equal(project.address);
//       expect(await claimPoolContract.paymentToken()).to.equal(hlpToken.address);
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel.address)).to.equal(BUDGET);

//       // Project 3
//       const newHLPeaceGenesisAngel1 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos[0] = {
//         collectionAddress: newHLPeaceGenesisAngel1.address,
//         rewardPercent: 3 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       };

//       const newHLPeaceGenesisAngel2 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos.push({
//         collectionAddress: newHLPeaceGenesisAngel2.address,
//         rewardPercent: 7 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       });

//       const ETH_BUDGET = parseEther("100");

//       projectId = (await project.getProjectCounter()).toNumber() + 1;
//       await expect(
//         project.connect(projectOwner2).createProject("97", AddressZero, ETH_BUDGET, collectionInfos, {
//           value: ETH_BUDGET,
//         })
//       )
//         .to.emit(project, "CreatedProject")
//         .withArgs(projectId, "97")
//         .to.changeEtherBalance(projectOwner2.address, `-${ETH_BUDGET}`);

//       currentProject = await project.getProjectById(projectId);
//       expect(currentProject.projectId).to.equal(projectId);
//       expect(currentProject.paymentToken).to.equal(AddressZero);
//       expect(currentProject.projectOwner).to.equal(projectOwner2.address);
//       expect(currentProject.budget).to.equal(ETH_BUDGET);
//       expect(currentProject.status).to.be.true;
//       expect(currentProject.claimPool).not.equal(AddressZero);
//       expect(await ethers.provider.getBalance(currentProject.claimPool)).to.equal(ETH_BUDGET);

//       expect((await project.collectionInfos(newHLPeaceGenesisAngel1.address, projectId)).rewardPercent).to.equal(3 * 1e3);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel1.address, projectId)).collectionAddress).to.equal(newHLPeaceGenesisAngel1.address);
//       expect(await project.collectionToProjects(newHLPeaceGenesisAngel1.address)).to.equal(projectId);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel2.address, projectId)).rewardPercent).to.equal(7 * 1e3);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel2.address, projectId)).collectionAddress).to.equal(newHLPeaceGenesisAngel2.address);
//       expect(await project.collectionToProjects(newHLPeaceGenesisAngel2.address)).to.equal(projectId);

//       claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.project()).to.equal(project.address);
//       expect(await claimPoolContract.paymentToken()).to.equal(AddressZero);
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel1.address)).to.equal(ETH_BUDGET.mul(3 * 1e3).div(DENOMINATOR));
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel2.address)).to.equal(ETH_BUDGET.mul(7 * 1e3).div(DENOMINATOR));
//     });
//   });

//   describe("removeProject", () => {
//     let projectId: number;
//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.connect(projectOwner1).removeProject(0)).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(projectOwner1).removeProject(projectId + 1)).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       await expect(project.connect(projectOwner2).removeProject(projectId)).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with project deleted", async () => {
//       await project.connect(projectOwner1).removeProject(projectId);
//       await expect(project.connect(projectOwner1).removeProject(projectId)).to.be.revertedWith("Project deleted");
//     });

//     it("should revert with collection has task active", async () => {
//       const ETH_BUDGET = parseEther("100");
//       const startTime = (await getTimestamp()) + 1000;
//       const endTime = startTime + 86400;

//       await project.connect(projectOwner1).deposit(projectId, ETH_BUDGET);

//       await taskManager.connect(projectOwner1).createTask("123", projectId, genesis.address, startTime, endTime, ETH_BUDGET);
//       await expect(project.connect(projectOwner1).removeProject(projectId)).to.be.revertedWith("Project has an active task. Cannot remove project");
//     });

//     it("it should remove project successfully", async () => {
//       await expect(project.connect(projectOwner1).removeProject(projectId))
//         .to.emit(project, "RemovedProject")
//         .withArgs(projectId);
//       let currentProject = await project.getProjectById(projectId);
//       expect(currentProject.status).to.be.false;

//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, parseUnits("10", 18), collectionInfos);
//       projectId = (await project.getProjectCounter()).toNumber();
//       await expect(project.connect(projectOwner1).removeProject(projectId))
//         .to.emit(project, "RemovedProject")
//         .withArgs(projectId);
//       currentProject = await project.getProjectById(projectId);
//       expect(currentProject.status).to.be.false;
//     });
//   });

//   describe("addCollections", () => {
//     let projectId: number;
//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with invalid projectId", async () => {
//       const collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await expect(project.connect(projectOwner1).addCollections(0, collectionInfo, [])).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(projectOwner1).addCollections(projectId + 1, collectionInfo, [])).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       const collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];
//       await expect(project.connect(projectOwner2).addCollections(projectId, collectionInfo, [])).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with caller is Invalid collection length", async () => {
//       await expect(project.connect(projectOwner1).addCollections(projectId, [], [])).to.be.revertedWith("Invalid collection length");

//       const maxCollectionInProject = 3;
//       let collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: user1.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//         {
//           collectionAddress: projectOwner1.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//         {
//           collectionAddress: projectOwner2.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];
//       let percents = [1000,2000,6000,1000];

//       await project.connect(owner).setMaxCollectionInProject(maxCollectionInProject);
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, percents)).to.be.revertedWith("Invalid collection length");

//       collectionInfo  = [
//         {
//           collectionAddress: user1.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//         {
//           collectionAddress: projectOwner1.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         }
//       ];
//       percents = [1000,2000,7000];
//       await project.connect(projectOwner1).addCollections(projectId, collectionInfo, percents);

//       collectionInfo  = [
//         {
//           collectionAddress: user1.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         }
//       ];
//       percents = [1000,2000,6000, 1000];
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, percents)).to.be.revertedWith("Invalid collection length");
//     });

//     it("should revert with Invalid collection address or collection is already in use", async () => {
//       const collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [5000, 5000])).to.be.revertedWith("Invalid collection address or collection is already in use");

//       collectionInfo[0].collectionAddress = AddressZero;
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [5000, 5000])).to.be.revertedWith("Invalid collection address or collection is already in use");
//     });

//     it("should revert with invalid percents array", async () => {
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       const collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: newHLPeaceGenesisAngel.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 20],
//         },
//       ];

//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [5000])).to.be.revertedWith("Invalid percents array");
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [5000, 5000, 5000])).to.be.revertedWith("Invalid percents array");
//     });

//     it("should revert with the total percentage must be equal to 100%", async () => {
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       const collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: newHLPeaceGenesisAngel.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 20],
//         },
//       ];

//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [5000, 3000])).to.be.revertedWith("The total percentage must be equal to 100%");
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [5000, 5000])).to.be.revertedWith("The total percentage must be equal to 100%");
//     });

//     it("should revert with project deleted", async () => {
//       await project.connect(projectOwner1).removeProject(projectId);
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       let collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: newHLPeaceGenesisAngel.address,
//           rewardPercent: 1200,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [6000, 4000])).to.be.revertedWith("Project deleted");
//     });

//     it("should add collection successfully", async () => {
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       let collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: newHLPeaceGenesisAngel.address,
//           rewardPercent: 1200,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];
//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [6000, 4000])).to.emit(project, "AddedCollection");

//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).rewardPercent).to.equal(4000);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).collectionAddress).to.equal(newHLPeaceGenesisAngel.address);
//       expect(await project.collectionToProjects(newHLPeaceGenesisAngel.address)).to.equal(projectId);

//       newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       collectionInfo = [
//         {
//           collectionAddress: newHLPeaceGenesisAngel.address,
//           rewardPercent: 1200,
//           rewardRarityPercents: [],
//         },
//       ];

//       await expect(project.connect(projectOwner1).addCollections(projectId, collectionInfo, [3000, 4000, 3000])).to.emit(project, "AddedCollection");

//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).rewardPercent).to.equal(3000);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).collectionAddress).to.equal(newHLPeaceGenesisAngel.address);
//       expect(await project.collectionToProjects(newHLPeaceGenesisAngel.address)).to.equal(projectId);
//     });
//   });

//   describe("removeCollection", () => {
//     let projectId: number;
//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.connect(projectOwner1).removeCollection(0, genesis.address, [])).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(projectOwner1).removeCollection(projectId + 1, genesis.address, [])).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       await expect(project.connect(projectOwner2).removeCollection(projectId, genesis.address, [])).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with project deleted", async () => {
//       await project.connect(projectOwner1).removeProject(projectId);
//       await expect(project.connect(projectOwner1).removeCollection(projectId, genesis.address, [])).to.be.revertedWith("Project deleted");
//     });

//     it("should revert with collection has task active", async () => {
//       const ETH_BUDGET = parseEther("100");
//       const startTime = (await getTimestamp()) + 1000;
//       const endTime = startTime + 86400;

//       await project.connect(projectOwner1).deposit(projectId, ETH_BUDGET);

//       await taskManager.connect(projectOwner1).createTask("123", projectId, genesis.address, startTime, endTime, ETH_BUDGET);
//       await expect(project.connect(projectOwner1).removeCollection(projectId, genesis.address, [])).to.be.revertedWith("Cannot remove collection");
//     });

//     it("should revert with invalid address collection", async () => {
//       await expect(project.connect(projectOwner1).removeCollection(projectId, AddressZero, [])).to.be.revertedWith("Invalid collection address");

//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       await expect(project.connect(projectOwner1).removeCollection(projectId, newHLPeaceGenesisAngel.address, [])).to.be.revertedWith("Invalid collection address");
//     });

//     it("should revert with invalid percents array", async () => {
//       await expect(project.connect(projectOwner1).removeCollection(projectId, genesis.address, [1200])).to.be.revertedWith("Invalid percents array");
//     });

//     it("should revert with the total percentage must be equal to 100%", async () => {
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       let collectionInfo: CollectionInfoStruct[] = [
//         {
//           collectionAddress: newHLPeaceGenesisAngel.address,
//           rewardPercent: 1200,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];
//       await project.connect(projectOwner1).addCollections(projectId, collectionInfo, [6000, 4000]);
//       await expect(project.connect(projectOwner1).removeCollection(projectId, genesis.address, [1200])).to.be.revertedWith("The total percentage must be equal to 100%");
//     });

//     it("should remove collection successfully", async () => {
//       const BUDGET = parseUnits("400", 18);

//       // Project 1
//       await expect(project.connect(projectOwner1).removeCollection(projectId, genesis.address, []))
//         .to.emit(project, "RemovedCollection")
//         .withArgs(projectId, genesis.address);
//       expect((await project.collectionInfos(genesis.address, projectId)).rewardPercent).to.equal(0);
//       expect((await project.collectionInfos(genesis.address, projectId)).collectionAddress).to.equal(AddressZero);
//       expect(await project.collectionToProjects(genesis.address)).to.equal(0);

//       let currentProject = await project.getProjectById(projectId);
//       const provider = ethers.provider;
//       let claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(genesis.address)).to.equal(0);

//       // Project 2
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       let newHLPeaceGenesisAngel = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       let collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: newHLPeaceGenesisAngel.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [],
//         },
//       ];

//       projectId = (await project.getProjectCounter()).toNumber() + 1;
//       await project.connect(projectOwner1).createProject("97", hlpToken.address, BUDGET, collectionInfos);

//       await expect(project.connect(projectOwner1).removeCollection(projectId, newHLPeaceGenesisAngel.address, []))
//         .to.emit(project, "RemovedCollection")
//         .withArgs(projectId, newHLPeaceGenesisAngel.address)
//         .to.changeTokenBalance(hlpToken, projectOwner1.address, BUDGET);

//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).rewardPercent).to.equal(0);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel.address, projectId)).collectionAddress).to.equal(AddressZero);
//       expect(await project.collectionToProjects(newHLPeaceGenesisAngel.address)).to.equal(0);

//       currentProject = await project.getProjectById(projectId);
//       claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel.address)).to.equal(0);

//       // Project 3
//       const newHLPeaceGenesisAngel1 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos[0] = {
//         collectionAddress: newHLPeaceGenesisAngel1.address,
//         rewardPercent: 3 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       };

//       const newHLPeaceGenesisAngel2 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos.push({
//         collectionAddress: newHLPeaceGenesisAngel2.address,
//         rewardPercent: 7 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       });

//       const ETH_BUDGET = parseEther("100");

//       projectId = (await project.getProjectCounter()).toNumber() + 1;
//       await project.connect(projectOwner2).createProject("97", AddressZero, ETH_BUDGET, collectionInfos, {
//         value: ETH_BUDGET,
//       });

//       await expect(project.connect(projectOwner2).removeCollection(projectId, newHLPeaceGenesisAngel2.address, [10000]))
//         .to.emit(project, "RemovedCollection")
//         .withArgs(projectId, newHLPeaceGenesisAngel2.address)
//         .to.changeEtherBalance(projectOwner2.address, ETH_BUDGET.mul(7 * 1e3).div(DENOMINATOR));

//       expect((await project.collectionInfos(newHLPeaceGenesisAngel2.address, projectId)).rewardPercent).to.equal(0);
//       expect((await project.collectionInfos(newHLPeaceGenesisAngel2.address, projectId)).collectionAddress).to.equal(AddressZero);
//       expect(await project.collectionToProjects(newHLPeaceGenesisAngel2.address)).to.equal(0);

//       currentProject = await project.getProjectById(projectId);
//       claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel2.address)).to.equal(0);
//       expect(await ethers.provider.getBalance(currentProject.claimPool)).to.equal(ETH_BUDGET.mul(3 * 1e3).div(DENOMINATOR));
//     });
//   });

//   describe("deposit", () => {
//     let projectId1: number;
//     let projectId2: number;
//     const ETH_BUDGET = parseEther("100");
//     const BUDGET = parseUnits("400", 18);
//     let newHLPeaceGenesisAngel1: HLPeaceGenesisAngel;
//     let newHLPeaceGenesisAngel2: HLPeaceGenesisAngel;
//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();

//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       newHLPeaceGenesisAngel1 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos[0] = {
//         collectionAddress: newHLPeaceGenesisAngel1.address,
//         rewardPercent: 3 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       };

//       newHLPeaceGenesisAngel2 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos.push({
//         collectionAddress: newHLPeaceGenesisAngel2.address,
//         rewardPercent: 7 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       });

//       projectId2 = (await project.getProjectCounter()).toNumber() + 1;
//       await project.connect(projectOwner2).createProject("97", AddressZero, ETH_BUDGET, collectionInfos, {
//         value: ETH_BUDGET,
//       });
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.connect(projectOwner1).deposit(0, 200)).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(projectOwner1).deposit(projectId1 + 123, 200)).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       await expect(project.connect(projectOwner2).deposit(projectId1, 200)).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with invalid amount", async () => {
//       await expect(project.connect(projectOwner1).deposit(projectId1, 0)).to.be.revertedWith("Invalid amount");
//       await expect(
//         project.connect(projectOwner2).deposit(projectId2, 100, {
//           value: ETH_BUDGET,
//         })
//       ).to.be.revertedWith("Invalid amount");
//     });

//     it("should revert with project deleted", async () => {
//       await project.connect(projectOwner1).removeProject(projectId1);
//       await expect(project.connect(projectOwner1).deposit(projectId1, BUDGET)).to.be.revertedWith("Project deleted");
//     });

//     it("should deposit successfully", async () => {
//       // Project 1
//       let currentProject = await project.getProjectById(projectId1);
//       await expect(project.connect(projectOwner1).deposit(projectId1, BUDGET))
//         .to.emit(project, "Deposited")
//         .withArgs(projectId1, BUDGET)
//         .to.changeTokenBalances(hlpToken, [projectOwner1, currentProject.claimPool], [`-${BUDGET}`, BUDGET]);

//       const provider = ethers.provider;
//       let claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(genesis.address)).to.equal(BUDGET);

//       currentProject = await project.getProjectById(projectId2);
//       await expect(
//         project.connect(projectOwner2).deposit(projectId2, ETH_BUDGET.div(2), {
//           value: ETH_BUDGET.div(2),
//         })
//       )
//         .to.emit(project, "Deposited")
//         .withArgs(projectId1, BUDGET)
//         .to.changeEtherBalances([projectOwner2, currentProject.claimPool], [`-${ETH_BUDGET.div(2)}`, ETH_BUDGET.div(2)]);

//       claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel1.address)).to.equal(parseEther("45"));
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel2.address)).to.equal(parseEther("105"));
//     });
//   });

//   describe("depositToCollection", () => {
//     let projectId1: number;
//     let projectId2: number;
//     const ETH_BUDGET = parseEther("100");
//     const BUDGET = parseUnits("400", 18);
//     let newHLPeaceGenesisAngel1: HLPeaceGenesisAngel;
//     let newHLPeaceGenesisAngel2: HLPeaceGenesisAngel;

//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();

//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       newHLPeaceGenesisAngel1 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos[0] = {
//         collectionAddress: newHLPeaceGenesisAngel1.address,
//         rewardPercent: 3 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       };

//       newHLPeaceGenesisAngel2 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       collectionInfos.push({
//         collectionAddress: newHLPeaceGenesisAngel2.address,
//         rewardPercent: 7 * 1e3,
//         rewardRarityPercents: [7208, 2520, 252, 18, 2],
//       });

//       projectId2 = (await project.getProjectCounter()).toNumber() + 1;
//       await project.connect(projectOwner2).createProject("97", AddressZero, ETH_BUDGET, collectionInfos, {
//         value: ETH_BUDGET,
//       });
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.connect(projectOwner1).depositToCollection(0, genesis.address, 200)).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(projectOwner1).depositToCollection(projectId1 + 123, genesis.address, 200)).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       await expect(project.connect(projectOwner2).depositToCollection(projectId1, genesis.address, 200)).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with invalid address", async () => {
//       await expect(project.connect(projectOwner1).depositToCollection(projectId1, AddressZero, 200)).to.be.revertedWith("Invalid address");
//     });

//     it("should revert with invalid amount", async () => {
//       await expect(project.connect(projectOwner1).depositToCollection(projectId1, genesis.address, 0)).to.be.revertedWith("Invalid amount");
//       await expect(
//         project.connect(projectOwner2).depositToCollection(projectId2, newHLPeaceGenesisAngel1.address, 100, {
//           value: ETH_BUDGET,
//         })
//       ).to.be.revertedWith("Invalid amount");
//     });

//     it("should revert with invalid collection address", async () => {
//       await expect(project.connect(projectOwner1).depositToCollection(projectId1, user1.address, BUDGET)).to.be.revertedWith("Invalid collection address");

//       await project.connect(projectOwner1).removeProject(projectId1);
//       await expect(project.connect(projectOwner1).depositToCollection(projectId1, genesis.address, BUDGET)).to.be.revertedWith("Invalid collection address");
//     });

//     it("should revert with invalid collection address", async () => {
//       await expect(
//         project.connect(projectOwner2).depositToCollection(projectId2, genesis.address, ETH_BUDGET, {
//           value: ETH_BUDGET,
//         })
//       ).to.be.revertedWith("Invalid collection address");
//     });

//     it("should depositToCollection successfully", async () => {
//       // Project 1
//       let currentProject = await project.getProjectById(projectId1);
//       await expect(project.connect(projectOwner1).depositToCollection(projectId1, genesis.address, BUDGET))
//         .to.emit(project, "DepositedToCollection")
//         .withArgs(projectId1, genesis.address, BUDGET)
//         .to.changeTokenBalances(hlpToken, [projectOwner1, currentProject.claimPool], [`-${BUDGET}`, BUDGET]);

//       const provider = ethers.provider;
//       let claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(genesis.address)).to.equal(BUDGET);

//       currentProject = await project.getProjectById(projectId2);
//       await expect(
//         project.connect(projectOwner2).depositToCollection(projectId2, newHLPeaceGenesisAngel1.address, ETH_BUDGET.div(2), {
//           value: ETH_BUDGET.div(2),
//         })
//       )
//         .to.emit(project, "DepositedToCollection")
//         .withArgs(projectId1, newHLPeaceGenesisAngel1.address, BUDGET)
//         .to.changeEtherBalances([projectOwner2, currentProject.claimPool], [`-${ETH_BUDGET.div(2)}`, ETH_BUDGET.div(2)]);

//       claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(newHLPeaceGenesisAngel1.address)).to.equal(parseEther("80"));
//     });
//   });

//   describe("updatePercent", () => {
//     let projectId1: number;
//     const ETH_BUDGET = parseEther("100");
//     const BUDGET = parseUnits("400", 18);

//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.connect(projectOwner1).updatePercent(0, [200])).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(projectOwner1).updatePercent(projectId1 + 123, [200])).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       await expect(project.connect(projectOwner2).updatePercent(projectId1, [])).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with project deleted", async () => {
//       await project.connect(projectOwner1).removeProject(projectId1);
//       await expect(project.connect(projectOwner1).updatePercent(projectId1, [])).to.be.revertedWith("Project deleted");
//     });

//     it("should revert with the total percent must be equal to 100%", async () => {
//       await expect(project.connect(projectOwner1).updatePercent(projectId1, [])).to.be.revertedWith("The total percentage must be equal to 100%");
//     });

//     it("should revert with invalid length", async () => {
//       await expect(project.connect(projectOwner1).updatePercent(projectId1, [3000, 7000])).to.be.revertedWith("Invalid length");
//     });

//     it("should updatePercent successfully", async () => {
//       await expect(project.connect(projectOwner1).updatePercent(projectId1, [10000])).to.emit(project, "UpdatedPercent");
//     });

//     it("should revert with invalid project", async () => {
//       await expect(project.connect(projectOwner1).updatePercent(0, [])).to.be.revertedWith("Invalid projectId");
//     });
//   });

//   describe("updateRewardRarityPercent", () => {
//     let projectId1: number;
//     const ETH_BUDGET = parseEther("100");
//     const BUDGET = parseUnits("400", 18);

//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.connect(projectOwner1).updateRewardRarityPercent(0, genesis.address, [200])).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(projectOwner1).updateRewardRarityPercent(projectId1 + 123, genesis.address, [200])).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       await expect(project.connect(projectOwner2).updateRewardRarityPercent(projectId1, genesis.address, [])).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with project deleted", async () => {
//       await project.connect(projectOwner1).removeProject(projectId1);
//       await expect(project.connect(projectOwner1).updateRewardRarityPercent(projectId1, genesis.address, [])).to.be.revertedWith("Project deleted");
//     });

//     it("should revert with the total percent must be equal to 100%", async () => {
//       await expect(project.connect(projectOwner1).updateRewardRarityPercent(projectId1, genesis.address, [])).to.be.revertedWith("The total percentage must be equal to 100%");
//     });

//     it("should revert with invalid collection address", async () => {
//       await expect(project.connect(projectOwner1).updateRewardRarityPercent(projectId1, ZERO_ADDRESS, [2000, 3000, 5000])).to.be.revertedWith("Invalid collection address");
//     });

//     it("should updateRewardRarityPercent successfully", async () => {
//       await expect(project.connect(projectOwner1).updateRewardRarityPercent(projectId1, genesis.address, [2000, 3000, 5000])).to.emit(project, "UpdatedRewardRarityPercent");
//     });
//   });

//   describe("splitBudget", () => {
//     let projectId1: number;
//     const BUDGET = parseUnits("400", 18);

//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.splitBudget(projectId1 + 1, BUDGET)).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not permitted", async () => {
//       await expect(project.connect(projectOwner2).splitBudget(projectId1, BUDGET)).to.be.revertedWith("Caller is not permitted");
//     });

//     it("it should splitBudget successfully", async () => {
//       await hlpToken.connect(projectOwner1).transfer(hlpClaimPool.address, BUDGET);

//       const currentProject = await project.getProjectById(projectId1);

//       await expect(hlpClaimPool.connect(admin1).depositToProject(projectId1, BUDGET))
//         .to.emit(project, "SplittedBudget")
//         .withArgs(projectId1, BUDGET)
//         .to.changeTokenBalances(hlpToken, [hlpClaimPool, currentProject.claimPool], [`-${BUDGET}`, BUDGET]);

//       const provider = ethers.provider;
//       let claimPoolContract = new ethers.Contract(currentProject.claimPool, ClaimPoolJSON.abi, provider);
//       expect(await claimPoolContract.collectionClaimPool(genesis.address)).to.equal(BUDGET);
//     });
//   });

//   describe("setRewardAddress", () => {
//     let projectId1: number;

//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with caller is not owner", async () => {
//       await expect(project.connect(user1).setRewardAddress(ZERO_ADDRESS)).to.rejectedWith("Caller is not owner");
//     });

//     it("should revert with invalid address", async () => {
//       await expect(project.connect(owner).setRewardAddress(ZERO_ADDRESS)).to.rejectedWith("Invalid address");
//     });

//     it("should revert with rewardAddress already exists", async () => {
//       await expect(project.connect(owner).setRewardAddress(reward.address)).to.rejectedWith("RewardAddress already exists");
//     });

//     it("should setRewardAddress successfully", async () => {
//       const Admin: Admin__factory = await ethers.getContractFactory("Admin");
//       const admin: Admin = (await upgrades.deployProxy(Admin, [owner.address])) as Admin;
//       await admin.deployed();

//       const Reward: Reward__factory = await ethers.getContractFactory("Reward");
//       const newReward = (await upgrades.deployProxy(Reward, [admin.address])) as Reward;

//       await expect(project.connect(owner).setRewardAddress(newReward.address))
//         .to.emit(project, "SetRewardAddress")
//         .withArgs(reward.address, newReward.address);
//     });
//   });

//   describe("withdrawCollection", () => {
//     let projectId1: number;
//     const ETH_BUDGET = parseEther("100");
//     let newHLPeaceGenesisAngel1: HLPeaceGenesisAngel;
//     let newHLPeaceGenesisAngel2: HLPeaceGenesisAngel;

//     beforeEach(async () => {
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       newHLPeaceGenesisAngel1 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       newHLPeaceGenesisAngel2 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 5 * 1e3,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//         {
//           collectionAddress: newHLPeaceGenesisAngel1.address,
//           rewardPercent: 3 * 1e3,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//         {
//           collectionAddress: newHLPeaceGenesisAngel2.address,
//           rewardPercent: 2 * 1e3,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", AddressZero, ETH_BUDGET, collectionInfos, {
//         value: ETH_BUDGET,
//       });
//       projectId1 = (await project.getProjectCounter()).toNumber();
//     });

//     it("should revert with invalid projectId", async () => {
//       await expect(project.connect(user1).withdrawCollection(0, genesis.address, ETH_BUDGET)).to.be.revertedWith("Invalid projectId");
//       await expect(project.connect(user1).withdrawCollection(projectId1 + 1, genesis.address, ETH_BUDGET)).to.be.revertedWith("Invalid projectId");
//     });

//     it("should revert with caller is not project owner", async () => {
//       await expect(project.connect(user1).withdrawCollection(projectId1, genesis.address, ETH_BUDGET)).to.be.revertedWith("Caller is not project owner");
//     });

//     it("should revert with invalid address", async () => {
//       await expect(project.connect(projectOwner1).withdrawCollection(projectId1, ZERO_ADDRESS, ETH_BUDGET)).to.be.revertedWith("Invalid address");
//     });

//     it("should revert with invalid amount", async () => {
//       await expect(project.connect(projectOwner1).withdrawCollection(projectId1, genesis.address, 0)).to.be.revertedWith("Invalid amount");
//     });

//     it("should revert with invalid colletion address", async () => {
//       await expect(project.connect(projectOwner1).withdrawCollection(projectId1, user1.address, 1000)).to.be.revertedWith("Invalid collection address");
//     });

//     it("should revert with invalid amount because of not enough budget", async () => {
//       await expect(project.connect(projectOwner1).withdrawCollection(projectId1, genesis.address, ETH_BUDGET.add(1))).to.be.revertedWith("Invalid amount");
//     });

//     it("should revert with Amount exceeds balance", async () => {
//       const currentProject = await project.getProjectById(projectId1);
//       await expect(project.connect(projectOwner1).withdrawCollection(projectId1, genesis.address, ETH_BUDGET)).to.be.revertedWith("Amount exceeds balance");
//     });

//     it("should withdrawCollection succesfully", async () => {
//       const currentProject = await project.getProjectById(projectId1);
//       await expect(project.connect(projectOwner1).withdrawCollection(projectId1, genesis.address, ETH_BUDGET.div(4)))
//         .to.emit(project, "WithdrawnCollection")
//         .withArgs(projectId1, genesis.address, ETH_BUDGET.div(4))
//         .to.changeEtherBalances([currentProject.claimPool, projectOwner1.address], [`-${ETH_BUDGET.div(4)}`, ETH_BUDGET.div(4)]);

//       await expect(project.connect(projectOwner1).withdrawCollection(projectId1, newHLPeaceGenesisAngel1.address, ETH_BUDGET.div(5)))
//         .to.emit(project, "WithdrawnCollection")
//         .withArgs(projectId1, newHLPeaceGenesisAngel1.address, ETH_BUDGET.div(5))
//         .to.changeEtherBalances([currentProject.claimPool, projectOwner1.address], [`-${ETH_BUDGET.div(5)}`, ETH_BUDGET.div(5)]);
//     });
//   });

//   describe("isProjectActive", () => {
//     let projectId1: number;

//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, 0, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();
//     });

//     it("should isProjectActive return false", async () => {
//       await project.connect(projectOwner1).removeProject(projectId1);
//       expect(await project.isProjectActive(projectId1)).to.be.false;
//     });

//     it("should isProjectActive return true", async () => {
//       expect(await project.isProjectActive(projectId1)).to.be.true;
//     });
//   });

//   describe("View function", () => {
//     let projectId1: number;
//     const BUDGET = parseUnits("400", 18);

//     beforeEach(async () => {
//       const collectionInfos: CollectionInfoStruct[] = [
//         {
//           collectionAddress: genesis.address,
//           rewardPercent: 1e4,
//           rewardRarityPercents: [7208, 2520, 252, 18, 2],
//         },
//       ];

//       await project.connect(projectOwner1).createProject("97", hlpToken.address, BUDGET, collectionInfos);
//       projectId1 = (await project.getProjectCounter()).toNumber();
//     });

//     it("should getProjectCounter return projectId", async () => {
//       expect(await project.getProjectCounter()).to.equal(projectId1);
//     });

//     it("should getProjectById successfully", async () => {
//       const currentProject = await project.getProjectById(projectId1);
//       expect(currentProject.projectId).to.equal(projectId1);
//       expect(currentProject.paymentToken).to.equal(hlpToken.address);
//       expect(currentProject.projectOwner).to.equal(projectOwner1.address);
//       expect(currentProject.budget).to.equal(BUDGET);
//       expect(currentProject.status).to.be.true;
//       expect(currentProject.claimPool).not.equal(AddressZero);
//     });

//     it("should getLengthCollectionByProjectId successfully", async () => {
//       expect(await project.getLengthCollectionByProjectId(projectId1)).to.equal(1);
//     });

//     it("should getCollectionByIndex successfully", async () => {
//       expect(await project.getCollectionByIndex(projectId1, 0)).to.equal(genesis.address);
//     });

//     it("should getPaymentTokenOf successfully", async () => {
//       expect(await project.getPaymentTokenOf(genesis.address)).to.equal(hlpToken.address);
//     });

//     it("should getClaimPoolOf successfully", async () => {
//       const currentProject = await project.getProjectById(projectId1);
//       expect(await project.getClaimPoolOf(genesis.address)).to.equal(currentProject.claimPool);
//     });

//     it("should isCollectionActive return false/true", async () => {
//       expect(await project.isCollectionActive(ZERO_ADDRESS)).to.be.false;
//       expect(await project.isCollectionActive(genesis.address)).to.be.true;
//     });

//     it("should getAllCollection successfully", async () => {
//       expect((await project.getAllCollection(projectId1)).length).to.equal(1);
//     });

//     it("should getRewardRarityPercents successfully", async () => {
//       // [7208, 2520, 252, 18, 2]
//       const inputRariryPercents = [7208, 2520, 252, 18, 2];
//       const rarityPercents = await project.getRewardRarityPercents(projectId1, genesis.address);
//       expect(rarityPercents[0]).to.equal(inputRariryPercents[0]);
//       expect(rarityPercents[1]).to.equal(inputRariryPercents[1]);
//       expect(rarityPercents[2]).to.equal(inputRariryPercents[2]);
//       expect(rarityPercents[3]).to.equal(inputRariryPercents[3]);
//     })

//     it("should getProjectOwnerOf successful", async () => {
//       let projectOwner = await project.getProjectOwnerOf(genesis.address);
//       expect(projectOwner).to.equal(projectOwner1.address);

//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       const genesis2 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;
//       projectOwner = await project.getProjectOwnerOf(genesis2.address);
//       expect(projectOwner).to.equal(ZERO_ADDRESS);
//     });

//     it("should getRewardOf successful", async () => {
//       const HLPeaceGenesisAngel: HLPeaceGenesisAngel__factory = await ethers.getContractFactory("HLPeaceGenesisAngel");
//       const genesis2 = (await HLPeaceGenesisAngel.deploy(owner.address, owner.address,  "HLPeaceGenesisAngel NFT", "NFT", "BASE_URI", "abc", treasury.address, FEE_NUMERATOR, 5000, METADATA)) as HLPeaceGenesisAngel;

//       let reward = await project.getRewardOf(genesis2.address);
//       expect(reward).to.equal(0);

//       reward = await project.getRewardOf(genesis.address)
//       expect(reward).to.equal(BUDGET);

//       await project.connect(projectOwner1).removeProject(projectId1);
//       reward = await project.getRewardOf(genesis.address)
//       expect(reward).to.equal(0);
//     });

//   });
// });
