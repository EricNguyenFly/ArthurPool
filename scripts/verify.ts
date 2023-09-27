import hre from "hardhat";
import { parseEther } from "ethers/lib/utils";
import contracts from "../contracts-verify.json";

const ONE_DAY = 24 * 60 * 60;

async function main() {
  // Verify contracts
  console.log(
    "========================================================================================="
  );
  console.log("VERIFY CONTRACTS");
  console.log(
    "========================================================================================="
  );

  const arthurRouter = "0x01fEfccfF0b9E9F834B6436135cDc14FCf1f5D04";
  const weth = "0xbe2C5113EebFe4C083da31346534CEA1cd2bBC46";

  await hre
    .run("verify:verify", {
      address: contracts.artToken,
      constructorArguments: [parseEther("10000000"), parseEther("7250000"), "178240740740741", "0xfB2b22611F716996281FB1CBA70411848DD2d864"]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.xArtToken,
      constructorArguments: [contracts.artToken]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.dividendsV2,
      constructorArguments: [contracts.artToken, contracts.startTime]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.launchpad,
      constructorArguments: [contracts.artToken]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.arthurMaster,
      constructorArguments: [contracts.artToken, contracts.startTime]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.merlinPoolFactory,
      constructorArguments: [contracts.artToken, contracts.xArtToken, "0xfB2b22611F716996281FB1CBA70411848DD2d864", "0xfB2b22611F716996281FB1CBA70411848DD2d864"]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.nftPoolFactory,
      constructorArguments: [contracts.arthurMaster, contracts.artToken, contracts.xArtToken]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.yieldBooster,
      constructorArguments: [contracts.xArtToken]
    })
    .catch(console.log);

  await hre
    .run("verify:verify", {
      address: contracts.positionHelper,
      constructorArguments: [arthurRouter, weth]
    })
    .catch(console.log);

  // await hre
  //   .run("verify:verify", {
  //     address: contracts.arthurMaster,
  //     constructorArguments: [contracts.artToken, "1693202400"]
  //   })
  //   .catch(console.log);

  // await hre
  // .run("verify:verify", {
  //   address: "0x09Dc09A1a3ccc1B25db47c3b17a6C841Ba167367",
  // })
  // .catch(console.log);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
