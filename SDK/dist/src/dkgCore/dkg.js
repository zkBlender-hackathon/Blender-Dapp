"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateSki = exports.DecodeRound2Data = exports.Round2Data = exports.Elgamal_dec = exports.Elgamal_enc = exports.Round1Data = exports.RandomCoefficient = exports.RandomBigint = exports.BASE = void 0;
const ethers_1 = require("ethers");
const circomlib_1 = require("circomlib");
const math = __importStar(require("./math"));
exports.BASE = circomlib_1.babyJub.Base8;
const Fp = math.Fp;
const RandomBigint = (nbytes) => {
    return (BigInt("0x" + Buffer.from(ethers_1.ethers.randomBytes(nbytes)).toString("hex")) % Fp);
};
exports.RandomBigint = RandomBigint;
function RandomCoefficient(length) {
    return new Array(length).fill(0).map(() => (0, exports.RandomBigint)(32));
}
exports.RandomCoefficient = RandomCoefficient;
function Round1Data(coefficient) {
    return coefficient.map((sk) => circomlib_1.babyJub.mulPointEscalar(exports.BASE, sk));
}
exports.Round1Data = Round1Data;
function Elgamal_enc(skA, pkB, message) {
    const pad = circomlib_1.babyJub.mulPointEscalar(pkB, skA)[0];
    return pad ^ message;
}
exports.Elgamal_enc = Elgamal_enc;
function Elgamal_dec(skB, pkA, messageEnc) {
    const pad = circomlib_1.babyJub.mulPointEscalar(pkA, skB)[0];
    return pad ^ messageEnc;
}
exports.Elgamal_dec = Elgamal_dec;
function Round2Data(coefi, colCommitment0) {
    let data = [];
    for (const index in colCommitment0) {
        if (math.babyJubPointEqual(circomlib_1.babyJub.mulPointEscalar(exports.BASE, coefi[0]), colCommitment0[index])) {
            data.push(0n);
            continue;
        }
        data.push(Elgamal_enc(coefi[0], colCommitment0[index], math.fx(coefi, BigInt(index) + 1n)));
    }
    return data;
}
exports.Round2Data = Round2Data;
function DecodeRound2Data(coefi, colCommitment0, round2DataEnc) {
    let data = [];
    for (const index in round2DataEnc) {
        if (round2DataEnc[index] == 0n) {
            data.push(math.fx(coefi, BigInt(index) + 1n));
            continue;
        }
        data.push(Elgamal_dec(coefi[0], colCommitment0[index], round2DataEnc[index]));
    }
    return data;
}
exports.DecodeRound2Data = DecodeRound2Data;
function AggregateSki(coefi, colCommitment0, colRound2Datai) {
    let ski = 0n;
    for (const index in colRound2Datai) {
        if (colRound2Datai[index] == 0n) {
            ski += math.fx(coefi, BigInt(index) + 1n);
            continue;
        }
        ski += Elgamal_dec(coefi[0], colCommitment0[index], colRound2Datai[index]);
    }
    return ski % Fp;
}
exports.AggregateSki = AggregateSki;
