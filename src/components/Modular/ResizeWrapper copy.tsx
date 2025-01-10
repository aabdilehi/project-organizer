import React, { LegacyRef, useEffect } from "react";
import { useLayoutEffect, useRef } from "react";

export default ({
  resizeRef,
  canResize = false,
  pX,
  pY,
  onResize,
  ...props
}: {
  canResize?: boolean;
  onResize: (props: any[]) => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const resizeType = useRef();
  const resizeOrigin = useRef();
  const initialWidth = useRef(0);
  const initialHeight = useRef(0);
  const initialCoords = useRef({ x: 0, y: 0 });
  const initialBounds = useRef<DOMRect>();
  const handleDrag = (e) => {
    // Get initial width/height
    e.stopPropagation();
    if (!resizeType.current || !resizeOrigin.current || !resizeRef.current)
      return;
    console.log("Mouse move");

    let newWidth =
      resizeType.current == "horizontal" || resizeType.current == "both"
        ? initialWidth.current + (e.clientX - initialCoords.current.x)
        : initialWidth.current;
    let newHeight =
      resizeType.current == "vertical" || resizeType.current == "both"
        ? initialHeight.current + (e.clientY - initialCoords.current.y)
        : initialHeight.current;

    const animate = () => {
      if (
        resizeOrigin.current == "top" ||
        resizeOrigin.current == "top-left" ||
        resizeOrigin.current == "top-right" ||
        resizeOrigin.current == "left" ||
        resizeOrigin.current == "top-left" ||
        resizeOrigin.current == "bottom-left"
      ) {
        resizeRef.current.style.width = newWidth + "px";
        resizeRef.current.style.height = newHeight + "px";
        console.log(
          initialBounds.current.left + (newWidth - initialWidth.current)
        );

        resizeRef.current.style.transform = `translate(${
          pX + newWidth - initialWidth.current
        }px, ${pY + (newHeight - initialHeight.current)}px)`;
      }
    };
    requestAnimationFrame(animate);
  };

  useLayoutEffect(() => {
    console.log(resizeRef);
  }, []);
  const handleDragStart = (e) => {
    console.log("DOES THIS WORK?");
    e.stopPropagation();

    resizeType.current = e.target.getAttribute("data-resize-type") ?? undefined;
    resizeOrigin.current =
      e.target.getAttribute("data-resize-origin") ?? undefined;
    if (!resizeType.current || !resizeOrigin.current) return;

    initialBounds.current = resizeRef.current.getBoundingClientRect();
    initialWidth.current = initialBounds?.current.width;
    initialHeight.current = initialBounds?.current.height;
    initialCoords.current = { x: e.clientX, y: e.clientY };
  };
  return (
    <>
      <div
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        data-resize-type={"horizontal"}
        data-resize-origin={"left"}
        className="resize-handle left"
        tabIndex={99}
      />

      <div
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        data-resize-type={"vertical"}
        data-resize-origin={"top"}
        className="resize-handle top"
        tabIndex={99}
      />
    </>
  );
};
