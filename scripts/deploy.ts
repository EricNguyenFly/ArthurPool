import hre from "hardhat";
import fs from "fs";
import {
	ArthurMaster__factory,
	ArthurMaster,
	MerlinPoolFactory__factory,
	MerlinPoolFactory,
	NFTPoolFactory__factory,
	NFTPoolFactory,
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

	//* Deploy contracts */
	console.log("================================================================================");
	console.log("DEPLOYING CONTRACTS");
	console.log("================================================================================");

	const arthurMaster = await ArthurMaster.deploy("", "") as ArthurMaster;
	await arthurMaster.deployed();
	console.log("ArthurMaster                          deployed to:>>", arthurMaster.address);

	const merlinPoolFactory = await MerlinPoolFactory.deploy("", "", "", "") as MerlinPoolFactory;
	await merlinPoolFactory.deployed();
	console.log("MerlinPoolFactory                          deployed to:>>", merlinPoolFactory.address);

	const nftPoolFactory = await NFTPoolFactory.deploy(arthurMaster.address, "", "") as NFTPoolFactory;
	await nftPoolFactory.deployed();
	console.log("NFTPoolFactory                          deployed to:>>", nftPoolFactory.address);

	console.log("================================================================================");
	console.log("DONE");
	console.log("================================================================================");

	const contracts = {
		arthurMaster: arthurMaster.address,
		merlinPoolFactory: merlinPoolFactory.address,
		nftPoolFactory: nftPoolFactory.address
	};

	await fs.writeFileSync("contracts.json", JSON.stringify(contracts));

	const contractVerify = {
		arthurMaster: arthurMaster.address,
		merlinPoolFactory: merlinPoolFactory.address,
		nftPoolFactory: nftPoolFactory.address
	};

	await fs.writeFileSync("contracts-verify.json", JSON.stringify(contractVerify));

	await hre
		.run("verify:verify", {
			address: arthurMaster.address,
			constructorArguments: ["", ""]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: merlinPoolFactory.address,
			constructorArguments: ["", "", "", ""]
		})
		.catch(console.log);

	await hre
		.run("verify:verify", {
			address: nftPoolFactory.address,
			constructorArguments: [arthurMaster.address, "", ""]
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
