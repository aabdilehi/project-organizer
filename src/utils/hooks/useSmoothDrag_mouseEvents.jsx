import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SelectedNodeContext } from "../../App";
import { cloneElement } from "react";

export function useSmoothDrag({
  boardRef,
  transformRef,
  offset = { x: 0, y: 0 }, // board's position after panning
  scale = 1, // board's scale after zooming
  lerpValue = 0.35, // speed at which the element should follow the mouse
}) {
  // offset between top left of dragged element and actual mouse position
  // let initialOffsetX = useRef(0);
  // let initialOffsetY = useRef(0);

  const { selectedNodeRefs, selectedNode } = useContext(SelectedNodeContext);
  const clonedRefs = useRef();
  const cloneContainer = useRef();

  let isDragging = useRef(false);

  const initialOffsets = useRef();

  // mouse position
  const mouseX = useRef(0); // was initial coords
  const mouseY = useRef(0); // was initial coords

  // linearly interpolated mouse position
  const lerpedMouseX = useRef(0); // was initial coords
  const lerpedMouseY = useRef(0); // was initial coords

  // animation ref
  const animationRef = useRef();

  const handleDragStart = (event) => {
    event.stopPropagation();
    initialOffsets.current = {};
    if (boardRef.current === null) {
      return;
    }
    animate();

    isDragging.current = true;

    const boundingRect = boardRef.current.getBoundingClientRect();
    mouseX.current = (event.clientX - boundingRect.left) / scale;
    mouseY.current = (event.clientY - boundingRect.top) / scale;

    lerpedMouseX.current = mouseX.current;
    lerpedMouseX.current = mouseY.current;
    cloneContainer.current = document.createElement("div");
    cloneContainer.current.style.position = "absolute";
    cloneContainer.current.style.pointerEvents = "none";
    clonedRefs.current = Object.keys(selectedNodeRefs).map((key) => {
      const elementBoundingBox =
        selectedNodeRefs[key].current.getBoundingClientRect();

      initialOffsets.current = {
        ...initialOffsets.current,
        [key]: {
          x: (event.clientX - elementBoundingBox.left) / scale + offset.x,
          y: (event.clientY - elementBoundingBox.top) / scale + offset.y,
        },
      };

      const dupe = selectedNodeRefs[key].current.cloneNode(true);
      dupe.style.pointerEvents = "none";
      cloneContainer.current.appendChild(dupe);
      selectedNodeRefs[key].current.style.opacity = 0;
      //selectedNodeRefs[key].current.style.visibility = "hidden";
      // send initial offset to drop zone
      // item.offset = { x: initialOffsetX.current, y: initialOffsetY.current };
      selectedNode[key].offset = initialOffsets.current[key];

      return dupe;
    });

    transformRef.current.appendChild(cloneContainer.current);

    event.dataTransfer.dropEffect = "move";

    // remove or hide drag preview image
    const prev = document.createElement("span");
    prev.style.display = "none";
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(selectedNode)
    );
  };

  const handleDrag = (event) => {
    event.stopPropagation();
    if (boardRef.current === null) {
      return;
    }
    // prevent mouse events so that drop can function properly
    // could not drop in columns without wonky z-index stuff before this
    // not actually sure why this works

    //elementRef.current.style.pointerEvents = "none";

    // where element should go relative to board bounds, position, size and initial offset
    const boundingRect = boardRef.current.getBoundingClientRect();
    mouseX.current = (event.clientX - boundingRect.left) / scale;
    mouseY.current = (event.clientY - boundingRect.top) / scale;
  };

  const handleDragEnd = (event) => {
    event.stopPropagation();
    //elementRef.current.style.pointerEvents = "all";
    clonedRefs.current.forEach((item) => {
      item.remove();
    });
    cloneContainer.current.remove();

    Object.keys(selectedNodeRefs).forEach((key) => {
      selectedNodeRefs[key].current.style.opacity = 1;
    });

    clonedRefs.current = undefined;
    isDragging.current = false;
  };

  const animate = () => {
    if (boardRef.current !== null) {
      if (isDragging.current) {
        lerpedMouseX.current +=
          (mouseX.current - lerpedMouseX.current) * lerpValue;
        lerpedMouseY.current +=
          (mouseY.current - lerpedMouseY.current) * lerpValue;

        if (
          !!cloneContainer.current &&
          lerpedMouseX.current !== 0 &&
          lerpedMouseY.current !== 0
        ) {
          cloneContainer.current.style.transform = `translate(${lerpedMouseX.current}px, ${lerpedMouseY.current}px)`;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  return {
    handleDragStart,
    handleDrag,
    handleDragEnd,
    animate,
    isDragging,
  };
}
