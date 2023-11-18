import { useCallback, useContext, useEffect, useRef } from "react";
import { SelectedNodeContext } from "../../App";
import { useSelector } from "react-redux";

export function useSmoothDrag({
  boardRef,
  offset = { x: 0, y: 0 }, // board's position after panning
  scale = 1, // board's scale after zooming
  lerpValue = 0.35, // speed at which the element should follow the mouse
}) {
  // offset between top left of dragged element and actual mouse position
  // let initialOffsetX = useRef(0);
  // let initialOffsetY = useRef(0);

  const selectedNodes = useSelector((state) => state.selection);
  const nodeData = useSelector((state) => {
    const data = {};
    Object.keys(selectedNodes).forEach((key) => {
      data[key] = state[`${selectedNodes[key]}s`][key];
    });
    return data;
  });

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
    // console.log("Dragging start");
    if (boardRef.current === null) {
      return;
    }

    isDragging.current = true;

    const boundingRect = boardRef.current.getBoundingClientRect();
    mouseX.current = (event.clientX - boundingRect.left) / scale;
    mouseY.current = (event.clientY - boundingRect.top) / scale;

    lerpedMouseX.current = mouseX.current;
    lerpedMouseX.current = mouseY.current;

    const item = nodeData;

    Object.keys(item).forEach((key) => {
      const node = document.querySelector(`[nodeId="${key}"]`);

      if (!!node) {
        const elementBoundingBox = node.getBoundingClientRect();

        initialOffsets.current = {
          ...initialOffsets.current,
          [key]: {
            x: (event.clientX - elementBoundingBox.left) / scale + offset.x,
            y: (event.clientY - elementBoundingBox.top) / scale + offset.y,
          },
        };

        // send initial   offset to drop zone
        // item.offset = { x: initialOffsetX.current, y: initialOffsetY.current };

        item[key] = { ...item[key], offset: initialOffsets.current[key] };

        // console.log(item[key]);
      }
    });
    event.dataTransfer.dropEffect = "move";

    // remove or hide drag preview image
    const prev = document.createElement("span");
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleDrag = (event) => {
    event.stopPropagation();
    // console.log(event.touches[0]);
    if (boardRef.current === null) {
      return;
    }

    // console.log(event.dataTransfer.getData("application/json"));

    Object.keys(selectedNodes).forEach((key) => {
      const node = document.querySelector(`[nodeId="${key}"]`);
      if (!!node) {
        node.style.pointerEvents = "none";
        node.style.zIndex = "100";
      }
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
    Object.keys(selectedNodes).forEach((key) => {
      const node = document.querySelector(`[nodeId="${key}"]`);
      if (!!node) {
        node.style.pointerEvents = "all";
        node.style.zIndex = "3";
      }
    });
    isDragging.current = false;
  };

  const animateCallback = useCallback(() => {
    if (boardRef.current !== null) {
      if (isDragging.current) {
        lerpedMouseX.current +=
          (mouseX.current - lerpedMouseX.current) * lerpValue;
        lerpedMouseY.current +=
          (mouseY.current - lerpedMouseY.current) * lerpValue;

        //console.log(initialOffsets.current);
        Object.keys(selectedNodes).forEach((key) => {
          const el = document.querySelector(`[nodeId="${key}"]`);

          if (
            !!el &&
            lerpedMouseX.current !== 0 &&
            lerpedMouseY.current !== 0 &&
            !!initialOffsets.current &&
            !!initialOffsets.current[key]
          ) {
            el.style.position = "absolute";
            el.style.transform = `translate(${
              lerpedMouseX.current - initialOffsets.current[key].x
            }px, ${lerpedMouseY.current - initialOffsets.current[key].y}px)`;
          }
        });
      }
    }

    requestAnimationFrame(animate);
  }, [
    boardRef.current,
    mouseX.current,
    mouseY.current,
    selectedNodes,
    initialOffsets.current,
  ]);

  const animate = () => {
    // const frameId = requestAnimationFrame(animate);
    if (boardRef.current !== null) {
      if (isDragging.current) {
        lerpedMouseX.current +=
          (mouseX.current - lerpedMouseX.current) * lerpValue;
        lerpedMouseY.current +=
          (mouseY.current - lerpedMouseY.current) * lerpValue;

        //console.log(initialOffsets.current);
        Object.keys(selectedNodes).forEach((key) => {
          const el = document.querySelector(`[nodeId="${key}"]`);

          if (
            !!el &&
            lerpedMouseX.current !== 0 &&
            lerpedMouseY.current !== 0 &&
            !!initialOffsets.current &&
            !!initialOffsets.current[key]
          ) {
            el.style.position = "absolute";
            el.style.transform = `translate(${
              lerpedMouseX.current - initialOffsets.current[key].x
            }px, ${lerpedMouseY.current - initialOffsets.current[key].y}px)`;
          }
        });
      }
      // if (
      //   lerpedMouseX.current !== mouseX.current &&
      //   lerpedMouseY.current !== mouseY.current
      // ) {
      // }
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
