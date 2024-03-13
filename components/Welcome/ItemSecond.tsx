import { shortenIfAddress } from "@usedapp/core";
import { FC } from "react";

export type ItemFirstProps = {
  context?: string;
  onClick?: () => void;
};

// 76  146 218
export const ItemSecond: FC<ItemFirstProps> = (props) => {
  return (
    <svg
      width="554"
      height="554"
      viewBox="0 0 554 554"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.3" filter="url(#filter0_f_245_521)">
        <circle cx="160" cy="394" r="160" fill="#91E3FE" />
      </g>
      <defs>
        <filter
          id="filter0_f_245_521"
          x="-234"
          y="0"
          width="788"
          height="788"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="117"
            result="effect1_foregroundBlur_245_521"
          />
        </filter>
      </defs>
    </svg>
  );
};
