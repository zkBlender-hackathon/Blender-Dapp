"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlenderHelper = void 0;
const dkg_json_1 = require("./abis/dkg.json");
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
const circomlibjs_1 = require("circomlibjs");
const index_1 = require("../dkgCore/index");
const circomlib_1 = require("circomlib");
const treeHelper_1 = require("../tree/treeHelper");
const ethereum_multicall_1 = require("ethereum-multicall");
class BlenderHelper {
    constructor(rpcUrl, dkgContractAddress, multicallCustomAddress) {
        this.Deposit = async (nullifier, // private nullifier
        v // private array
        ) => {
            try {
                const { pk, errorPk } = await (0, index_1.GenerateFromNullifierPk)(nullifier);
                if (errorPk) {
                    return {
                        params: "",
                        error: true,
                    };
                }
                const amountTotal = v.reduce((a, b) => a + b);
                const commitment = (0, circomlibjs_1.poseidon)([nullifier, ...v]);
                let depositParams = [];
                depositParams.push(commitment);
                depositParams.push(pk);
                depositParams.push(amountTotal);
                return {
                    params: depositParams,
                    error: false,
                };
            }
            catch (e) {
                return {
                    params: "",
                    error: true,
                };
            }
        };
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.DKGContract = new ethers_1.Contract(dkgContractAddress, dkg_json_1.abi, new ethers_1.ethers.JsonRpcProvider(rpcUrl));
        this.dkgContractAddress = dkgContractAddress;
        this.multicall = new ethereum_multicall_1.Multicall({
            nodeUrl: rpcUrl,
            tryAggregate: true,
            multicallCustomContractAddress: multicallCustomAddress,
        });
    }
    async GenerateNullifier() {
        try {
            const nullifier = await (0, index_1.RandomNullifier)();
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
        }
        catch (e) {
            return {
                randomNullifier: 0n,
                errorRN: true,
            };
        }
    }
    async Withdraw(nullifier, // private nullifier
    recipient, // recipient address
    relayer, // relayer address , receive fee
    v, // private array
    indexAmount, // index of element in v
    feePercent // % fee
    ) {
        try {
            const amount = v[Number(indexAmount.toString())];
            const fee = (feePercent * amount) / 100n;
            //  get PK DAO from DKG contract
            const PKDAO = await this.DKGContract.PK_COMMITTEE();
            // console.log("PKDAO", PKDAO);
            const { pk, errorPk } = await (0, index_1.GenerateFromNullifierPk)(nullifier);
            if (errorPk) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            const shareKey = circomlib_1.babyJub.mulPointEscalar(PKDAO, nullifier);
            // console.log("shareKey", shareKey);
            const { poseidonHash, errorCPH } = await (0, treeHelper_1.CaculatePoseidonHash)(nullifier, v);
            if (errorCPH) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // console.log("poseidonHash", poseidonHash);
            const { leafHash, errorLH } = await (0, treeHelper_1.CaculateLeafHash)(poseidonHash, pk, v);
            if (errorLH) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // console.log("leafHash", leafHash);
            const { nullifierHash, errorNH } = await (0, treeHelper_1.CaculateNullifierHash)(nullifier, amount, indexAmount);
            if (errorNH) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // console.log("nullifierHash", nullifierHash);
            const { lead, errorL } = await (0, treeHelper_1.CaculateLead)(shareKey[0], indexAmount);
            if (errorL) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // check leaf in tree
            const res = await axios_1.default.get("http://localhost:4500/tree-info/" + "?commitment=" + leafHash // need deploy tree server and change url
            );
            if (res.data.error == true || res.data.treeInfo.index == -1) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            const circuitInput = {};
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
            circuitInput.pathIndices = res.data.treeInfo.pathIndices.map((_) => String(_));
            circuitInput.index = String(indexAmount);
            // console.log("circuitInput", circuitInput);
            return {
                circuitInput: circuitInput,
                error: false,
            };
        }
        catch (e) {
            console.log(e);
            return {
                circuitInput: "",
                error: true,
            };
        }
    }
    async Swap(nullifier, // private nullifier
    recipient, // recipient address
    relayer, // relayer address , receive fee
    v, // private array
    indexAmount, // index of element in v
    feePercent, // % fee
    tokenOut, // token out address
    amountOutMin // min amount token out
    ) {
        try {
            const amount = v[Number(indexAmount.toString())];
            const fee = (feePercent * amount) / 100n;
            //  get PK DAO from DKG contract
            const PKDAO = await this.DKGContract.PK_COMMITTEE();
            // console.log("PKDAO", PKDAO);
            const { pk, errorPk } = await (0, index_1.GenerateFromNullifierPk)(nullifier);
            if (errorPk) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            const shareKey = circomlib_1.babyJub.mulPointEscalar(PKDAO, nullifier);
            // console.log("shareKey", shareKey);
            const { poseidonHash, errorCPH } = await (0, treeHelper_1.CaculatePoseidonHash)(nullifier, v);
            if (errorCPH) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // console.log("poseidonHash", poseidonHash);
            const { leafHash, errorLH } = await (0, treeHelper_1.CaculateLeafHash)(poseidonHash, pk, v);
            if (errorLH) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // console.log("leafHash", leafHash);
            const { nullifierHash, errorNH } = await (0, treeHelper_1.CaculateNullifierHash)(nullifier, amount, indexAmount);
            if (errorNH) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // console.log("nullifierHash", nullifierHash);
            const { lead, errorL } = await (0, treeHelper_1.CaculateLead)(shareKey[0], indexAmount);
            if (errorL) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            // console.log("lead", lead);
            // check leaf in tree
            const res = await axios_1.default.get("http://localhost:4500/tree-info/" + "?commitment=" + leafHash // need deploy tree server and change url
            );
            if (res.data.error == true || res.data.treeInfo.index == -1) {
                return {
                    circuitInput: "",
                    error: true,
                };
            }
            const circuitInput = {};
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
            circuitInput.pathIndices = res.data.treeInfo.pathIndices.map((_) => String(_));
            circuitInput.index = String(indexAmount);
            // console.log("circuitInput", circuitInput);
            return {
                circuitInput: circuitInput,
                error: false,
            };
        }
        catch (e) {
            console.log(e);
            return {
                circuitInput: "",
                error: true,
            };
        }
    }
}
exports.BlenderHelper = BlenderHelper;
