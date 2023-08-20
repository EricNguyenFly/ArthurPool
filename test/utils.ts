import { Block } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { ethers } from "hardhat";

export const { provider } = ethers;
export const { AddressZero: ZERO_ADDRESS, MaxUint256: MAX_UINT256 } =
  ethers.constants;
export const { solidityKeccak256 } = ethers.utils;
export const { getBlock } = provider;

export type BN = BigNumber;

export function BN(value: string | number): BN {
  return BigNumber.from(value.toString());
}

//---------------------Chain Parameters----------------------------------

export async function getTimestamp(): Promise<number> {
  const latestBlock = await getBlock("latest");
  return latestBlock.timestamp;
}

export async function getBlockNumber(): Promise<number> {
  const latestBlock = await getBlock("latest");
  return latestBlock.number;
}

export async function skipBlock(blockNumber: number) {
  for (let index = 0; index < blockNumber; index++) {
    await ethers.provider.send("evm_mine", []);
  }
}

export async function skipTime(seconds: number) {
  await provider.send("evm_increaseTime", [seconds]);
  await provider.send("evm_mine", []);
}

export async function setTime(time: number) {
  await provider.send("evm_setNextBlockTimestamp", [time]);
  await provider.send("evm_mine", []);
}

//---------------------Balance Helper Function---------------------------

export async function getBalance(
  address: string,
  tokenAddress: string = ZERO_ADDRESS
): Promise<BN> {
  if (tokenAddress === ZERO_ADDRESS) return provider.getBalance(address);
  else
    return (await ethers.getContractFactory("ERC20"))
      .attach(tokenAddress)
      .balanceOf(address);
}

export interface TransactionReceiptWithFee extends ContractReceipt {
  fee: BN;
  error?: any;
}

export async function getTxInfo(
  transaction: Promise<ContractTransaction>
): Promise<TransactionReceiptWithFee> {
  try {
    const transactionResponse: ContractTransaction = await transaction;
    const transactionReceipt: ContractReceipt =
      await transactionResponse.wait();
    const gasUsed: BN = transactionReceipt.gasUsed;
    return {
      ...transactionReceipt,
      fee: gasUsed.mul(transactionReceipt.effectiveGasPrice),
    };
  } catch (error) {
    if (!(error as any).transactionHash) throw error;

    const transactionReceipt = await ethers.provider.getTransactionReceipt(
      (error as ContractReceipt).transactionHash
    );
    const gasUsed = transactionReceipt.gasUsed;

    return {
      error,
      ...transactionReceipt,
      fee: gasUsed.mul(transactionReceipt.effectiveGasPrice),
    };
  }
}

export async function updateTxInfo(
  transaction: Promise<ContractTransaction>,
  onUpdate: (txInfo: TransactionReceiptWithFee) => any
): Promise<ContractTransaction> {
  const txInfo: TransactionReceiptWithFee = await getTxInfo(transaction);
  await onUpdate(txInfo);
  return transaction;
}

export type BalanceSnapshot = Record<string, BN>;
export type BalanceSnapshotDiff = {
  balanceBefore: BN;
  balanceAfter: BN;
  delta: BN;
};

export class BalanceTracker {
  static instances: Record<string, BalanceTracker> = {};

  wallet: string = ZERO_ADDRESS;
  coins: string[] = [ZERO_ADDRESS];
  totalFee: BN = BN(0);
  snapshots: Record<string, BalanceSnapshot> = {};

  static async updateFee(transaction: Promise<ContractTransaction>) {
    const { from, fee } = await getTxInfo(transaction);

    const instance = BalanceTracker.instances[from];
    instance.totalFee = instance.totalFee.add(fee);

    return transaction;
  }

  static expect(
    transaction:
      | Promise<ContractTransaction>
      | (() => Promise<ContractTransaction>)
  ): Chai.Assertion {
    if (typeof transaction == "function")
      return expect(() => BalanceTracker.updateFee(transaction()));
    else return expect(BalanceTracker.updateFee(transaction));
  }

  constructor(wallet: string, tokens: string[] = []) {
    this.wallet = wallet;
    this.coins = [...this.coins, ...tokens];

    BalanceTracker.instances[wallet] = this;
  }

  addToken(address: string): void {
    this.coins = [...this.coins, address];
  }

  async takeSnapshot(name: string): Promise<Record<string, BalanceSnapshot>> {
    const snapshot: BalanceSnapshot = {};
    for (let coinId in this.coins) {
      const coin = this.coins[coinId]!;
      snapshot[coin] = await getBalance(this.wallet, coin);
    }

    this.snapshots[name] = snapshot;
    return this.snapshots;
  }

  diff(
    snapshotNameA: string,
    snapshotNameB: string
  ): Record<string, BalanceSnapshotDiff> {
    if (!(this.snapshots[snapshotNameA] && this.snapshots[snapshotNameB]))
      throw new Error("Snapshot is not found");

    const result: Record<string, BalanceSnapshotDiff> = {};

    const snapshot1 = this.snapshots[snapshotNameA];
    const snapshot2 = this.snapshots[snapshotNameB];

    for (let coinId in this.coins) {
      const coin = this.coins[coinId];
      const balanceBefore = snapshot1[coin];
      const balanceAfter = snapshot2[coin];

      result[coin] = {
        balanceBefore,
        balanceAfter,
        delta: balanceAfter.sub(balanceBefore),
      };
    }

    return result;
  }

  reset(): void {
    this.totalFee = BN(0);
    this.snapshots = {};
  }
}

export async function signatureData(
  taskId: number,
  users: string[],
  rewards: any[],
  nonce: number,
  privateKey: string
) {
  const { chainId } = await ethers.provider.getNetwork();
  // 66 byte string, which represents 32 bytes of data
  let messageHash = encodeData(
    chainId,
    taskId,
    users,
    rewards,
    nonce
  );

  // 32 bytes of data in Uint8Array
  let messageHashBinary = ethers.utils.arrayify(messageHash);

  // let wallet = new ethers.Wallet(
  //   "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  // );
  let wallet = new ethers.Wallet(privateKey);

  // To sign the 32 bytes of data, make sure you pass in the data
  const signature = await wallet.signMessage(messageHashBinary);
  return signature;
}

function encodeData(
  chainId: number,
  taskId: number,
  users: string[],
  rewards: any[],
  nonce: number
) {
  const payload = ethers.utils.defaultAbiCoder.encode(
    [
      "uint256",
      "uint256",
      "address[]",
      "uint256[]",
      "uint256"
    ],
    [
      chainId,
      taskId,
      users,
      rewards,
      nonce
    ]
  );
  return ethers.utils.keccak256(payload);
}