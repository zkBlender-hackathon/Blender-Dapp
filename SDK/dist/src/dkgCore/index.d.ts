import { TCommitteeConfig, TCommitment, TDecryptedFaD, TRound2F, TRound2Encrypted, TBabyJubPoint, TRandomCommitment, TRound1Cofficient, TGenPkFromNullifier } from "../types/dkgTypes";
export declare const RandomNullifier: () => Promise<bigint>;
export declare const Round1Coefficient: (config: TCommitteeConfig) => Promise<TRound1Cofficient>;
export declare const Round1RCommitData: (config: TCommitteeConfig) => Promise<TCommitment>;
export declare const Round2Encrypted: (index: number, coef: bigint[], colCommitment0: any[]) => Promise<TRound2Encrypted>;
export declare const Round2F: (index: number, N_COMMITTEE: number, coef: bigint[]) => Promise<TRound2F>;
export declare const RevealDecryptedFaD: (N_COMMITTEE: number, index: number, coef: bigint[], colCommitment0: any[], encryped: any[], round2Data: any[], pkAddressIn: TBabyJubPoint) => Promise<TDecryptedFaD>;
export declare const DepositRandomCommitment: () => Promise<TRandomCommitment>;
export declare const GenerateFromNullifierPk: (nullifier: bigint) => Promise<TGenPkFromNullifier>;
//# sourceMappingURL=index.d.ts.map