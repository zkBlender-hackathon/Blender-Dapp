import { ethers, Contract } from "ethers";
import { TMixerDeposit, TWithdraw, TRandomNullifier } from "../types/dkgTypes";
import { Multicall } from "ethereum-multicall";
export declare class BlenderHelper {
    provider: ethers.JsonRpcProvider;
    DKGContract: Contract;
    dkgContractAddress: string;
    multicall: Multicall;
    constructor(rpcUrl: string, dkgContractAddress: string, multicallCustomAddress: string);
    GenerateNullifier(): Promise<TRandomNullifier>;
    Deposit: (nullifier: bigint, v: bigint[]) => Promise<TMixerDeposit>;
    Withdraw(nullifier: bigint, // private nullifier
    recipient: string, // recipient address
    relayer: string, // relayer address , receive fee
    v: bigint[], // private array
    indexAmount: bigint, // index of element in v
    feePercent: bigint): Promise<TWithdraw>;
    Swap(nullifier: bigint, // private nullifier
    recipient: string, // recipient address
    relayer: string, // relayer address , receive fee
    v: bigint[], // private array
    indexAmount: bigint, // index of element in v
    feePercent: bigint, // % fee
    tokenOut: string, // token out address
    amountOutMin: bigint): Promise<TWithdraw>;
}
//# sourceMappingURL=blender.d.ts.map