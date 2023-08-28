import hre from "hardhat";
import fs from "fs";
import {
	ArthurMaster__factory,
	ArthurMaster,
	MerlinPoolFactory__factory,
	MerlinPoolFactory,
	NFTPoolFactory__factory,
	NFTPoolFactory,
	YieldBooster__factory,
	YieldBooster,
	PositionHelper__factory,
	PositionHelper,
	GrailTokenV2__factory,
	GrailTokenV2,
	XGrailToken__factory,
	XGrailToken
} from "../typechain-types";
import { parseEther } from "ethers/lib/utils";

async function main() {
	//* Loading accounts */
	const accounts = await hre.ethers.getSigners();

	console.log('=====================================================================================');
	console.log('ACCOUNTS:');
	console.log('=====================================================================================');
	for (let i = 0; i < accounts.length; i++) {
		const account = accounts[i];
		console.log(` Account ${i}: ${account.address}`);
	}

	//* Loading contract factory */
	const ArthurMaster: ArthurMaster__factory = await hre.ethers.getContractFactory("ArthurMaster");
	const MerlinPoolFactory: MerlinPoolFactory__factory = await hre.ethers.getContractFactory("MerlinPoolFactory");
	const NFTPoolFactory: NFTPoolFactory__factory = await hre.ethers.getContractFactory("NFTPoolFactory");
	const YieldBooster: YieldBooster__factory = await hre.ethers.getContractFactory("YieldBooster");
	const PositionHelper: PositionHelper__factory = await hre.ethers.getContractFactory("PositionHelper");
	const GrailTokenV2: GrailTokenV2__factory = await hre.ethers.getContractFactory("GrailTokenV2");
	const XGrailToken: XGrailToken__factory = await hre.ethers.getContractFactory("XGrailToken");

	//* Deploy contracts */
	console.log("================================================================================");
	console.log("DEPLOYING CONTRACTS");
	console.log("================================================================================");

	const startTime = "1693202400";
	// mumbai
	const arthurRouter = "0x764EcF27DF3df771D1c79f48A05aB18d2b6BBa10";
	const weth = "0xc82f14458f68f076A4f2E756dB24B56A3C670bB4";
	// const grailToken = "";
	// const xGrailToken = "";

	const grailToken = await GrailTokenV2.deploy(parseEther("100000"), parseEther("72500"), "178240740740741", accounts[0].address) as GrailTokenV2;
	await grailToken.deployed();
	console.log("GrailTokenV2                          deployed to:>>", grailToken.address);

	const xGrailToken = await XGrailToken.deploy(grailToken.address) as XGrailToken;
	await xGrailToken.deployed();
	console.log("XGrailToken                          deployed to:>>", xGrailToken.address);

	const arthurMaster = await ArthurMaster.deploy(grailToken.address, startTime) as ArthurMaster;
	await arthurMaster.deployed();
	console.log("ArthurMaster                          deployed to:>>", arthurMaster.address);

	const merlinPoolFactory = await MerlinPoolFactory.deploy(grailToken.address, xGrailToken.address, accounts[0].address, accounts[0].address) as MerlinPoolFactory;
	await merlinPoolFactory.deployed();
	console.log("MerlinPoolFactory                          deployed to:>>", merlinPoolFactory.address);

	const nftPoolFactory = await NFTPoolFactory.deploy(arthurMaster.address, grailToken.address, xGrailToken.address) as NFTPoolFactory;
	await nftPoolFactory.deployed();
	console.log("NFTPoolFactory                          deployed to:>>", nftPoolFactory.address);

	const yieldBooster = await YieldBooster.deploy(xGrailToken.address) as YieldBooster;
	await yieldBooster.deployed();
	console.log("YieldBooster                          deployed to:>>", yieldBooster.address);

	const positionHelper = await PositionHelper.deploy(arthurRouter, weth) as PositionHelper;
	await positionHelper.deployed();
	console.log("PositionHelper                          deployed to:>>", positionHelper.address);

	await grailToken.updateAllocations("68", "4");
	await grailToken.initializeEmissionStart("1693198800");
	await grailToken.initializeMasterAddress(arthurMaster.address);

	console.log("================================================================================");
	console.log("DONE");
	console.log("================================================================================");

	const contracts = {
		grailToken: grailToken.address,
		xGrailToken: xGrailToken.address,
		arthurMaster: arthurMaster.address,
		merlinPoolFactory: merlinPoolFactory.address,
		nftPoolFactory: nftPoolFactory.address,
		yieldBooster: yieldBooster.address,
		positionHelper: positionHelper.address
	};

	await fs.writeFileSync("contracts.json", JSON.stringify(contracts));

	const contractVerify = {
		grailToken: grailToken.address,
		xGrailToken: xGrailToken.address,
		arthurMaster: arthurMaster.address,
		merlinPoolFactory: merlinPoolFactory.address,
		nftPoolFactory: nftPoolFactory.address,
		yieldBooster: yieldBooster.address,
		positionHelper: positionHelper.address
	};

	await fs.writeFileSync("contracts-verify.json", JSON.stringify(contractVerify));

	await hre
		.run("verify:verify", {
			address: grailToken.address,
			constructorArguments: [parseEther("100000"), parseEther("72500"), "178240740740741", accounts[0].address]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: xGrailToken.address,
			constructorArguments: [grailToken.address]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: arthurMaster.address,
			constructorArguments: [grailToken.address, startTime]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: merlinPoolFactory.address,
			constructorArguments: [grailToken.address, xGrailToken.address, accounts[0].address, accounts[0].address]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: nftPoolFactory.address,
			constructorArguments: [arthurMaster.address, grailToken.address, xGrailToken.address]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: yieldBooster.address,
			constructorArguments: [xGrailToken.address]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: positionHelper.address,
			constructorArguments: [arthurRouter, weth]
		})
		.catch(console.log);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
