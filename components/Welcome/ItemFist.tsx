import { shortenIfAddress } from "@usedapp/core";
import { FC } from "react";

export type ItemFirstProps = {
  context?: string;
  onClick?: () => void;
};

// 76  146 218
export const ItemFirst: FC<ItemFirstProps> = (props) => {
  return (
    <svg
      width="394"
      height="706"
      viewBox="0 0 394 706"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.3" filter="url(#filter0_f_245_477)">
        <circle cx="394" cy="312" r="160" fill="#4070E9" />
      </g>
      <defs>
        <filter
          id="filter0_f_245_477"
          x="0"
          y="-82"
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
            result="effect1_foregroundBlur_245_477"
          />
        </filter>
      </defs>
    </svg>
  );
};
