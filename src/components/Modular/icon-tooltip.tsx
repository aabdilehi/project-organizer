// Not sure what to call this but it is basically an icon that you can hover on and get more info in a tooltip

import {
  Ref,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { IconType } from "react-icons";

export const Tooltip = forwardRef(
  (
    {
      text,
      placement = "bottom",
      position,
    }: {
      text: string;
      placement?: "top" | "bottom" | "custom";
      position?: string;
    },
    ref
  ) => {
    const placementStyle = useCallback(() => {
      switch (placement) {
        case "top":
          return "mt-[-235%] left-1/2 translate-x-[-50%]";
        case "custom":
          return !!position && position;
        case "bottom":
        default:
          return "mt-[35%] left-1/2 translate-x-[-50%]";
      }
    }, [placement]);

    return (
      <div
        ref={ref}
        className={`bg-white p-2 ring-1 rounded-md ring-gray-300 z-10 absolute w-fit  min-w-8 ${placementStyle()}`}
        role="menu"
      >
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
  const iconRef = useRef();

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
