import * as types from "../types/dkgTypes";
export declare const Fp: any;
export declare function fx(coef: bigint[], x: bigint): bigint;
export declare function modInverse(a: bigint, p?: bigint): bigint | undefined;
export declare function babyJubPointEqual(P: types.TBabyJubPoint, Q: types.TBabyJubPoint): boolean;
export declare function lagrangeInterpolationZpAtZero(indexes: bigint[], values: bigint[], Zp?: bigint): bigint | undefined;
export declare function lagrangeInterpolationZpAtZeroMulBabyJubPoint(indexes: bigint[], Di: types.TBabyJubPoint[], Zp?: bigint): types.TBabyJubPoint | undefined;
//# sourceMappingURL=math.d.ts.map