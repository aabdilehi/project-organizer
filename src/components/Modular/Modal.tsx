import React, { ReactElement, useRef } from "react";
import ReactDOM from "react-dom";

export const Modal = ({
  open,
  setOpen,
  ...props
}: {
  open: boolean;
  setOpen: (boolean) => void;
  children: ReactElement[];
}) => {
  const outerRef = useRef<HTMLDivElement>();
  const innerRef = useRef<HTMLSpanElement>();
  return open
    ? ReactDOM.createPortal(
        <div
          ref={outerRef}
          className="modal"
          onClick={(e) => {
            setOpen(false);
          }}
        >
          <span
            ref={innerRef}
            className="modal-body"
            onClick={(e) => e.stopPropagation()}
          >
            {props.children}
          </span>
        </div>,
        document.querySelector("#root")
      )
    : undefined;
};
