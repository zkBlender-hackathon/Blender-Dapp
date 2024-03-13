"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateFromNullifierPk = exports.DepositRandomCommitment = exports.RevealDecryptedFaD = exports.Round2F = exports.Round2Encrypted = exports.Round1RCommitData = exports.Round1Coefficient = exports.RandomNullifier = void 0;
const dkg_1 = require("./dkg");
const math_1 = require("./math");
const circomlib_1 = require("circomlib");
const RandomNullifier = async () => {
    try {
        const nullifier = (0, dkg_1.RandomBigint)(32);
        return nullifier;
    }
    catch (e) {
        return 0n;
    }
};
exports.RandomNullifier = RandomNullifier;
const Round1Coefficient = async (config) => {
    try {
        const coef = (0, dkg_1.RandomCoefficient)(config.T_COMMITTEE);
        return {
            coef: coef,
            errorCoef: false,
        };
    }
    catch (e) {
        return {
            coef: [],
            errorCoef: true,
        };
    }
};
exports.Round1Coefficient = Round1Coefficient;
const Round1RCommitData = async (config) => {
    try {
        const coef = (0, dkg_1.RandomCoefficient)(config.T_COMMITTEE);
        const Commitment = (0, dkg_1.Round1Data)(coef);
        return {
            coef: coef,
            commitment: Commitment,
            errorCM: false,
        };
    }
    catch (e) {
        return {
            coef: [],
            commitment: [],
            errorCM: true,
        };
    }
};
exports.Round1RCommitData = Round1RCommitData;
const Round2Encrypted = async (index, coef, colCommitment0) => {
    try {
        const round2Data = (0, dkg_1.Round2Data)(coef, colCommitment0).filter((_, i) => i + 1 != index);
        return {
            encryptedR2: round2Data,
            errorR2E: false,
        };
    }
    catch (e) {
        return {
            encryptedR2: [],
            errorR2E: true,
        };
    }
};
exports.Round2Encrypted = Round2Encrypted;
const Round2F = async (index, N_COMMITTEE, coef) => {
    try {
        const result = new Array(N_COMMITTEE)
            .fill(0)
            .map((_f, i) => (0, math_1.fx)(coef, BigInt(i + 1)))
            .filter((_, i) => i + 1 != index);
        return {
            f: result,
            errorR2F: false,
        };
    }
    catch (e) {
        return {
            f: [],
            errorR2F: true,
        };
    }
};
exports.Round2F = Round2F;
const RevealDecryptedFaD = async (N_COMMITTEE, index, coef, colCommitment0, encryped, round2Data, pkAddressIn) => {
    try {
        let result = [];
        let decOfIndex = (0, dkg_1.DecodeRound2Data)(coef, colCommitment0, round2Data[index - 1]);
        let fA = decOfIndex[index - 1];
        let round2DataIndex = [];
        for (let i = 1, j = 0, k = 0; i <= N_COMMITTEE; i++, k++) {
            if (i != index) {
                result.push((0, dkg_1.Elgamal_dec)(coef[0], colCommitment0[i - 1], encryped[j]));
                round2DataIndex.push(round2Data[k][index - 1]);
                j++;
            }
            else {
                round2DataIndex.push(0n);
                continue;
            }
        }
        const ski = (0, dkg_1.AggregateSki)(coef, colCommitment0, round2DataIndex);
        const D = circomlib_1.babyJub.mulPointEscalar(pkAddressIn, ski);
        return {
            decrypted: result,
            fA: fA,
            D: D,
            errorDFA: false,
        };
    }
    catch (e) {
        return {
            decrypted: [],
            fA: 0n,
            D: [0n, 0n],
            errorDFA: true,
        };
    }
};
exports.RevealDecryptedFaD = RevealDecryptedFaD;
const DepositRandomCommitment = async () => {
    try {
        const randomCommitment = (0, dkg_1.RandomBigint)(32);
        return {
            radomCommitment: randomCommitment,
            errorRC: false,
        };
    }
    catch (e) {
        return {
            radomCommitment: 0n,
            errorRC: true,
        };
    }
};
exports.DepositRandomCommitment = DepositRandomCommitment;
const GenerateFromNullifierPk = async (nullifier) => {
    try {
        const [pkx, pky] = circomlib_1.babyJub.mulPointEscalar(dkg_1.BASE, nullifier);
        if (pkx === 0n && pky === 0n) {
            return {
                pk: [0n, 0n],
                errorPk: true,
            };
        }
        return {
            pk: [pkx, pky],
            errorPk: false,
        };
    }
    catch (e) {
        return {
            pk: [0n, 0n],
            errorPk: true,
        };
    }
};
exports.GenerateFromNullifierPk = GenerateFromNullifierPk;
// GenerateFromNullifierPk(
//   2565768520321566751814776235936631015488583705485544099469764147870754320603n
// ).then((res) => console.log(res));
