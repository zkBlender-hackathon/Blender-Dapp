import * as types from "../types/dkgTypes";
export declare const BASE: any;
export declare const RandomBigint: (nbytes: number) => bigint;
export declare function RandomCoefficient(length: number): bigint[];
export declare function Round1Data(coefficient: bigint[]): types.TBabyJubPoint[];
export declare function Elgamal_enc(skA: bigint, pkB: types.TBabyJubPoint, message: bigint): bigint;
export declare function Elgamal_dec(skB: bigint, pkA: types.TBabyJubPoint, messageEnc: bigint): bigint;
export declare function Round2Data(coefi: bigint[], colCommitment0: types.TBabyJubPoint[]): any[];
export declare function DecodeRound2Data(coefi: bigint[], colCommitment0: types.TBabyJubPoint[], round2DataEnc: bigint[]): any[];
export declare function AggregateSki(coefi: bigint[], colCommitment0: types.TBabyJubPoint[], colRound2Datai: bigint[]): bigint;
//# sourceMappingURL=dkg.d.ts.map