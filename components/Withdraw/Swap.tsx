import { EthItem } from "../Util/eth";
import { BnbItem } from "../Util/bnb";
import { UsdtItem } from "../Util/usdt";

interface SwapProps {
  setSelectTargetTokenPopup?: (value: boolean) => void;
  selectedTargetToken?: string;
}

export const SwapToken = (props: SwapProps) => {
  return (
    <>
      <div className="flex flex-row text-sm justify-end mt-6 mx-6">
        <div
          className="flex flex-row gap-1 cursor-pointer"
          onClick={() => props.setSelectTargetTokenPopup(true)}
        >
          {props.selectedTargetToken == "" ? (
            <>
              <div className="text-black"> Select Target Token </div>

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
          ) : props.selectedTargetToken === "eth" ? (
            <>
              <div className="-mt-1">
                <EthItem />
              </div>
              <div className="my-auto text-black"> ETH </div>
            </>
          ) : props.selectedTargetToken === "bnb" ? (
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
        className="mx-6 bg-transparent rounded-md px-4 py-3 text-center text-black "
        placeholder="Amount out min"
        value=""
        // type="password"
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
          <div className="text-black">---</div>
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
          <div className="text-black">---</div>
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
          <div className="text-black">---</div>
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
          <div className="text-black">---</div>
        </div>

        <div
          className={[
            " cursor-pointer text-center items-center px-3 py-3 justify-center ",
            "deposit-button text-white hover:text-black",
          ].join(" ")}
          onClick={() => {}}
        >
          Swap
        </div>
      </div>
    </>
  );
};
