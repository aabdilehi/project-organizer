import React from "react";
import { IconBaseProps, IconType } from "react-icons";

export default ({
  icon: Icon,
  iconProps,
  ...buttonProps
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconType;
  iconProps?: IconBaseProps;
}) => {
  return (
    <button type="button" {...buttonProps}>
      <Icon
        className="icon"
        style={{ justifySelf: "center", alignSelf: "center" }}
        {...iconProps}
      />
    </button>
  );
};
