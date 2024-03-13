import {
  ARB_SEPOLIA_TESTNET_RPC,
  DKG_CONTRACT_ADDRESS,
  MULTICALL3_ADDRESS,
} from "../constants";
import { ethers } from "ethers";
const snarkjs = require("snarkjs");

import Blender from "../SDK/index";

const blenderHelper = new Blender.BlenderHelper(
  ARB_SEPOLIA_TESTNET_RPC,
  DKG_CONTRACT_ADDRESS,
  MULTICALL3_ADDRESS
);

export const useGetNullifier = () => {
  return blenderHelper.GenerateNullifier();
};

export const getDepositParams = async (nullifier, v) => {
  return blenderHelper.Deposit(nullifier, v);
};

export const useGenerateWithdrawParams = async (
  nullifier: bigint, // private nullifier
  recipient: string, // recipient address
  relayer: string, // relayer address , receive fee
  v: bigint[], // private array
  indexAmount: bigint, // index of element in v
  feePercent: bigint // % fee
) => {
  return blenderHelper.Withdraw(
    nullifier,
    recipient,
    relayer,
    v,
    indexAmount,
    feePercent
  );
};

export const useGenerateSwapParams = async (
  nullifier: bigint, // private nullifier
  recipient: string, // recipient address
  relayer: string, // relayer address , receive fee
  v: bigint[], // private array
  indexAmount: bigint, // index of element in v
  feePercent: bigint, // % fee
  tokenOut: string, // token out address
  amountOutMin: bigint // min amount token out
) => {
  return await blenderHelper.Swap(
    nullifier,
    recipient,
    relayer,
    v,
    indexAmount,
    feePercent,
    tokenOut,
    amountOutMin
  );
};

export const useGenerateWithdrawParamsHuhu = async (
  nullifier: bigint, // private nullifier
  recipient: string, // recipient address
  relayer: string, // relayer address , receive fee
  v: bigint[], // private array
  indexAmount: bigint, // index of element in v
  feePercent: bigint // % fee
) => {
  return blenderHelper.Withdraw(
    nullifier,
    recipient,
    relayer,
    v,
    indexAmount,
    feePercent
  );
};

export const toAddress = async (num) => {
  const hex = ethers.BigNumber.from(num).toHexString();
  const paddedHex = hex.padStart(40, "0");

  return paddedHex;
};
