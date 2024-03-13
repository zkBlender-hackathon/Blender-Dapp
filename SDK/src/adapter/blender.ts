import { abi as DKGABI } from "./abis/dkg.json";
import { ethers, Contract } from "ethers";
import axios from "axios";
import { poseidon } from "circomlibjs";
import {
  DepositRandomCommitment,
  RandomNullifier,
  GenerateFromNullifierPk,
} from "../dkgCore/index";
import {
  TMixerDeposit,
  TBabyJubPoint,
  TWithdraw,
  TRandomNullifier,
} from "../types/dkgTypes";
import { babyJub } from "circomlib";
import tree from "../tree/merkle";
import config from "../config";

import {
  CaculatePoseidonHash,
  CaculateLeafHash,
  CaculateNullifierHash,
  CaculateLead,
} from "../tree/treeHelper";
import { Multicall } from "ethereum-multicall";

export class BlenderHelper {
  provider: ethers.JsonRpcProvider;
  DKGContract: Contract;
  dkgContractAddress: string;
  multicall: Multicall;

  constructor(
    rpcUrl: string,
    dkgContractAddress: string,
    multicallCustomAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.DKGContract = new Contract(
      dkgContractAddress,
      DKGABI,
      new ethers.JsonRpcProvider(rpcUrl)
    );
    this.dkgContractAddress = dkgContractAddress;

    this.multicall = new Multicall({
      nodeUrl: rpcUrl,
      tryAggregate: true,
      multicallCustomContractAddress: multicallCustomAddress,
    });
  }

  async GenerateNullifier(): Promise<TRandomNullifier> {
    try {
      const nullifier = await RandomNullifier();

      if (nullifier === 0n) {
        return {
          randomNullifier: 0n,
          errorRN: true,
        };
      }

      return {
        randomNullifier: nullifier,
        errorRN: false,
      };
    } catch (e) {
      return {
        randomNullifier: 0n,
        errorRN: true,
      };
    }
  }

  Deposit = async (
    nullifier: bigint, // private nullifier
    v: bigint[] // private array
  ): Promise<TMixerDeposit> => {
    try {
      const { pk, errorPk } = await GenerateFromNullifierPk(nullifier);
      if (errorPk) {
        return {
          params: "",
          error: true,
        };
      }

      const amountTotal = v.reduce((a, b) => a + b);

      const commitment = poseidon([nullifier, ...v]);

      let depositParams: any = [];

      depositParams.push(commitment);
      depositParams.push(pk);
      depositParams.push(amountTotal);

      return {
        params: depositParams,
        error: false,
      };
    } catch (e) {
      return {
        params: "",
        error: true,
      };
    }
  };

  async Withdraw(
    nullifier: bigint, // private nullifier
    recipient: string, // recipient address
    relayer: string, // relayer address , receive fee
    v: bigint[], // private array
    indexAmount: bigint, // index of element in v
    feePercent: bigint // % fee
  ): Promise<TWithdraw> {
    try {
      const amount = v[Number(indexAmount.toString())];
      const fee = (feePercent * amount) / 100n;

      //  get PK DAO from DKG contract
      const PKDAO = await this.DKGContract.PK_COMMITTEE();
      // console.log("PKDAO", PKDAO);

      const { pk, errorPk } = await GenerateFromNullifierPk(nullifier);
      if (errorPk) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      const shareKey = babyJub.mulPointEscalar(PKDAO, nullifier);
      // console.log("shareKey", shareKey);

      const { poseidonHash, errorCPH } = await CaculatePoseidonHash(
        nullifier,
        v
      );
      if (errorCPH) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      // console.log("poseidonHash", poseidonHash);

      const { leafHash, errorLH } = await CaculateLeafHash(poseidonHash, pk, v);
      if (errorLH) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      // console.log("leafHash", leafHash);

      const { nullifierHash, errorNH } = await CaculateNullifierHash(
        nullifier,
        amount,
        indexAmount
      );
      if (errorNH) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      // console.log("nullifierHash", nullifierHash);

      const { lead, errorL } = await CaculateLead(shareKey[0], indexAmount);
      if (errorL) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      // check leaf in tree
      const res = await axios.get(
        "http://localhost:4500/tree-info/" + "?commitment=" + leafHash // need deploy tree server and change url
      );

      if (res.data.error == true || res.data.treeInfo.index == -1) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      const circuitInput: any = {};
      circuitInput.root = res.data.treeInfo.root;
      circuitInput.nullifierHash = String(nullifierHash);
      circuitInput.lead = String(lead);
      circuitInput.amount = String(amount);
      circuitInput.pkDAO = PKDAO.map((_) => String(_));
      circuitInput.recipient = recipient;
      circuitInput.relayer = relayer;
      circuitInput.fee = String(fee);

      circuitInput.nullifier = String(nullifier);
      circuitInput.v = v.map((_) => String(_));
      circuitInput.pathElements = res.data.treeInfo.pathElements;
      circuitInput.pathIndices = res.data.treeInfo.pathIndices.map((_) =>
        String(_)
      );
      circuitInput.index = String(indexAmount);

      // console.log("circuitInput", circuitInput);
      return {
        circuitInput: circuitInput,
        error: false,
      };
    } catch (e) {
      console.log(e);
      return {
        circuitInput: "",
        error: true,
      };
    }
  }

