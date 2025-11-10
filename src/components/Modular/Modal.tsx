import React, { ReactElement, useRef } from "react";
import ReactDOM from "react-dom";

export const Modal = ({
  open,
  setOpen,
  bodyStyle,
  modalStyle,
  ...props
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: ReactElement[];
  bodyStyle?: React.CSSProperties;
  modalStyle?: React.CSSProperties;
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const mouseDownRef = useRef<EventTarget>(); // really not sure why but cannot just use click and use stoppropagation on inner components
  return open
    ? ReactDOM.createPortal(
        <div
          ref={outerRef}
          className="modal"
          style={modalStyle}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (e.button == 0) {
              mouseDownRef.current = e.target;
            }
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (mouseDownRef.current == outerRef.current && e.button == 0) {
              setOpen(false);
            }
          }}
          onContextMenu={(e) => {
            e.stopPropagation();
          }}
          onContextMenuCapture={(e) => {
            e.stopPropagation();
          }}
        >
          <span ref={innerRef} className="modal-body" style={bodyStyle}>
            {props.children}
          </span>
        </div>,
        document.querySelector("#root")!
      )
    : undefined;
};
