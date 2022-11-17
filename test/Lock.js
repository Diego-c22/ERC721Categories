const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

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
  "10",
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
  1500, 1250, 1000, 750, 500, 250, 100, 4725, 2698, 1260, 720, 396, 150, 46, 2,
];
const args = [
  categories,
  limits,
  pricesPreSale.map((p) => hre.ethers.utils.parseEther(p)),
  pricesPublicSale.map((p) => hre.ethers.utils.parseEther(p)),
  "https://ipfs.io/ipfs/QmPKWxB5fhj4XS3P3joV9EFCL8CybrKpLFaQE8n7R7vwqY/",
];

describe("ERC721 Categories", () => {
  const deployContractFixture = async () => {
    const [wallet, walletTo] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ERC721Categories");
    const contract = await upgrades.deployProxy(Contract, args, {
      initializer: "initialize",
    });
    await contract.deployed();
    return { contract, wallet, walletTo };
  };

  describe("Test categories limits", () => {
    it("Should revert when up category limit is passed", async () => {
      const { contract, wallet, walletTo } = await loadFixture(
        deployContractFixture
      );

      await Promise.all(
        [...Array(amounts[0])].map(async () =>
          contract.mint(0, {
            value: ethers.utils.parseEther(pricesPreSale[0]),
          })
        )
      );

      await contract.setReveled(true);

      x = await contract.getTokensOfAddress(wallet.address, 0);
      console.log(x);

      await Promise.all(
        [...Array(amounts[14])].map(async () =>
          contract.mint(14, {
            value: ethers.utils.parseEther(pricesPreSale[14]),
          })
        )
      );

      await expect(
        contract.mint(14, { value: ethers.utils.parseEther(pricesPreSale[14]) })
      ).to.be.revertedWith("ERC721: Category sold out");
    });
  });
});
