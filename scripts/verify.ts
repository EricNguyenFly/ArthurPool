import hre from "hardhat";
import contracts from "../contracts-verify.json";

async function main() {
  // Verify contracts
  console.log(
    "========================================================================================="
  );
  console.log("VERIFY CONTRACTS");
  console.log(
    "========================================================================================="
  );

  await hre
    .run("verify:verify", {
      address: contracts.arthurMaster,
      constructorArguments: [contracts.artToken, "1693202400"]
    })
    .catch(console.log);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
