"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DKGHelper = void 0;
const dkg_json_1 = require("./abis/dkg.json");
const ethers_1 = require("ethers");
const index_1 = require("../dkgCore/index");
const ethereum_multicall_1 = require("ethereum-multicall");
class DKGHelper {
    constructor(rpcUrl, dkgContractAddress, multicallCustomAddress) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.multicall = new ethereum_multicall_1.Multicall({
            nodeUrl: rpcUrl,
            tryAggregate: true,
            multicallCustomContractAddress: multicallCustomAddress,
        });
        this.DKGContract = new ethers_1.Contract(dkgContractAddress, dkg_json_1.abi, this.provider);
        this.dkgContractAddress = dkgContractAddress;
    }
    async Round1RCommit() {
        try {
            const { T_COMMITTEE, N_COMMITTEE, _ } = await this.DKGContract.config();
            const { coef, commitment, errorCM } = await (0, index_1.Round1RCommitData)({
                T_COMMITTEE: parseInt(T_COMMITTEE),
                N_COMMITTEE: parseInt(N_COMMITTEE),
            });
            if (errorCM) {
                return { coef: [], commitment: [], errorR1: true };
            }
            return { coef: coef, commitment: commitment, errorR1: false };
        }
        catch (e) {
            return { coef: [], commitment: [], errorR1: true };
        }
    }
    async Round2Commit(commitment, coef) {
        try {
            // check index of commitment in CommitteeIndices
            const index = parseInt(await this.DKGContract.CommitteeIndices(commitment));
            // if index is 0 , this commitment is not in CommitteeIndices, can't commit round 2
            const { T_COMMITTEE, N_COMMITTEE, _ } = await this.DKGContract.config();
            if (index === 0 ||
                coef.length === 0 ||
                coef.length !== parseInt(T_COMMITTEE)) {
                return {
                    error: true,
                    circuitInput: "",
                };
            }
            // caculate arguments for input of circuit
            let colCommitment0 = [];
            let commitmentsOfIndex = [];
            let pkB = [];
            let indexB = [];
            let skA = coef[0];
            // start call by multicall
            const callParams = [];
            // multicall params for commitment
            for (let i = 0; i < T_COMMITTEE; i++) {
                const callCommitmentOfIndex = {
                    reference: "DKGContract",
                    methodName: "Commitment",
                    methodParameters: [index, i],
                };
                callParams.push(callCommitmentOfIndex);
            }
            // multicall params for colCommitment0
            for (let i = 1; i <= N_COMMITTEE; i++) {
                const callCommitment0 = {
                    reference: "DKGContract",
                    methodName: "Commitment",
                    methodParameters: [i, 0],
                };
                callParams.push(callCommitment0);
            }
            // init multicall  DKGContract
            const contractCallContext = [
                {
                    reference: "DKGContract",
                    contractAddress: this.dkgContractAddress,
                    abi: dkg_json_1.abi,
                    calls: callParams,
                },
            ];
            // call multicall
            const resultmulticalls = await this.multicall.call(contractCallContext);
            // process result of multicall
            let countOfCommitment = parseInt(T_COMMITTEE);
            resultmulticalls.results.DKGContract?.callsReturnContext.map((called, i) => {
                if (called.success) {
                    if (countOfCommitment > 0) {
                        // insert data for commitment
                        const element = [];
                        called.returnValues.map((value) => {
                            element.push(BigInt(value.hex));
                        });
                        commitmentsOfIndex.push(element);
                        countOfCommitment--;
                    }
                    else {
                        // insert data for colCommitment0
                        const element = [];
                        called.returnValues.map((value) => {
                            element.push(BigInt(value.hex));
                        });
                        colCommitment0.push(element);
                    }
                }
                else {
                    return {
                        error: true,
                        circuitInput: "",
                    };
                }
            });
            // caculate pkB , indexB for input of circuit
            for (let i = 1; i <= parseInt(N_COMMITTEE); i++) {
                if (i != index) {
                    pkB.push(colCommitment0[i - 1]);
                    indexB.push(i);
                }
            }
            // caculate encrypted for input of circuit
            const { encryptedR2, errorR2E } = await (0, index_1.Round2Encrypted)(index, coef, colCommitment0);
            if (errorR2E) {
                return {
                    error: true,
                    circuitInput: "",
                };
            }
            // caculate f for input of circuit
            const { f, errorR2F } = await (0, index_1.Round2F)(index, parseInt(N_COMMITTEE), coef);
            if (errorR2F) {
                return {
                    error: true,
                    circuitInput: "",
                };
            }
            let round2InputCircuit = {};
            round2InputCircuit.Commitment = commitmentsOfIndex;
            round2InputCircuit.pkB = pkB;
            round2InputCircuit.indexB = indexB;
            round2InputCircuit.encrypted = encryptedR2;
            round2InputCircuit.skA = skA;
            round2InputCircuit.f = f;
            // console.log(round2InputCircuit);
            return {
                error: false,
                circuitInput: round2InputCircuit,
            };
        }
        catch (e) {
            return {
                error: true,
                circuitInput: "",
            };
        }
    }
    async RevealCommit(commitment, coef, pkAddressIn) {
        try {
            // check index of commitment in CommitteeIndices
            const index = parseInt(await this.DKGContract.CommitteeIndices(commitment));
            // if index is 0 , this commitment is not in CommitteeIndices, can't commit round 2
            const { T_COMMITTEE, N_COMMITTEE, _ } = await this.DKGContract.config();
            if (index === 0 ||
                coef.length === 0 ||
                coef.length !== parseInt(T_COMMITTEE)) {
                return {
                    error: true,
                    circuitInput: "",
                };
            }
            // caculate arguments for input of circuit
            let colCommitment0 = [];
            let commitmentsOfIndex = [];
            let pkB = [];
            let indexA = index;
            let encrypted = [];
            let skA = coef[0];
            let allEncrypteds = [];
            // start call by multicall
            let callParams = [];
            // multicall params for commitment
            for (let i = 0; i < T_COMMITTEE; i++) {
                const callCommitmentOfIndex = {
                    reference: "DKGContract",
                    methodName: "Commitment",
                    methodParameters: [index, i],
                };
                callParams.push(callCommitmentOfIndex);
            }
            // multicall params for colCommitment0
            for (let i = 1; i <= N_COMMITTEE; i++) {
                const callCommitment0 = {
                    reference: "DKGContract",
                    methodName: "Commitment",
                    methodParameters: [i, 0],
                };
                callParams.push(callCommitment0);
            }
            // multicall params for allEncrypted
            for (let i = 1; i <= N_COMMITTEE; i++) {
                let encryptedi;
                for (let j = 1; j <= N_COMMITTEE; j++) {
                    encryptedi = {
                        reference: "DKGContract",
                        methodName: "Encrypted",
                        methodParameters: [i, j],
                    };
                    callParams.push(encryptedi);
                }
            }
            // init multicall  DKGContract
            const contractCallContext = [
                {
                    reference: "DKGContract",
                    contractAddress: this.dkgContractAddress,
                    abi: dkg_json_1.abi,
                    calls: callParams,
                },
            ];
            // call multicall
            const results = await this.multicall.call(contractCallContext);
            let allEncryptedCombines = []; // array combine all encrypted of committee
            let countOfCommitment = parseInt(T_COMMITTEE);
            let countOfColCommitment0 = parseInt(N_COMMITTEE);
            results.results.DKGContract?.callsReturnContext.map((called, i) => {
                if (called.success) {
                    if (countOfCommitment > 0) {
                        // insert data for commitment
                        const element = [];
                        called.returnValues.map((value) => {
                            element.push(BigInt(value.hex));
                        });
                        commitmentsOfIndex.push(element);
                        countOfCommitment--;
                    }
                    else if (countOfColCommitment0 > 0) {
                        // insert data for colCommitment0
                        const element = [];
                        called.returnValues.map((value) => {
                            element.push(BigInt(value.hex));
                        });
                        colCommitment0.push(element);
                        countOfColCommitment0--;
                    }
                    else {
                        // insert data for allEncryptedCombines
                        called.returnValues.map((value) => {
                            allEncryptedCombines.push(BigInt(value.hex));
                        });
                    }
                }
                else {
                    return {
                        error: true,
                        circuitInput: "",
                    };
                }
            });
            //  refactoring allEncryptedCombines
            for (let i = 0; i < parseInt(N_COMMITTEE); i++) {
                let encryptedi = [];
                for (let j = 0; j < parseInt(N_COMMITTEE); j++) {
                    if (i == j) {
                        encryptedi.push(0n);
                    }
                    else {
                        encryptedi.push(allEncryptedCombines[i * parseInt(N_COMMITTEE) + j]);
                    }
                }
                // insert data for allEncrypteds
                allEncrypteds.push(encryptedi);
                if (i + 1 != index) {
                    // insert data for encrypted
                    encrypted.push(encryptedi[index - 1]);
                }
            }
            // caculate pkB for input of circuit
            for (let i = 1; i <= parseInt(N_COMMITTEE); i++) {
                if (i != index) {
                    pkB.push(colCommitment0[i - 1]);
                }
            }
            // caculate decrypted , fA , D for input of circuit
            const { decrypted, fA, D, errorDFA } = await (0, index_1.RevealDecryptedFaD)(parseInt(N_COMMITTEE), index, coef, colCommitment0, encrypted, allEncrypteds, pkAddressIn);
            if (errorDFA) {
                return {
                    error: true,
                    circuitInput: "",
                };
            }
            let revealInputCircuit = {};
            revealInputCircuit.Commitment = commitmentsOfIndex;
            revealInputCircuit.pkB = pkB;
            revealInputCircuit.encrypted = encrypted;
            revealInputCircuit.pkAddressIn = pkAddressIn;
            revealInputCircuit.D = D;
            revealInputCircuit.indexA = indexA;
            revealInputCircuit.decrypted = decrypted;
            revealInputCircuit.skA = skA;
            revealInputCircuit.fA = fA;
            // console.log(revealInputCircuit);
            return {
                error: false,
                circuitInput: revealInputCircuit,
            };
        }
        catch (e) {
            return {
                error: true,
                circuitInput: "",
            };
        }
    }
}
exports.DKGHelper = DKGHelper;
// const provider = new ethers.JsonRpcProvider(
//   "https://sepolia-rollup.arbitrum.io/rpc"
// );
// const DKGContract = new Contract(
//   "0x3258FaB08260B52e55f9E64940bcB4eca4C9A328",
//   DKGABI,
//   provider
// );
// const multicall = new Multicall({
//   nodeUrl: "https://sepolia-rollup.arbitrum.io/rpc",
//   tryAggregate: true,
//   multicallCustomContractAddress: "0xFa2186539bF491E8db079D3ACCe6899f371DcEF4",
// });
// // export const Round1RCommit = async (): Promise<TRound1Commmit> => {
// //   try {
// //     const { T_COMMITTEE, N_COMMITTEE, _ } = await DKGContract.config();
// //     const { coef, commitment, errorCM } = await Round1RCommitData({
// //       T_COMMITTEE: parseInt(T_COMMITTEE),
// //       N_COMMITTEE: parseInt(N_COMMITTEE),
// //     });
// //     if (errorCM) {
// //       return { coef: [], commitment: [], errorR1: true };
// //     }
// //     return { coef: coef, commitment: commitment, errorR1: false };
// //   } catch (e) {
// //     return { coef: [], commitment: [], errorR1: true };
// //   }
// // };
// export const Round2Commit = async (
//   commitment: string,
//   coef: TCoef
// ): Promise<TRound2Commit> => {
//   try {
//     // check index of commitment in CommitteeIndices
//     const index = parseInt(await DKGContract.CommitteeIndices(commitment));
//     // if index is 0 , this commitment is not in CommitteeIndices, can't commit round 2
//     const { T_COMMITTEE, N_COMMITTEE, _ } = await DKGContract.config();
//     if (
//       index === 0 ||
//       coef.length === 0 ||
//       coef.length !== parseInt(T_COMMITTEE)
//     ) {
//       return {
//         error: true,
//         circuitInput: "",
//       };
//     }
//     // caculate arguments for input of circuit
//     let colCommitment0 = [];
//     let commitmentsOfIndex = [];
//     let pkB = [];
//     let indexB = [];
//     let skA = coef[0];
//     // start call by multicall
//     const callParams: TMulticallParams[] = [];
//     // multicall params for commitment
//     for (let i = 0; i < T_COMMITTEE; i++) {
//       const callCommitmentOfIndex: TMulticallParams = {
//         reference: "DKGContract",
//         methodName: "Commitment",
//         methodParameters: [index, i],
//       };
//       callParams.push(callCommitmentOfIndex);
//     }
//     // multicall params for colCommitment0
//     for (let i = 1; i <= N_COMMITTEE; i++) {
//       const callCommitment0: TMulticallParams = {
//         reference: "DKGContract",
//         methodName: "Commitment",
//         methodParameters: [i, 0],
//       };
//       callParams.push(callCommitment0);
//     }
//     // init multicall  DKGContract
//     const contractCallContext: ContractCallContext[] = [
//       {
//         reference: "DKGContract",
//         contractAddress: config.DKG_ADDRESS,
//         abi: DKGABI,
//         calls: callParams,
//       },
//     ];
//     // call multicall
//     const resultmulticalls: ContractCallResults =
//       await multicall.call(contractCallContext);
//     // process result of multicall
//     let countOfCommitment = parseInt(T_COMMITTEE);
//     resultmulticalls.results.DKGContract?.callsReturnContext.map(
//       (called, i) => {
//         if (called.success) {
//           if (countOfCommitment > 0) {
//             // insert data for commitment
//             const element = [];
//             called.returnValues.map((value) => {
//               element.push(BigInt(value.hex));
//             });
//             commitmentsOfIndex.push(element);
//             countOfCommitment--;
//           } else {
//             // insert data for colCommitment0
//             const element = [];
//             called.returnValues.map((value) => {
//               element.push(BigInt(value.hex));
//             });
//             colCommitment0.push(element);
//           }
//         } else {
//           return {
//             error: true,
//             circuitInput: "",
//           };
//         }
//       }
//     );
//     // caculate pkB , indexB for input of circuit
//     for (let i = 1; i <= parseInt(N_COMMITTEE); i++) {
//       if (i != index) {
//         pkB.push(colCommitment0[i - 1]);
//         indexB.push(i);
//       }
//     }
//     // caculate encrypted for input of circuit
//     const { encryptedR2, errorR2E } = await Round2Encrypted(
//       index,
//       coef,
//       colCommitment0
//     );
//     if (errorR2E) {
//       return {
//         error: true,
//         circuitInput: "",
//       };
//     }
//     // caculate f for input of circuit
//     const { f, errorR2F } = await Round2F(index, parseInt(N_COMMITTEE), coef);
//     if (errorR2F) {
//       return {
//         error: true,
//         circuitInput: "",
//       };
//     }
//     // console.log("die");
//     let round2InputCircuit: any = {};
//     round2InputCircuit.Commitment = commitmentsOfIndex;
//     round2InputCircuit.pkB = pkB;
//     round2InputCircuit.indexB = indexB;
//     round2InputCircuit.encrypted = encryptedR2;
//     round2InputCircuit.skA = skA;
//     round2InputCircuit.f = f;
//     return {
//       error: false,
//       circuitInput: jsonBigint.stringify(round2InputCircuit),
//     };
//   } catch (e) {
//     console.log("die", e);
//     return {
//       error: true,
//       circuitInput: "",
//     };
//   }
// };
// const coefCommitee1 = [
//   2366885765488519365385533211806091900008282017346403036373252199852602027355n,
//   1354887310387081882913273088387116829175970270798962273019154159586155227193n,
//   1822455040119807753679274503411884794603199028777717555472706024015297493814n,
// ];
// const address1 = "0xBc8f25A46f36CBA767f6eb8C442DdF22Dc78F5b9";
// Round2Commit(address1, coefCommitee1).then((result) => {
//   console.log(result);
// });
// export const RevealCommit = async (
//   commitment: string,
//   coef: TCoef,
//   pkAddressIn: TBabyJubPoint
// ): Promise<TRound2Commit> => {
//   try {
//     // check index of commitment in CommitteeIndices
//     const index = parseInt(await DKGContract.CommitteeIndices(commitment));
//     // if index is 0 , this commitment is not in CommitteeIndices, can't commit round 2
//     const { T_COMMITTEE, N_COMMITTEE, _ } = await DKGContract.config();
//     if (
//       index === 0 ||
//       coef.length === 0 ||
//       coef.length !== parseInt(T_COMMITTEE)
//     ) {
//       return {
//         error: true,
//         circuitInput: "",
//       };
//     }
//     // caculate arguments for input of circuit
//     let colCommitment0 = [];
//     let commitmentsOfIndex = [];
//     let pkB = [];
//     let indexA = index;
//     let encrypted = [];
//     let skA = coef[0];
//     let allEncrypteds = [];
//     // start call by multicall
//     let callParams: TMulticallParams[] = [];
//     // multicall params for commitment
//     for (let i = 0; i < T_COMMITTEE; i++) {
//       const callCommitmentOfIndex: TMulticallParams = {
//         reference: "DKGContract",
//         methodName: "Commitment",
//         methodParameters: [index, i],
//       };
//       callParams.push(callCommitmentOfIndex);
//     }
//     // multicall params for colCommitment0
//     for (let i = 1; i <= N_COMMITTEE; i++) {
//       const callCommitment0: TMulticallParams = {
//         reference: "DKGContract",
//         methodName: "Commitment",
//         methodParameters: [i, 0],
//       };
//       callParams.push(callCommitment0);
//     }
//     // multicall params for allEncrypted
//     for (let i = 1; i <= N_COMMITTEE; i++) {
//       let encryptedi: TMulticallParams;
//       for (let j = 1; j <= N_COMMITTEE; j++) {
//         encryptedi = {
//           reference: "DKGContract",
//           methodName: "Encrypted",
//           methodParameters: [i, j],
//         };
//         callParams.push(encryptedi);
//       }
//     }
//     // init multicall  DKGContract
//     const contractCallContext: ContractCallContext[] = [
//       {
//         reference: "DKGContract",
//         contractAddress: "0x9cD832530AaFE09D28C6A224F28bE88211376c26",
//         abi: DKGABI,
//         calls: callParams,
//       },
//     ];
//     // call multicall
//     const results: ContractCallResults =
//       await multicall.call(contractCallContext);
//     let allEncryptedCombines = []; // array combine all encrypted of committee
//     let countOfCommitment = parseInt(T_COMMITTEE);
//     let countOfColCommitment0 = parseInt(N_COMMITTEE);
//     results.results.DKGContract?.callsReturnContext.map((called, i) => {
//       if (called.success) {
//         if (countOfCommitment > 0) {
//           // insert data for commitment
//           const element = [];
//           called.returnValues.map((value) => {
//             element.push(BigInt(value.hex));
//           });
//           commitmentsOfIndex.push(element);
//           countOfCommitment--;
//         } else if (countOfColCommitment0 > 0) {
//           // insert data for colCommitment0
//           const element = [];
//           called.returnValues.map((value) => {
//             element.push(BigInt(value.hex));
//           });
//           colCommitment0.push(element);
//           countOfColCommitment0--;
//         } else {
//           // insert data for allEncryptedCombines
//           called.returnValues.map((value) => {
//             allEncryptedCombines.push(BigInt(value.hex));
//           });
//         }
//       } else {
//         return {
//           error: true,
//           circuitInput: "",
//         };
//       }
//     });
//     //  refactoring allEncryptedCombines
//     for (let i = 0; i < parseInt(N_COMMITTEE); i++) {
//       let encryptedi = [];
//       for (let j = 0; j < parseInt(N_COMMITTEE); j++) {
//         if (i == j) {
//           encryptedi.push(0n);
//         } else {
//           encryptedi.push(allEncryptedCombines[i * parseInt(N_COMMITTEE) + j]);
//         }
//       }
//       // insert data for allEncrypteds
//       allEncrypteds.push(encryptedi);
//       if (i + 1 != index) {
//         // insert data for encrypted
//         encrypted.push(encryptedi[index - 1]);
//       }
//     }
//     // caculate pkB for input of circuit
//     for (let i = 1; i <= parseInt(N_COMMITTEE); i++) {
//       if (i != index) {
//         pkB.push(colCommitment0[i - 1]);
//       }
//     }
//     // caculate decrypted , fA , D for input of circuit
//     const { decrypted, fA, D, errorDFA } = await RevealDecryptedFaD(
//       parseInt(N_COMMITTEE),
//       index,
//       coef,
//       colCommitment0,
//       encrypted,
//       allEncrypteds,
//       pkAddressIn
//     );
//     if (errorDFA) {
//       return {
//         error: true,
//         circuitInput: "",
//       };
//     }
//     let revealInputCircuit: any = {};
//     revealInputCircuit.Commitment = commitmentsOfIndex;
//     revealInputCircuit.pkB = pkB;
//     revealInputCircuit.encrypted = encrypted;
//     revealInputCircuit.pkAddressIn = pkAddressIn;
//     revealInputCircuit.D = D;
//     revealInputCircuit.indexA = indexA;
//     revealInputCircuit.decrypted = decrypted;
//     revealInputCircuit.skA = skA;
//     revealInputCircuit.fA = fA;
//     // console.log(revealInputCircuit);
//     return {
//       error: false,
//       circuitInput: revealInputCircuit,
//     };
//   } catch (e) {
//     return {
//       error: true,
//       circuitInput: "",
//     };
//   }
// };
// RevealCommit(
//   "0xBc8f25A46f36CBA767f6eb8C442DdF22Dc78F5b9",
//   [
//     516721395682801561716141896460050508274695713304743182937781325109698655987n,
//     2407872435259171036839867874296209060248713403025001185341679275251691216027n,
//     1434636916374214503983811962075477901978993914377126406639617085903476234233n,
//   ],
//   [
//     11504656306667765137504037971796461430914255895455958202365368149753066664983n,
//     9604695707863003473345644549569384556017439611893764141909045059476297154194n,
//   ]
// ).then((result) => {
//   console.log(result);
// });
