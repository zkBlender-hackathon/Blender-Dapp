import { ethers } from "ethers";
import { useMemo, useEffect, useState } from "react";

import { useEthers, useEtherBalance, useContractFunction } from "@usedapp/core";
import * as web3 from "web3";

import { V_TOTAL, FEE, RELAYER_ADDRESS } from "../../constants/index";

import { ETH_PRIVATE_ABI } from "../../abis/ETHPrivate";
import {
  ETH_PRIVATE_ADDRESS,
  ROUTER_ADDRESS,
  ROUTER_FEE,
  PAIR_ADDRESS,
  WETH9_ADDRESS,
  SWAP_EXACT_TOKENS_FOR_ETH_COMMAND,
} from "../../constants/index";
import {
  useGenerateWithdrawParams,
  useGenerateSwapParams,
  toAddress,
} from "../../hooks/private-zkHook";

import { useContractByAddress } from "../../hooks/use-contract";

import { EthItem } from "../Util/eth";
import { BnbItem } from "../Util/bnb";
import { UsdtItem } from "../Util/usdt";
import { SelectTokenPopup } from "../Popup/SelectTokenPopup";

import axios from "axios";
import { toast } from "react-toastify";

export const Withdraw = () => {
  const { switchNetwork, chainId, account, deactivate, activateBrowserWallet } =
    useEthers();

  // useEffect(() => {
  //   if (!chainId) {
  //     switchNetwork(ArbitrumSepolia.chainId).then(() =>
  //       activateBrowserWallet()
  //     );
  //   }
  // }, [chainId]);
  const balanceHex = useEtherBalance(account);

  const ETHPrivateContract = useContractByAddress(
    ETH_PRIVATE_ADDRESS,
    ETH_PRIVATE_ABI
  );

  const WithdrawFunction = useContractFunction(ETHPrivateContract, "withdraw");

  const SwapFunction = useContractFunction(ETHPrivateContract, "swap");

  const [amount, setAmount] = useState("");
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [amount3, setAmount3] = useState("");
  const [amount4, setAmount4] = useState("");
  const [amountOutMin, setAmountOutMin] = useState("");

  const [vPrivate, setVPrivate] = useState([]);
  const [indexInPrivateV, setIndexInPrivateV] = useState(0);
  const [nullifier, setNullifier] = useState(BigInt(0));
  const [receipt, setReceipt] = useState("");
  const [total, setTotal] = useState("");

  const [selectTokenPopup, setSelectTokenPopup] = useState(false);
  const [selectTargetTokenPopup, setSelectTargetTokenPopup] = useState(false);
  const [network, setNetwork] = useState({
    ethereum: true,
    bnb: false,
    zksync: false,
  });
  const [selectedToken, setSelectedToken] = useState("");
  const [selectedTargetToken, setSelectedTargetToken] = useState("");
  const [despositPopup, setDepositPopup] = useState(false);

  const [action, setAction] = useState({
    withdraw: true,
    swap: false,
  });

  const balance = useMemo(() => {
    if (balanceHex) {
      // convert string 0.004844403164078278 to number and round to 2 decimals

      const balance = parseFloat(ethers.utils.formatEther(balanceHex)).toFixed(
        5
      );

      return balance;
    }
  }, [balanceHex]);

  const handleSetAmount = (e: any) => {
    setAmount(e.value);
  };

  const handleNetwork = (network: string) => {
    if (network === "ethereum") {
      setNetwork({
        ethereum: true,
        bnb: false,
        zksync: false,
      });
    } else if (network === "bnb") {
      setNetwork({
        ethereum: false,
        bnb: true,
        zksync: false,
      });
    } else if (network === "zksync") {
      setNetwork({
        ethereum: false,
        bnb: false,
        zksync: true,
      });
    }
  };

  const handleSelectedToken = (token: string) => {
    setSelectedToken(token);
    setSelectTokenPopup(false);
  };

  const handleSelectedTargetToken = (token: string) => {
    setSelectedTargetToken(token);
    setSelectTargetTokenPopup(false);
  };

  const handleActionOption = (option: string) => {
    if (option === "withdraw") {
      setAction({
        withdraw: true,
        swap: false,
      });
    } else if (option === "swap") {
      setAction({
        withdraw: false,
        swap: true,
      });
    }
  };

  const handleAmount1 = (e) => {
    setAmount1(e.target.value);
  };

  const handleAmount2 = (e) => {
    setAmount2(e.target.value);
  };

  const handleAmount3 = (e) => {
    setAmount3(e.target.value);
  };

  const handleAmount4 = (e) => {
    setAmount4(e.target.value);
  };

  const handleAmountOutMin = (e) => {
    setAmountOutMin(e.target.value);
  };

  const handleNullifier = (e) => {
    setNullifier(e.target.value);

    console.log("nullifier", nullifier);
  };

  const handleReceipt = (e) => {
    setReceipt(e.target.value);
    console.log("receipt", receipt);
  };

  const handleIndexInPrivateV = (e) => {
    setIndexInPrivateV(e.target.value);
    console.log("indexInPrivateV", indexInPrivateV);
  };

  const handleWithdraw = async () => {
    if (indexInPrivateV && nullifier && receipt) {
      const { error, circuitInput } = await useGenerateWithdrawParams(
        BigInt(nullifier),
        receipt,
        receipt,
        [
          BigInt(parseFloat(amount1) * 10 ** 18),
          BigInt(parseFloat(amount2) * 10 ** 18),
          BigInt(parseFloat(amount3) * 10 ** 18),
          BigInt(parseFloat(amount4) * 10 ** 18),
        ],
        BigInt(indexInPrivateV),
        BigInt(FEE)
      );

      if (error) {
        console.log("error", error);
      } else {
        const worker = new Worker("./worker.js");

        worker.postMessage(["fullProveWithdraw", circuitInput]);

        worker.onmessage = async function (e) {
          if (e.data == "Error: Couldn't prove the circuit") {
            console.log("Error: Couldn't prove the circuit");
            return;
          }
          const { proof, publicSignals } = e.data;

          // encode
          const encoder = await ethers.utils.defaultAbiCoder;

          const encodedProof = encoder.encode(
            ["uint256[8]"],
            [
              [
                BigInt(proof.pi_a[0]),
                BigInt(proof.pi_a[1]),
                BigInt(proof.pi_b[0][1]),
                BigInt(proof.pi_b[0][0]),
                BigInt(proof.pi_b[1][1]),
                BigInt(proof.pi_b[1][0]),
                BigInt(proof.pi_c[0]),
                BigInt(proof.pi_c[1]),
              ],
            ]
          );

          const callWithdrawParams = [
            encodedProof,
            publicSignals[0],
            publicSignals[1],
            publicSignals[2],
            publicSignals[3],
            await toAddress(publicSignals[6]),
            await toAddress(publicSignals[7]),
            publicSignals[8],
          ];

          const body = {
            proofs: encodedProof,
            root: publicSignals[0],
            nullifierHash: publicSignals[1],
            lead: publicSignals[2],
            amount: publicSignals[3],
            recipient: await toAddress(publicSignals[6]),
            relayer: await toAddress(publicSignals[7]),
            fee: publicSignals[8],
            caller: account,
          };

          // console.log("body", body);

          const res = await axios.post("http://localhost:3001/withdraw", body, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.data.error == false) {
            toast.success("Requested to Blender Relayer", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              progress: undefined,
              theme: "light",
            });
          } else {
            toast.error("Something went wrong. Please try again later.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              progress: undefined,
              theme: "light",
            });
          }

          // const withdrawTx = await WithdrawFunction.send(callWithdrawParams);
        };
      }
    }
  };

  const handleSwap = async () => {
    if (indexInPrivateV && nullifier && receipt) {
      const { error, circuitInput } = await useGenerateSwapParams(
        BigInt(nullifier),
        receipt,
        receipt,
        [
          BigInt(parseFloat(amount1) * 10 ** 18),
          BigInt(parseFloat(amount2) * 10 ** 18),
          BigInt(parseFloat(amount3) * 10 ** 18),
          BigInt(parseFloat(amount4) * 10 ** 18),
        ],
        BigInt(indexInPrivateV),
        BigInt(1),
        "0x95982ee10d5c71c58148875ec21379F4F7dd70ce",
        BigInt(parseFloat(amountOutMin) * 10 ** 18)
      );

      if (error) {
        console.log("error", error);
      } else {
        const worker = new Worker("./worker.js");

        worker.postMessage(["fullProveSwap", circuitInput]);

        worker.onmessage = async function (e) {
          if (e.data == "Error: Couldn't prove the circuit") {
            console.log("Error: Couldn't prove the circuit");
            return;
          }
          const { proof, publicSignals } = e.data;

          console.log("publicSignals", publicSignals);

          // encode
          const encoder = await ethers.utils.defaultAbiCoder;

          const encodedProof = encoder.encode(
            ["uint256[8]"],
            [
              [
                BigInt(proof.pi_a[0]),
                BigInt(proof.pi_a[1]),
                BigInt(proof.pi_b[0][1]),
                BigInt(proof.pi_b[0][0]),
                BigInt(proof.pi_b[1][1]),
                BigInt(proof.pi_b[1][0]),
                BigInt(proof.pi_c[0]),
                BigInt(proof.pi_c[1]),
              ],
            ]
          );

          const inputsWrapETH = web3.eth.abi.encodeParameters(
            ["address", "uint256"],
            [
              ROUTER_ADDRESS,
              String(BigInt(publicSignals[3]) - BigInt(publicSignals[8])),
            ]
          );

          const inputsSwap = web3.eth.abi.encodeParameters(
            [
              "address",
              "address",
              "uint256",
              "uint256",
              "address[]",
              "uint24[]",
              "bool",
            ],
            [
              await toAddress(publicSignals[6]),
              WETH9_ADDRESS,
              String(BigInt(publicSignals[3]) - BigInt(publicSignals[8])),
              BigInt(parseFloat(amountOutMin) * 10 ** 18),
              [PAIR_ADDRESS],
              [ROUTER_FEE],
              "false",
            ]
          );

          const callWithdrawParams = [
            encodedProof,
            publicSignals[0],
            publicSignals[1],
            publicSignals[2],
            publicSignals[3],
            await toAddress(publicSignals[6]),
            await toAddress(publicSignals[7]),
            publicSignals[8],
            await toAddress(publicSignals[9]),
            publicSignals[10],
            SWAP_EXACT_TOKENS_FOR_ETH_COMMAND,
            [inputsWrapETH, inputsSwap],
          ];

          const body = {
            proofs: encodedProof,
            root: publicSignals[0],
            nullifierHash: publicSignals[1],
            lead: publicSignals[2],
            amount: publicSignals[3],
            recipient: await toAddress(publicSignals[6]),
            relayer: await toAddress(publicSignals[7]),
            fee: publicSignals[8],
            tokenOut: await toAddress(publicSignals[9]),
            amountOutMin: publicSignals[10],
            commands: SWAP_EXACT_TOKENS_FOR_ETH_COMMAND,
            inputs: [inputsWrapETH, inputsSwap],
            caller: account,
          };

          // console.log("body", body);

          const res = await axios.post("http://localhost:3001/swap", body, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.data.error == false) {
            toast.success("Requested to Blender Relayer", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              progress: undefined,
              theme: "light",
            });
          } else {
            toast.error("Something went wrong. Please try again later.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              progress: undefined,
              theme: "light",
            });
          }
        };
      }
    }
  };

  useEffect(() => {
    if (amount1 !== "" && amount2 !== "" && amount3 !== "" && amount4 !== "") {
      const amount11 = ethers.utils.parseEther(amount1);
      const amount22 = ethers.utils.parseEther(amount2);
      const amount33 = ethers.utils.parseEther(amount3);
      const amount44 = ethers.utils.parseEther(amount4);

      const totalEther = amount11.add(amount22).add(amount33).add(amount44);

      // convert to string
      const totalEther2 = ethers.utils.formatEther(totalEther);

      setTotal(String(totalEther2));

      setVPrivate([
        parseFloat(amount1),
        parseFloat(amount2),
        parseFloat(amount3),
        parseFloat(amount4),
      ]);

      console.log("vPrivate", vPrivate);
    } else {
      setTotal("0");
    }
  }, [total]);

  return (
    <>
      {selectTokenPopup && (
        <SelectTokenPopup
          network={network}
          setSelectTokenPopup={setSelectTokenPopup}
          handleNetwork={handleNetwork}
          handleSelectedToken={handleSelectedToken}
        />
      )}

      {selectTargetTokenPopup && (
        <SelectTokenPopup
          network={network}
          setSelectTokenPopup={setSelectTargetTokenPopup}
          handleNetwork={handleNetwork}
          handleSelectedToken={handleSelectedTargetToken}
        />
      )}

      <div className=" md:w-[50%] w-[95%]  mx-auto ">
        <div className="text-white flex flex-col gap-4  my-24  border-features py-8">
          <div className="flex flex-row text-sm justify-end mx-6">
            <div
              className="flex flex-row gap-1 cursor-pointer"
              onClick={() => setSelectTokenPopup(true)}
            >
              {selectedToken == "" ? (
                <>
                  <div
                    className="text-black flex flex-row"
                    style={{
                      zIndex: 1,
                    }}
                  >
                    <div className="my-auto"> Select Token </div>
                    <svg
                      className="my-auto"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 10L12 14L16 10"
                        stroke="black"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="-mt-1">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 10L12 14L16 10"
                        stroke="white"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : selectedToken === "eth" ? (
                <>
                  <div className="-mt-1">
                    <EthItem />
                  </div>
                  <div className="my-auto text-black"> ETH </div>
                </>
              ) : selectedToken === "bnb" ? (
                <>
                  <div className="-mt-1">
                    <BnbItem />
                  </div>
                  <div className="my-auto text-black"> BNB </div>
                </>
              ) : (
                <>
                  <div className="-mt-1">
                    <UsdtItem />
                  </div>
                  <div className="my-auto text-black"> USDT </div>
                </>
              )}
            </div>
          </div>

          <div className=" mx-6 flex flex-col items-center">
            <div className="md:w-1/2 w-[90%] flex flex-row gap-4 justify-center items-center">
              <input
                className="md:w-1/6 w-1/4 bg-transparent  rounded-xl py-4 text-center text-black font-semibold"
                placeholder="0"
                value={amount1}
                onChange={(e) => handleAmount1(e)}
                style={{
                  background: "#EEEEEE",
                }}
              />
              <input
                className="md:w-1/6 w-1/4  bg-transparent  rounded-xl py-4 text-center text-black font-semibold"
                placeholder="0"
                value={amount2}
                onChange={(e) => handleAmount2(e)}
                style={{
                  background: "#EEEEEE",
                }}
              />
              <input
                className="md:w-1/6 w-1/4  bg-transparent  rounded-xl py-4 text-center text-black font-semibold"
                placeholder="0"
                type="number"
                value={amount3}
                onChange={(e) => handleAmount3(e)}
                style={{
                  background: "#EEEEEE",
                }}
              />
              <input
                className="md:w-1/6 w-1/4  bg-transparent  rounded-xl py-4 text-center text-black font-semibold"
                placeholder="0"
                value={amount4}
                onChange={(e) => handleAmount4(e)}
                style={{
                  background: "#EEEEEE",
                }}
              />
            </div>
          </div>

          <input
            className="mx-6 bg-transparent rounded-md px-4 py-3 text-black "
            placeholder="Index in private array"
            type="number"
            min={0}
            max={3}
            style={{
              background: "#EEEEEE",
            }}
            onChange={(e: any) => handleIndexInPrivateV(e)}
          />

          <input
            className="mx-6 bg-transparent rounded-md px-4 py-3 text-black "
            placeholder="Nullifier"
            // type="password"
            style={{
              background: "#EEEEEE",
            }}
            onChange={(e: any) => handleNullifier(e)}
          />

          <input
            className="mx-6 bg-transparent rounded-md px-4 py-3 text-black "
            placeholder="Recipient address"
            // type="password"
            style={{
              background: "#EEEEEE",
            }}
            onChange={(e: any) => handleReceipt(e)}
          />

          <div className="mx-6  flex flex-row mt-6">
            <div
              className={[
                "text-center w-1/2 p-2  cursor-pointer",
                action.withdraw ? "" : "",
              ].join(" ")}
              style={{
                // borderTopLeftRadius: "6px",
                // borderBottomLeftRadius: "6px",
                // border: action.withdraw ? "1px solid #00BBB0" : "",
                // borderRight: action.withdraw ? "1px solid #00BBB0" : "none",
                borderBottom: action.withdraw ? "2px solid #4070e9" : "",
                background: action.withdraw ? "" : "",
                color: action.withdraw ? "#4070e9" : "#999999",
              }}
              onClick={() => handleActionOption("withdraw")}
            >
              Withdraw
            </div>
            <div
              className={[
                "text-center w-1/2 p-2 cursor-pointer",
                action.swap ? "" : "",
              ].join(" ")}
              style={{
                // borderTopRightRadius: "6px",
                // borderBottomRightRadius: "6px",
                // border: action.swap ? "1px solid #00BBB0" : "",
                // borderLeft: action.swap ? "1px solid #00BBB0" : "none",
                borderBottom: action.swap ? "2px solid #4070e9" : "",
                color: action.swap ? "#4070e9" : "#999999",
              }}
              onClick={() => handleActionOption("swap")}
            >
              Swap
            </div>
          </div>

          {action.withdraw ? (
            <>
              <div className="flex flex-col mx-6 gap-4 mt-6">
                <div className="flex flex-row justify-between">
                  <div
                    className="text-sm text-black"
                    style={{
                      color: "#637592",
                    }}
                  >
                    Amount withdraw
                  </div>
                  {indexInPrivateV && indexInPrivateV == 0 ? (
                    <div className="text-black">{amount1}</div>
                  ) : indexInPrivateV && indexInPrivateV == 1 ? (
                    <div className="text-black">{amount2}</div>
                  ) : indexInPrivateV && indexInPrivateV == 2 ? (
                    <div className="text-black">{amount3}</div>
                  ) : indexInPrivateV && indexInPrivateV == 3 ? (
                    <div className="text-black">{amount4}</div>
                  ) : (
                    <div className="text-black">---</div>
                  )}
                </div>
                <div className="flex flex-row justify-between">
                  <div
                    className="text-sm text-black"
                    style={{
                      color: "#637592",
                    }}
                  >
                    Recipient address
                  </div>
                  {receipt ? (
                    <div className="text-black">{receipt}</div>
                  ) : (
                    <div className="text-black">---</div>
                  )}
                </div>

                <div
                  className={[
                    " cursor-pointer text-center items-center  px-3 py-3 justify-center ",
                    "deposit-button text-black hover:text-white",
                  ].join(" ")}
                  onClick={handleWithdraw}
                >
                  Withdraw
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-row text-sm justify-end mt-6 mx-6">
                <div
                  className="flex flex-row gap-1 cursor-pointer"
                  onClick={() => setSelectTargetTokenPopup(true)}
                >
                  {selectedTargetToken == "" ? (
                    <>
                      <div
                        className="text-black flex flex-row"
                        style={{
                          zIndex: 1,
                        }}
                      >
                        <div className="my-auto"> Select Target Token </div>
                        <svg
                          className="my-auto"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 10L12 14L16 10"
                            stroke="black"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>

                      <div className="-mt-1">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 10L12 14L16 10"
                            stroke="white"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                    </>
                  ) : selectedTargetToken === "eth" ? (
                    <>
                      <div className="-mt-1">
                        <EthItem />
                      </div>
                      <div className="my-auto text-black"> ETH </div>
                    </>
                  ) : selectedTargetToken === "bnb" ? (
                    <>
                      <div className="-mt-1">
                        <BnbItem />
                      </div>
                      <div className="my-auto text-black"> BNB </div>
                    </>
                  ) : (
                    <>
                      <div className="-mt-1">
                        <UsdtItem />
                      </div>
                      <div className="my-auto text-black"> USDT </div>
                    </>
                  )}
                </div>
              </div>

              <input
                className="mx-6 bg-transparent rounded-md px-4 py-3 text-center text-black font-semibold"
                placeholder="Amount out min"
                value={amountOutMin}
                onChange={(e) => handleAmountOutMin(e)}
                style={{
                  background: "#EEEEEE",
                }}
              />
              <div className="flex flex-col mx-6 gap-4 mt-6">
                <div className="flex flex-row justify-between">
                  <div
                    className="text-sm"
                    style={{
                      color: "#637592",
                    }}
                  >
                    Max slipage
                  </div>
                  <div className="text-black">10%</div>
                </div>

                <div className="flex flex-row justify-between">
                  <div
                    className="text-sm"
                    style={{
                      color: "#637592",
                    }}
                  >
                    Network cost
                  </div>
                  <div className="text-black">{FEE}%</div>
                </div>

                <div className="flex flex-row justify-between">
                  <div
                    className="text-sm"
                    style={{
                      color: "#637592",
                    }}
                  >
                    Recipient address
                  </div>
                  {receipt ? (
                    <div className="text-black">{receipt}</div>
                  ) : (
                    <div className="text-black">---</div>
                  )}
                </div>

                {/* add line */}
                <div
                  style={{
                    borderTop: "1px solid #637592",
                  }}
                ></div>

                <div className="flex flex-row justify-between">
                  <div
                    className="text-sm"
                    style={{
                      color: "#637592",
                    }}
                  >
                    Order routing
                  </div>
                  <div className="text-black">{RELAYER_ADDRESS}</div>
                </div>

                <div
                  className={[
                    " cursor-pointer text-center items-center px-3 py-3 justify-center ",
                    "deposit-button text-white hover:text-black",
                  ].join(" ")}
                  onClick={handleSwap}
                >
                  Swap
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
