import React from "react";

import { useRef } from "react";
import { BoardObjects } from "../enums/items";

// Still need to separate the element from column as column is a positioned element
// Probably just get the boardId and updateParent on dragStart to board

export function useSmoothDrag({
  boardId,
  boardRef,
  elementRef,
  initialCoords,
  shouldAnimate = true,
  shouldPosition = true,
  item,
  offset = { x: 0, y: 0 },
  scale = 1,
  lerpValue = 0.35,
}) {
  let initialOffsetX = useRef(0);
  let initialOffsetY = useRef(0);
  let mouseX = useRef(initialCoords.x);
  let mouseY = useRef(initialCoords.y);
  let lerpedMouseX = useRef(initialCoords.x);
  let lerpedMouseY = useRef(initialCoords.y);
  let isDragging = useRef(false);

  const handleDragStart = (event) => {
    console.log(event.target);
    if (
      elementRef.current === null ||
      boardRef.current === null ||
      event.target !== elementRef.current
    ) {
      return;
    }

    isDragging.current = true;
    const elementBoundingBox = elementRef.current.getBoundingClientRect();
    const initialMouseX = event.clientX;
    const initialMouseY = event.clientY;
    initialOffsetX.current =
      (initialMouseX - elementBoundingBox.left) / scale + offset.x;
    initialOffsetY.current =
      (initialMouseY - elementBoundingBox.top) / scale + offset.y;

    item.offset = { x: initialOffsetX.current, y: initialOffsetY.current };
    event.dataTransfer.dropEffect = "move";
    const clone = document.createElement("span");
    clone.style.display = "none";
    event.dataTransfer.setDragImage(clone, 0, 0);
    event.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleDrag = (event) => {
    console.log("Hello");
    if (
      elementRef.current === null ||
      boardRef.current === null ||
      event.target !== elementRef.current
    ) {
      return;
    }

    elementRef.current.style.pointerEvents = "none";
    const boundingRect = boardRef.current.getBoundingClientRect();
    mouseX.current =
      (event.clientX - boundingRect.left) / scale - initialOffsetX.current;
    mouseY.current =
      (event.clientY - boundingRect.top) / scale - initialOffsetY.current;
  };

  const handleDragEnd = (event) => {
    console.log("BYYEEE");

    elementRef.current.style.pointerEvents = "all";
    isDragging.current = false;
  };

  const animate = () => {
    if (
      elementRef.current !== null &&
      boardRef.current !== null &&
      shouldAnimate
    ) {
      if (isDragging.current) {
        lerpedMouseX.current +=
          (mouseX.current - lerpedMouseX.current) * lerpValue;
        lerpedMouseY.current +=
          (mouseY.current - lerpedMouseY.current) * lerpValue;

        if (lerpedMouseX.current !== 0 && lerpedMouseY.current !== 0) {
          elementRef.current.style.position = "absolute";
          elementRef.current.style.transform = `translate(${lerpedMouseX.current}px, ${lerpedMouseY.current}px)`;
        }
      } else {
        //position={isInColumn ? "relative" : "absolute"}
        elementRef.current.style.position = shouldPosition
          ? "absolute"
          : "relative";
        elementRef.current.style.transform = `translate(${
          shouldPosition ? initialCoords.x : 0
        }px, ${shouldPosition ? initialCoords.y : 0}px)`;
      }
    }

    requestAnimationFrame(animate);
  };

  return {
    handleDragStart,
    handleDrag,
    handleDragEnd,
    animate,
    isDragging,
  };
}
