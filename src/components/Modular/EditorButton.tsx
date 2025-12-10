// tooltip

// button that takes label, icon, and onclick
// plus create css class for this and add rules for first and last button

// Not sure what to call this but it is basically an icon that you can hover on and get more info in a tooltip

import React, { ForwardedRef } from "react";
import { forwardRef, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { IconType } from "react-icons";
import IconButton from "./IconButton";
import { TooltipWrapper } from "./IconTooltip";

export const Tooltip = forwardRef(
  (
    {
      text,
      placement = "bottom",
      visible = false,
    }: {
      text: string;
      placement?: "top" | "bottom";
      visible?: boolean;
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div
        ref={ref}
        className={`tooltip ${placement} ${!visible && "hidden"}`}
        role="menu"
        aria-label={text}
      >
        <p>{text}</p>
      </div>
    );
  }
);

export const EditorButton = ({
  icon: Icon,
  label,
  ariaLabel,
  onClick,
  onMouseDown,
  onMouseUp,
  disabled = false, // standard button disabled prop
  active = false, // whether the effect of the button is active, e.g. if this is the bold button and the selected text is bold then its active
  backgroundColor,
  iconColor,
}: {
  icon: IconType;
  label: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onMouseUp?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean;
  active?: boolean;
  backgroundColor?: string;
  iconColor?: string;
}) => {
  return (
    <TooltipWrapper name={label} placement="bottom">
      <IconButton
        className={`editor-button${disabled ? ` disabled` : ""}${
          active ? ` active` : ""
        }`}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        style={{ backgroundColor }}
        icon={Icon}
        iconProps={{
          className: "icon",
          size: 16,
          color: iconColor,
        }}
      />
    </TooltipWrapper>
  );
};
