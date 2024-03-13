import React from "react";

import { DAppProvider } from "@usedapp/core";
import { ArbitrumSepolia } from "../packages/core/src/model/chain/arbitrum";
// import { getDefaultProvider } from "ethers";

const config = {
  readOnlyChainId: ArbitrumSepolia.chainId,
  readOnlyUrls: {
    [ArbitrumSepolia.chainId]: "https://sepolia-rollup.arbitrum.io/rpc",
  },
};

function Web3Layout(props) {
  return <DAppProvider config={config}>{props.children}</DAppProvider>;
}

export { Web3Layout };
