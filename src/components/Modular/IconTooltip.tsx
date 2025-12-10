// Not sure what to call this but it is basically an icon that you can hover on and get more info in a tooltip

import React, { ForwardedRef, useState } from "react";
import { forwardRef } from "react";

export const Tooltip = forwardRef(
  (
    {
      text,
      placement = "bottom",
      position,
    }: {
      text: string;
      placement?: "top" | "bottom" | "right" | "custom";
      position?: string;
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div ref={ref} className={`tooltip ${placement}`} role="menu">
        <p>{text}</p>
      </div>
    );
  }
);


export const TooltipWrapper = ({
  name,
  children,
  placement = "right",
}: (
  | React.HTMLAttributes<HTMLDivElement>
  | React.ButtonHTMLAttributes<HTMLButtonElement>
) & {
  name: string;
  placement?: "left" | "right" | "top" | "bottom" | "custom";
}) => {
  const [tooltipVisible, setToolTopVisible] = useState(false);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        position: "relative",
        height: "fit-content",
        width: "fit-content",
      }}
    >
      <span
        onMouseEnter={() => setToolTopVisible(true)}
        onMouseLeave={() => setToolTopVisible(false)}
      >
        {children}
      </span>
      {tooltipVisible && <Tooltip text={name} placement={placement} />}
    </div>
  );
};
