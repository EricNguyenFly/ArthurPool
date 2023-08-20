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

  // await hre
  //     .run("verify:verify", {
  //       address: "0x68b829085DD6B218523C38A387E93AC96e5951C3"
  //     })
  //     .catch(console.log);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
