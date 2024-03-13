"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaculateLead = exports.CaculateNullifierHash = exports.CaculateLeafHash = exports.CaculatePoseidonHash = void 0;
const circomlibjs_1 = require("circomlibjs");
const CaculatePoseidonHash = async (nullifier, //
v // private v input
) => {
    try {
        return {
            poseidonHash: (0, circomlibjs_1.poseidon)([nullifier, ...v]),
            errorCPH: false,
        };
    }
    catch (e) {
        return {
            poseidonHash: BigInt(0),
            errorCPH: true,
        };
    }
};
exports.CaculatePoseidonHash = CaculatePoseidonHash;
const CaculateLeafHash = async (poseidonHash, pk, v) => {
    try {
        const leafHash = (0, circomlibjs_1.poseidon)([
            poseidonHash,
            pk[0],
            pk[1],
            v.reduce((a, b) => a + b),
        ]);
        return {
            leafHash: leafHash,
            errorLH: false,
        };
    }
    catch (e) {
        return {
            leafHash: BigInt(0),
            errorLH: true,
        };
    }
};
exports.CaculateLeafHash = CaculateLeafHash;
const CaculateNullifierHash = async (nullifier, amount, indexAmount) => {
    try {
        const nullifierHash = (0, circomlibjs_1.poseidon)([nullifier, amount, indexAmount]);
        return {
            nullifierHash: nullifierHash,
            errorNH: false,
        };
    }
    catch (e) {
        return {
            nullifierHash: BigInt(0),
            errorNH: true,
        };
    }
};
exports.CaculateNullifierHash = CaculateNullifierHash;
const CaculateLead = async (shareKeyX, indexAmount) => {
    try {
        const lead = (0, circomlibjs_1.poseidon)([shareKeyX, indexAmount]);
        return {
            lead: lead,
            errorL: false,
        };
    }
    catch (e) {
        return {
            lead: BigInt(0),
            errorL: true,
        };
    }
};
exports.CaculateLead = CaculateLead;
