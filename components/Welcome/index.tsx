import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

import styles from "./index.module.css";

// import { useContractFunction, useEthers } from "@usedapp/core";

import { ItemFirst } from "./ItemFist";
import { ItemSecond } from "./ItemSecond";
import { Deposit } from "../Deposit";
import { Withdraw } from "../Withdraw";

import {
  shortenIfAddress,
  useEtherBalance,
  useEthers,
  BSCTestnet,
} from "@usedapp/core";
import { ArbitrumSepolia } from "../../packages/core/src/model/chain/arbitrum";
//  use react spring for animation
import { useSpring, animated } from "react-spring";

import { useMediaQuery } from "react-responsive";

export type WelcomeProps = PropsWithChildren<{}>;

export const Welcome: FC<WelcomeProps> = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const { switchNetwork, chainId, account, deactivate, activateBrowserWallet } =
    useEthers();

  // useEffect(() => {
  //   if (!chainId) {
  //     switchNetwork(ArbitrumSepolia.chainId).then(() =>
  //       activateBrowserWallet()
  //     );
  //   }
  // }, [chainId]);

  const [visibility, setVisibility] = useState({
    deposit: true,
    withdraw: false,
  });

  const handleCollapse = (button) => {
    if (button === "deposit") {
      setVisibility({
        deposit: true,
        withdraw: false,
      });
    } else if (button === "withdraw") {
      setVisibility({
        deposit: false,
        withdraw: true,
      });
    }
  };

  // const token = useContract("Token");
  // const claim = useContractFunction(token, "claim");

  return (
    <div
      id="home"
      style={{
        backgroundColor: "rgba(0,0,0,0)",
      }}
    >
      <div
        className={[
          "text-center pt-24 relative",
          "mx-auto",
          // "container",
          // styles.container,
        ].join(" ")}
      >
        <div className="absolute right-[0%] top-[5%] ">
          <ItemFirst />
        </div>
        <div className="absolute left-[0%] bottom-[-10%] ">
          <ItemSecond />
        </div>
        {/* <div className="absolute left-[5%] top-[70%]  md:block hidden">
          <ItemThird />
        </div>
        <div className="absolute right-[10%] top-[80%]">
          <ItemFourth />
        </div>
        <div className="absolute left-[10%] top-[100%]">
          <ItemFifth />
        </div>
        <div className="absolute right-[30%] top-[110%]">
          <ItemSeventh />
        </div> */}
        <div
          className={[
            "relative mt-10 lg:mt-0 flex flex-col justify-center   items-center text-center  gap-12 w-1/3 mx-auto",
          ].join(" ")}
        >
          <div className="md:text-4xl text-3xl whitespace-nowrap font-semibold text-black  ">
            Blender Swap
          </div>
          <div
            className="text-xl md:text-5xl flex"
            style={{
              background: "rgb(249, 251, 255)",
              borderRadius: "6px",
              border: "1px solid #4070e9",
            }}
          >
            <div
              className={[
                " md:text-base text-base cursor-pointer text-center items-center justify-center flex-1 whitespace-nowrap",
                visibility.deposit ? "active-button" : "disabled-btn",
              ].join(" ")}
              onClick={() => handleCollapse("deposit")}
            >
              Deposit
            </div>
            <div
              className={[
                " md:text-base text-base text-center cursor-pointer items-center justify-center flex-1 whitespace-nowrap",
                visibility.withdraw ? "active-button" : "disabled-btn",
              ].join(" ")}
              onClick={() => handleCollapse("withdraw")}
            >
              Withdraw
            </div>
          </div>
        </div>

        {visibility.deposit && <Deposit />}

        {visibility.withdraw && <Withdraw />}
      </div>
    </div>
  );
};
