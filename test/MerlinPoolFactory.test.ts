import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { upgrades, ethers } from "hardhat";
import { ZERO_ADDRESS as AddressZero, MAX_UINT256 as MaxUint256, BN, ZERO_ADDRESS, getTimestamp } from "./utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import ArthurFactoryJson from "./abi/ArthurFactory.json";
import ArthurRouterJson from "./abi/ArthurRouter.json";
import WETH9Json from "./abi/WETH9.json";
import ERC20Json from "./abi/ERC20.json";
import {
    ArthurMaster__factory,
    ArthurMaster,
    MerlinPoolFactory__factory,
    MerlinPoolFactory,
    NFTPoolFactory__factory,
    NFTPoolFactory,
    YieldBooster__factory,
    YieldBooster,
    ArtToken__factory,
    ArtToken,
    XArtToken__factory,
    XArtToken,
    PositionHelper__factory,
    PositionHelper,
} from "../typechain-types";
import bigDecimal from "js-big-decimal";
import { BigNumber } from "ethers";

// signer variables
let owner: SignerWithAddress;
let admin1: SignerWithAddress;
let admin2: SignerWithAddress;
let user1: SignerWithAddress;
let accounts: SignerWithAddress[];

// contract instance
let positionHelper: PositionHelper;
let tokenA: any;
let tokenB: any;
let arthurFactory: any;
let weth9: any;
let arthurRouter: any;
let nftPoolFactory: NFTPoolFactory;

const ONE_DAY = 1 * 24 * 60 * 60;
const ONE_ETHER = ethers.utils.parseEther('1');
const ETHER_100M = ethers.utils.parseEther('100000000');
const ETHER_100K = ethers.utils.parseEther('100000');

const MAX_UINT256 = ethers.constants.MaxUint256;

describe("MerlinPoolFactory", () => {
    beforeEach(async () => {
        [owner, admin1, admin2, user1, ...accounts] = await ethers.getSigners();

        const ArthurMaster: ArthurMaster__factory = await ethers.getContractFactory("ArthurMaster");
        const ArtToken: ArtToken__factory = await ethers.getContractFactory("ArtToken");
        const XArtToken: XArtToken__factory = await ethers.getContractFactory("XArtToken");
        const NFTPoolFactory: NFTPoolFactory__factory = await ethers.getContractFactory("NFTPoolFactory");

        const ArthurFactory = new ethers.ContractFactory(ArthurFactoryJson.abi, ArthurFactoryJson.bytecode, owner);
        const ArthurRouter = new ethers.ContractFactory(ArthurRouterJson.abi, ArthurRouterJson.bytecode, owner);
        const WETH9 = new ethers.ContractFactory(WETH9Json.abi, WETH9Json.bytecode, owner);
        const ERC20 = new ethers.ContractFactory(ERC20Json.abi, ERC20Json.bytecode, owner);

        tokenA = await ERC20.deploy(ETHER_100M);
        await tokenA.deployed();

        tokenB = await ERC20.deploy(ETHER_100M);
        await tokenB.deployed();

        arthurFactory = await ArthurFactory.deploy(owner.address);
        await arthurFactory.deployed();

        weth9 = await WETH9.deploy();
        await weth9.deployed();

        arthurRouter = await ArthurRouter.deploy(arthurFactory.address, weth9.address);
        await arthurRouter.deployed();

        const PositionHelper: PositionHelper__factory = await ethers.getContractFactory("PositionHelper");
        positionHelper = (await PositionHelper.deploy(arthurRouter.address, weth9.address)) as PositionHelper;

        await tokenA.approve(arthurRouter.address, ETHER_100M);
        await tokenB.approve(arthurRouter.address, ETHER_100M);

        await tokenA.approve(positionHelper.address, ETHER_100M);
        await tokenB.approve(positionHelper.address, ETHER_100M);

        //=======================================================
        const currentTimestamp = await getTimestamp();
        const artToken = await ArtToken.deploy(parseEther("10000000"), parseEther("7250000"), "178240740740741", accounts[0].address) as ArtToken;
        await artToken.deployed();

        const xArtToken = await XArtToken.deploy(artToken.address) as XArtToken;
        await xArtToken.deployed();

        const arthurMaster = await ArthurMaster.deploy(artToken.address, currentTimestamp + ONE_DAY) as ArthurMaster;
        await arthurMaster.deployed();

        nftPoolFactory = await NFTPoolFactory.deploy(arthurMaster.address, artToken.address, xArtToken.address) as NFTPoolFactory;
        await nftPoolFactory.deployed();
    });

    describe("addLiquidityAndCreatePosition", () => {
        it('should return successfully', async () => {
            const currentTimestamp = await getTimestamp();
            await arthurFactory.createPair(tokenA.address, tokenB.address, currentTimestamp + ONE_DAY);
            const lp = await arthurRouter.getPair(tokenA.address, tokenB.address);
            await nftPoolFactory.createPool(lp);
            const nftPool = await nftPoolFactory.getPool(lp);
            await positionHelper.addLiquidityAndCreatePosition(tokenA.address, tokenB.address, ETHER_100K, ETHER_100K.div(2),
                ETHER_100K, ETHER_100K.div(2), currentTimestamp + ONE_DAY, owner.address, nftPool, ONE_DAY * 183, currentTimestamp + ONE_DAY);
        });
    });
});
