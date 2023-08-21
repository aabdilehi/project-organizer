import { useCallback, useContext, useEffect, useRef } from "react";
import { SelectedNodeContext } from "../../App";

export function useSmoothDrag({
  boardRef,
  offset = { x: 0, y: 0 }, // board's position after panning
  scale = 1, // board's scale after zooming
  lerpValue = 0.35, // speed at which the element should follow the mouse
}) {
  // offset between top left of dragged element and actual mouse position
  // let initialOffsetX = useRef(0);
  // let initialOffsetY = useRef(0);

  const { selectedNodeRefs, selectedNode } = useContext(SelectedNodeContext);

  let isDragging = useRef(false);

  let initialOffsets = useRef();

  // mouse position
  let mouseX = useRef(0); // was initial coords
  let mouseY = useRef(0); // was initial coords

  // linearly interpolated mouse position
  let lerpedMouseX = useRef(0); // was initial coords
  let lerpedMouseY = useRef(0); // was initial coords

  const handleDragStart = (event) => {
    event.stopPropagation();
    initialOffsets.current = {};
    console.log("Dragging start");
    if (boardRef.current === null) {
      return;
    }

    isDragging.current = true;

    const boundingRect = boardRef.current.getBoundingClientRect();
    mouseX.current = (event.clientX - boundingRect.left) / scale;
    mouseY.current = (event.clientY - boundingRect.top) / scale;

    lerpedMouseX.current = mouseX.current;
    lerpedMouseX.current = mouseY.current;

    Object.keys(selectedNodeRefs).forEach((key) => {
      const elementBoundingBox =
        selectedNodeRefs[key].current.getBoundingClientRect();

      initialOffsets.current = {
        ...initialOffsets.current,
        [key]: {
          x: (event.clientX - elementBoundingBox.left) / scale + offset.x,
          y: (event.clientY - elementBoundingBox.top) / scale + offset.y,
        },
      };

      // send initial offset to drop zone
      // item.offset = { x: initialOffsetX.current, y: initialOffsetY.current };
      selectedNode[key].offset = initialOffsets.current[key];
    });

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
    // console.log(event.touches[0]);
    if (boardRef.current === null) {
      return;
    }

    Object.keys(selectedNodeRefs).forEach((key) => {
      selectedNodeRefs[key].current.style.pointerEvents = "none";
    });
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
    Object.keys(selectedNodeRefs).forEach((key) => {
      selectedNodeRefs[key].current.style.pointerEvents = "all";
    });
    isDragging.current = false;
  };

  const animate = () => {
    if (boardRef.current !== null) {
      if (isDragging.current) {
        lerpedMouseX.current +=
          (mouseX.current - lerpedMouseX.current) * lerpValue;
        lerpedMouseY.current +=
          (mouseY.current - lerpedMouseY.current) * lerpValue;

        //console.log(initialOffsets.current);
        Object.keys(selectedNodeRefs).forEach((key) => {
          const el = selectedNodeRefs[key].current;

          if (
            !!el &&
            lerpedMouseX.current !== 0 &&
            lerpedMouseY.current !== 0
          ) {
            el.style.position = "absolute";
            el.style.transform = `translate(${
              lerpedMouseX.current - initialOffsets.current[key].x
            }px, ${lerpedMouseY.current - initialOffsets.current[key].y}px)`;
          }
        });
      }
      requestAnimationFrame(animate);
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
