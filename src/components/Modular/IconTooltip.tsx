// Not sure what to call this but it is basically an icon that you can hover on and get more info in a tooltip

import React, { ForwardedRef } from "react";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { IconType } from "react-icons";

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

export default ({
  icon: Icon,
  tooltip,
  tooltipPlacement,
}: {
  icon: IconType;
  tooltip: string;
  tooltipPlacement?: "top" | "bottom";
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const showToolTip = (visible: boolean) => {
    setTooltipVisible(visible);
  };

  useLayoutEffect(() => {
    if (!iconRef.current) return;
    iconRef.current?.addEventListener(
      "mouseenter",
      showToolTip.bind(this, true)
    );
    iconRef.current?.addEventListener(
      "mouseleave",
      showToolTip.bind(this, false)
    );

    return () => {
      if (!iconRef.current) return;
      iconRef.current?.removeEventListener(
        "mouseenter",
        showToolTip.bind(this, true)
      );
      iconRef.current?.removeEventListener(
        "mouseleave",
        showToolTip.bind(this, false)
      );
    };
  }, []);
  return (
    <div className="text-right relative w-fit" ref={iconRef}>
      <div className="w-full flex justify-end">
        <div className="text-center w-8 p-[5px] ring-1 ring-gray-200/50 shadow-inner text-xl rounded-md">
          <Icon className="mx-auto" />
        </div>
      </div>
      {tooltipVisible && (
        <Tooltip text={tooltip} placement={tooltipPlacement} />
      )}
    </div>
  );
};
