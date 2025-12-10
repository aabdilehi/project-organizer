import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";
const FloatingMenu = ({
  open,
  setOpen,
  children,
  ...props
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      const isTarget = target == ref.current;

      const containsTarget =
        ref.current && ref.current.contains(target);

      if (!isTarget && !containsTarget) setOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return open
    ? <div
          {...props}
          style={{
            ...props.style,
          }}
          ref={ref}
          
      onWheel={(e) => {
        e.stopPropagation();
      }}
      draggable={true}
      onDragStart={(e) => {e.stopPropagation(); e.preventDefault();}} 
        >
            {children}
        </div>
    : undefined;
};

export default FloatingMenu;