  async Swap(
    nullifier: bigint, // private nullifier
    recipient: string, // recipient address
    relayer: string, // relayer address , receive fee
    v: bigint[], // private array
    indexAmount: bigint, // index of element in v
    feePercent: bigint, // % fee
    tokenOut: string, // token out address
    amountOutMin: bigint // min amount token out
  ): Promise<TWithdraw> {
    try {
      const amount = v[Number(indexAmount.toString())];
      const fee = (feePercent * amount) / 100n;

      //  get PK DAO from DKG contract
      const PKDAO = await this.DKGContract.PK_COMMITTEE();
      // console.log("PKDAO", PKDAO);

      const { pk, errorPk } = await GenerateFromNullifierPk(nullifier);
      if (errorPk) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      const shareKey = babyJub.mulPointEscalar(PKDAO, nullifier);
      // console.log("shareKey", shareKey);

      const { poseidonHash, errorCPH } = await CaculatePoseidonHash(
        nullifier,
        v
      );
      if (errorCPH) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      // console.log("poseidonHash", poseidonHash);

      const { leafHash, errorLH } = await CaculateLeafHash(poseidonHash, pk, v);
      if (errorLH) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      // console.log("leafHash", leafHash);

      const { nullifierHash, errorNH } = await CaculateNullifierHash(
        nullifier,
        amount,
        indexAmount
      );
      if (errorNH) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      // console.log("nullifierHash", nullifierHash);

      const { lead, errorL } = await CaculateLead(shareKey[0], indexAmount);
      if (errorL) {
        return {
          circuitInput: "",
          error: true,
        };
      }
      // console.log("lead", lead);

      // check leaf in tree
      const res = await axios.get(
        "http://localhost:4500/tree-info/" + "?commitment=" + leafHash // need deploy tree server and change url
      );

      if (res.data.error == true || res.data.treeInfo.index == -1) {
        return {
          circuitInput: "",
          error: true,
        };
      }

      const circuitInput: any = {};
      circuitInput.root = res.data.treeInfo.root;
      circuitInput.nullifierHash = String(nullifierHash);
      circuitInput.lead = String(lead);
      circuitInput.amount = String(amount);
      circuitInput.pkDAO = PKDAO.map((_) => String(_));
      circuitInput.recipient = recipient;
      circuitInput.relayer = relayer;
      circuitInput.fee = String(fee);
      circuitInput.tokenOut = tokenOut;
      circuitInput.amountOutMin = String(amountOutMin);

      circuitInput.nullifier = String(nullifier);
      circuitInput.v = v.map((_) => String(_));
      circuitInput.pathElements = res.data.treeInfo.pathElements;
      circuitInput.pathIndices = res.data.treeInfo.pathIndices.map((_) =>
        String(_)
      );
      circuitInput.index = String(indexAmount);

      // console.log("circuitInput", circuitInput);
      return {
        circuitInput: circuitInput,
        error: false,
      };
    } catch (e) {
      console.log(e);
      return {
        circuitInput: "",
        error: true,
      };
    }
  }
}
