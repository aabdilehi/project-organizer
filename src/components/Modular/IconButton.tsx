import React from "react";
import { IconBaseProps, IconType } from "react-icons";
const IconButton = ({
  icon: Icon,
  iconProps,
  children,
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
      {children}
    </button>
  );
};

export default IconButton;
