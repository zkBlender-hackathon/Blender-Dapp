import { TPoseidonHash, TBabyJubPoint, TLeafHash, TNullifierHash, TLead } from "../types/dkgTypes";
export declare const CaculatePoseidonHash: (nullifier: bigint, v: bigint[]) => Promise<TPoseidonHash>;
export declare const CaculateLeafHash: (poseidonHash: bigint, pk: TBabyJubPoint, v: bigint[]) => Promise<TLeafHash>;
export declare const CaculateNullifierHash: (nullifier: bigint, amount: bigint, indexAmount: bigint) => Promise<TNullifierHash>;
export declare const CaculateLead: (shareKeyX: bigint, indexAmount: bigint) => Promise<TLead>;
//# sourceMappingURL=treeHelper.d.ts.map