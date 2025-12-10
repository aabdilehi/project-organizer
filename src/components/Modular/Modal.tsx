import React, { ReactElement, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export const Modal = ({
  open,
  setOpen,
  bodyStyle,
  modalStyle,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  setOpen: (open: boolean) => void;
  bodyStyle?: React.CSSProperties;
  modalStyle?: React.CSSProperties;
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      const isTarget = target == innerRef.current;

      const containsTarget =
        innerRef.current && innerRef.current.contains(target);

      if (!isTarget && !containsTarget) setOpen(false);
    };
    window.addEventListener("mouseup", handleClick);
    return () => {
      window.removeEventListener("mouseup", handleClick);
    };
  }, []);


  return open
    ? ReactDOM.createPortal(
        <div
          ref={outerRef}
          className="modal"
          style={modalStyle}
          onWheel={(e) => {
            e.stopPropagation();
          }}
          onDragStart={(e) => {
            e.stopPropagation();
          }}
          onContextMenu={(e) => {
            e.stopPropagation();
          }}
          onContextMenuCapture={(e) => {
            e.stopPropagation();
          }}
        >
          <span ref={innerRef} className="modal-body" style={bodyStyle} >
            {props.children}
          </span>
        </div>,
        document.querySelector("#root")!
      )
    : undefined;
};
