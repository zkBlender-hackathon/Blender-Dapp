import { ethers, Contract } from "ethers";
import { TRound1Commmit, TRound2Commit, TCoef, TBabyJubPoint } from "../types/dkgTypes";
import { Multicall } from "ethereum-multicall";
export declare class DKGHelper {
    provider: ethers.JsonRpcProvider;
    DKGContract: Contract;
    multicall: Multicall;
    dkgContractAddress: string;
    constructor(rpcUrl: string, dkgContractAddress: string, multicallCustomAddress: string);
    Round1RCommit(): Promise<TRound1Commmit>;
    Round2Commit(commitment: string, coef: TCoef): Promise<TRound2Commit>;
    RevealCommit(commitment: string, coef: TCoef, pkAddressIn: TBabyJubPoint): Promise<TRound2Commit>;
}
//# sourceMappingURL=dkg.d.ts.map