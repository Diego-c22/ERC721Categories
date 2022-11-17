// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const argsPath = path.join(path.resolve("./"), "arguments");

async function main() {
  const categories = [
    "Canvas Bronze",
    "Canvas Silver",
    "Canvas Gold",
    "Canvas Platinum",
    "Canvas Diamond",
    "Canvas Asteroid",
    "Canvas Meteor",
    "Point Pangs Bronze",
    "Point Pangs Silver",
    "Point Pangs Gold",
    "Point Pangs Platinum",
    "Point Pangs Diamond",
    "Point Pangs Asteroid",
    "Point Pangs Meteor",
    "Point Pangs Galaxy",
  ];

  const limits = [
    [1, 1500],
    [1501, 2750],
    [2751, 3750],
    [3751, 4500],
    [4501, 5000],
    [5001, 5250],
    [5251, 5350],

    [5351, 10075],
    [10076, 12673],
    [12674, 14033],
    [14034, 14753],
    [14754, 15149],
    [15150, 15299],
    [15300, 15345],
    [15346, 15347],
  ];
  const pricesPreSale = [
    "0.05",
    "0.1",
    "0.2",
    "0.3",
    "0.5",
    "1",
    "2",
    "0.1",
    "0.2",
    "0.4",
    "0.6",
    "1",
    "3",
    "5",
    "10000",
  ];
  const pricesPublicSale = [
    "0.05",
    "0.1",
    "0.2",
    "0.3",
    "0.5",
    "1",
    "2",
    "0.25",
    "0.50",
    "0.75",
    "1",
    "2",
    "3",
    "5",
    "10000",
  ];
  const amounts = [
    1500, 1250, 1000, 750, 500, 250, 100, 4725, 2698, 1260, 720, 396, 150, 46,
    2,
  ];
  const args = [
    categories,
    limits,
    pricesPreSale.map((p) => hre.ethers.utils.parseEther(p)),
    pricesPublicSale.map((p) => hre.ethers.utils.parseEther(p)),
    "https://ipfs.io/ipfs/QmPKWxB5fhj4XS3P3joV9EFCL8CybrKpLFaQE8n7R7vwqY/",
  ];
  const Contract = await hre.ethers.getContractFactory("ERC721Categories");
  const lock = await hre.upgrades.deployProxy(Contract, args, {
    initializer: "initialize",
  });

  await lock.deployed();
  console.log(`Deployed to ${lock.address}`);
  saveArguments(args);
}

const saveArguments = (args, subfx) => {
  const pathFile = path.join(
    argsPath,
    subfx ? `${subfx}.js` : path.basename(__filename)
  );
  const data = `module.exports = ${JSON.stringify(args)}`;
  fs.writeFileSync(pathFile, data);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
