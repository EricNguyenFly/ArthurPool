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
	PositionHelper
} from "../typechain-types";

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

	//* Deploy contracts */
	console.log("================================================================================");
	console.log("DEPLOYING CONTRACTS");
	console.log("================================================================================");

	const startTime = 0;
	const arthurRouter = "";
	const weth = "";
	const grailToken = "";
	const xGrailToken = "";

	const arthurMaster = await ArthurMaster.deploy(grailToken, startTime) as ArthurMaster;
	await arthurMaster.deployed();
	console.log("ArthurMaster                          deployed to:>>", arthurMaster.address);

	const merlinPoolFactory = await MerlinPoolFactory.deploy(grailToken, xGrailToken, accounts[0].address, accounts[0].address) as MerlinPoolFactory;
	await merlinPoolFactory.deployed();
	console.log("MerlinPoolFactory                          deployed to:>>", merlinPoolFactory.address);

	const nftPoolFactory = await NFTPoolFactory.deploy(arthurMaster.address, grailToken, xGrailToken) as NFTPoolFactory;
	await nftPoolFactory.deployed();
	console.log("NFTPoolFactory                          deployed to:>>", nftPoolFactory.address);

	const yieldBooster = await YieldBooster.deploy(xGrailToken) as YieldBooster;
	await yieldBooster.deployed();
	console.log("YieldBooster                          deployed to:>>", yieldBooster.address);

	const positionHelper = await PositionHelper.deploy(arthurRouter, weth) as PositionHelper;
	await positionHelper.deployed();
	console.log("PositionHelper                          deployed to:>>", positionHelper.address);

	console.log("================================================================================");
	console.log("DONE");
	console.log("================================================================================");

	const contracts = {
		arthurMaster: arthurMaster.address,
		merlinPoolFactory: merlinPoolFactory.address,
		nftPoolFactory: nftPoolFactory.address,
		yieldBooster: yieldBooster.address,
		positionHelper: positionHelper.address
	};

	await fs.writeFileSync("contracts.json", JSON.stringify(contracts));

	const contractVerify = {
		arthurMaster: arthurMaster.address,
		merlinPoolFactory: merlinPoolFactory.address,
		nftPoolFactory: nftPoolFactory.address,
		yieldBooster: yieldBooster.address,
		positionHelper: positionHelper.address
	};

	await fs.writeFileSync("contracts-verify.json", JSON.stringify(contractVerify));

	await hre
		.run("verify:verify", {
			address: arthurMaster.address,
			constructorArguments: [grailToken, startTime]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: merlinPoolFactory.address,
			constructorArguments: [grailToken, xGrailToken, accounts[0].address, accounts[0].address]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: nftPoolFactory.address,
			constructorArguments: [arthurMaster.address, grailToken, xGrailToken]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: yieldBooster.address,
			constructorArguments: [xGrailToken]
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
