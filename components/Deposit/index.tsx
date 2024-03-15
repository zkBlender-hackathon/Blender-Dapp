import { BigNumber, ethers } from "ethers";
import { useMemo, useEffect, useState } from "react";

import {
  shortenIfAddress,
  useEtherBalance,
  useEthers,
  BSCTestnet,
} from "@usedapp/core";

import { EthItem } from "../Util/eth";
import { BnbItem } from "../Util/bnb";
import { UsdtItem } from "../Util/usdt";

import { SelectTokenPopup } from "../Popup/SelectTokenPopup";
import { Introduction } from "./Introduction";
import { DepositPopup } from "../Popup/DepositPopup";

import {
  V_TOTAL,
  ARB_SEPOLIA_TESTNET_RPC,
  DKG_CONTRACT_ADDRESS,
} from "../../constants/index";
// import { ArbitrumSepolia } from "@usedapp/core/src/model/chain/arbitrum";
import { ArbitrumSepolia } from "../../packages/core/src/model/chain/arbitrum";

import { useGetNullifier } from "../../hooks/private-zkHook";

export const Deposit = () => {
  const { switchNetwork, chainId, account, deactivate, activateBrowserWallet } =
    useEthers();

  const [balanceETH, setBalanceETH] = useState("");

  useEffect(() => {
    async function getBalance() {
      const provider = new ethers.providers.JsonRpcProvider(
        ARB_SEPOLIA_TESTNET_RPC
      );
      if (account) {
        const balance = await provider.getBalance(account);
        setBalanceETH(parseFloat(ethers.utils.formatEther(balance)).toFixed(5));
      }
    }
    getBalance();
  }, [chainId, account, balanceETH]);

  const balanceHex = useEtherBalance(account);

  const balance = useMemo(() => {
    if (balanceHex) {
      // convert string 0.004844403164078278 to number and round to 2 decimals
      console.log("balanceHex", balanceHex);
      const balance = parseFloat(ethers.utils.formatEther(balanceHex)).toFixed(
        5
      );

      return balance;
    }
  }, [balanceHex]);

  const [selectTokenPopup, setSelectTokenPopup] = useState(false);
  const [network, setNetwork] = useState({
    ethereum: true,
    bnb: false,
    zksync: false,
  });
  const [despositPopup, setDepositPopup] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState(0);
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [amount3, setAmount3] = useState("");
  const [amount4, setAmount4] = useState("");
  const [vPrivate, setVPrivate] = useState([]);
  const [nullifier, setNullifier] = useState(BigInt(0));
  const [total, setTotal] = useState("");
  const [gasPrice, setGasPrice] = useState(2);

  const handleGasChange = (e) => {
    setGasPrice(parseInt(e.target.value, 10));
  };

  const handleDepositClick = async () => {
    setDepositPopup(true);

    const { errorRN, randomNullifier } = await useGetNullifier();

    if (!errorRN) {
      setNullifier(randomNullifier);
    }
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

  useEffect(() => {
    if (amount1 !== "" && amount2 !== "" && amount3 !== "" && amount4 !== "") {
      // const total =
      //   parseFloat(amount1) +
      //   parseFloat(amount2) +
      //   parseFloat(amount3) +
      //   parseFloat(amount4);

      const amount11 = ethers.utils.parseEther(amount1);
      const amount22 = ethers.utils.parseEther(amount2);
      const amount33 = ethers.utils.parseEther(amount3);
      const amount44 = ethers.utils.parseEther(amount4);

      const totalEther = amount11.add(amount22).add(amount33).add(amount44);

      // convert to string
      const totalEther2 = ethers.utils.formatEther(totalEther);

      // if (total == V_TOTAL) {
      setTotal(String(totalEther2));

      setVPrivate([
        BigInt(parseFloat(amount1) * 10 ** 18),
        BigInt(parseFloat(amount2) * 10 ** 18),
        BigInt(parseFloat(amount3) * 10 ** 18),
        BigInt(parseFloat(amount4) * 10 ** 18),
      ]);
      console.log("vPrivate", vPrivate);
      // } else {
      //   setTotal("0");
      // }
    } else {
      setTotal("0");
    }
  }, [amount1, amount2, amount3, amount4]);
  console.log("total", total);

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

      {despositPopup && (
        <DepositPopup
          setDepositPopup={setDepositPopup}
          selectedToken={selectedToken}
          setGasPrice={setGasPrice}
          amount1={amount1}
          amount2={amount2}
          amount3={amount3}
          amount4={amount4}
          total={total}
          gasPrice={gasPrice}
          nullifier={String(nullifier)}
        />
      )}

      <div className=" md:w-[50%] w-[95%]  mx-auto ">
        <div className="text-white flex flex-col gap-4  my-24  border-features py-8">
          <div className="flex flex-row text-sm justify-between mx-6">
            <div className="flex flex-row gap-1 cursor-pointer">
              {selectedToken == "" ? (
                <>
                  <div
                    className="text-black flex flex-row"
                    onClick={() => setSelectTokenPopup(true)}
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
                  <div className="my-auto"> BNB </div>
                </>
              ) : (
                <>
                  <div className="-mt-1">
                    <UsdtItem />
                  </div>
                  <div className="my-auto"> USDT </div>
                </>
              )}
            </div>
            {balanceETH !== "" ? (
              selectedToken === "eth" ? (
                <div className="text-black">Balance: {balanceETH} ETH</div>
              ) : (
                <div className="text-black"></div>
              )
            ) : (
              <div className="text-black">Balance: {balance} ETH</div>
            )}
          </div>
          {/* input  */}

          {/* <input
            className=" mx-6 bg-transparent  rounded-md px-4 py-3"
            placeholder="0.00"
            value={amount}
            style={{
              background: "#142631",
            }}
          /> */}

          {/* <div className="text-black text-left mx-6 ">Path</div> */}
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

          <div className="mx-6 flex flex-col gap-4 mt-4">
            <div className="flex flex-row justify-between">
              <div className="text-black">Total Deposit</div>
              <div className="relative group my-auto">
                <Introduction />

                {/* <div
                  className="whitespace-nowrap text-sm px-24 py-16 absolute ml-4 hidden group-hover:flex  text-white rounded-lg"
                  style={{
                    background: "#334155",
                    left: "99%", // Đặt vị trí ở bên phải
                    top: "100%", // Duy trì giữa theo chiều dọc
                    transform: "translateY(-50%)", // Dịch chuyển để đảm bảo giữa chiều dọc
                  }}
                >
                  <div
                    className="absolute w-0 h-0"
                    style={{
                      left: "-25px", // Điều chỉnh vị trí của mũi nhọn trỏ
                      top: "50%",
                      transform: "translateY(-50%)",
                      borderTop: "0px solid transparent",
                      borderBottom: "20px solid transparent",
                      borderRight: "25px solid #334155", // Màu của mũi nhọn trỏ
                      content: "''",
                      display: "inline-block",
                    }}
                  />
                </div> */}
              </div>
            </div>
            <input
              className="w-full bg-transparent  rounded-xl px-3 py-3 text-center text-black font-semibold"
              placeholder="0"
              value={total}
              style={{
                background: "#EEEEEE",
              }}
              disabled
            />
          </div>

          <div
            className={[
              "  cursor-pointer text-center items-center justify-center px-3 py-3 mx-6 mt-4",
              "deposit-button text-white hover:text-black",
            ].join(" ")}
            onClick={() => handleDepositClick()}
          >
            Deposit
          </div>
        </div>
      </div>
    </>
  );
};
