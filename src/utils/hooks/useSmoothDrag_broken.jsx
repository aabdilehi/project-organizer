import { useRef, useState } from "react";

// Still need to separate the element from column as column is a positioned element
// Probably just get the boardId and updateParent on dragStart to board

export function useSmoothDrag({
  boardId,
  boardRef,
  elementRef,
  initialCoords,
  shouldAnimate = true, // whether to smooth drag or not
  shouldPosition = true, // whether to use the actual position or (0,0) for coords
  item,
  offset = { x: 0, y: 0 }, // board's position after panning
  scale = 1, // board's scale after zooming
  lerpValue = 0.35, // speed at which the element should follow the mouse
}) {
  // offset between top left of dragged element and actual mouse position
  let initialOffsetX = useRef(0);
  let initialOffsetY = useRef(0);

  let [initialOffsets, setInitialOffsets] = useState({});

  // SELECTED NODE REFS
  let [selectedNodes, setSelectedNodes] = useState({});

  // mouse position
  let mouseX = useRef(initialCoords.x);
  let mouseY = useRef(initialCoords.y);

  // linearly interpolated mouse position
  let lerpedMouseX = useRef(initialCoords.x);
  let lerpedMouseY = useRef(initialCoords.y);

  let isDragging = useRef(false);

  const handleDragStart = (event) => {
    event.stopPropagation();
    console.log("Dragging start");
    if (
      // elementRef.current === null ||
      boardRef.current === null
      // event.currentTarget !== elementRef.current
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

    console.log(Object.values(selectedNodes)[0]);

    // send initial offset to drop zone
    item.offset = { x: initialOffsetX.current, y: initialOffsetY.current };

    event.dataTransfer.dropEffect = "move";

    // remove or hide drag preview image
    const prev = document.createElement("span");
    prev.style.display = "none";
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleDrag = (event) => {
    event.stopPropagation();
    // console.log(event.touches[0]);
    if (
      elementRef.current === null ||
      boardRef.current === null ||
      event.target !== elementRef.current
    ) {
      return;
    }

    // prevent mouse events so that drop can function properly
    // could not drop in columns without wonky z-index stuff before this
    // not actually sure why this works
    elementRef.current.style.pointerEvents = "none";

    // where element should go relative to board bounds, position, size and initial offset
    const boundingRect = boardRef.current.getBoundingClientRect();
    mouseX.current =
      (event.clientX - boundingRect.left) / scale - initialOffsetX.current;
    mouseY.current =
      (event.clientY - boundingRect.top) / scale - initialOffsetY.current;
  };

  const handleDragEnd = (event) => {
    event.stopPropagation();
    elementRef.current.style.pointerEvents = "all";
    isDragging.current = false;
  };

  const animate = () => {
    if (
      //elementRef.current !== null &&
      boardRef.current !== null &&
      shouldAnimate
    ) {
      if (isDragging.current) {
        // "interpolate" between current value and desired value
        // might want to ease instead of lerp for more satisfying dragging but that can wait
        lerpedMouseX.current +=
          (mouseX.current - lerpedMouseX.current) * lerpValue;
        lerpedMouseY.current +=
          (mouseY.current - lerpedMouseY.current) * lerpValue;

        // mouse and lerpedMouse pos will reset if you exit the bounds of the window
        // so do not transform the elementRef if that is the case
        // cannot drop outside of window anyway so it will just return to where it was pre-drag
        if (lerpedMouseX.current !== 0 && lerpedMouseY.current !== 0) {
          Object.values(selectedNodes).forEach((ref) => {
            ref.current.style.position = "absolute";
            ref.current.style.transform = `translate(${lerpedMouseX.current}px, ${lerpedMouseY.current}px)`;
          });
          // elementRef.current.style.position = "absolute";
          // elementRef.current.style.transform = `translate(${lerpedMouseX.current}px, ${lerpedMouseY.current}px)`;
        }
      } else {
        // shouldPosition is usually only false if the element is in a column
        Object.values(selectedNodes).forEach((ref) => {
          ref.current.style.position = shouldPosition ? "absolute" : "relative";
          ref.current.style.transform = `translate(${
            shouldPosition ? initialCoords.x : 0
          }px, ${shouldPosition ? initialCoords.y : 0}px)`;
        });
        // elementRef.current.style.position = shouldPosition
        //   ? "absolute"
        //   : "relative";
        // elementRef.current.style.transform = `translate(${
        //   shouldPosition ? initialCoords.x : 0
        // }px, ${shouldPosition ? initialCoords.y : 0}px)`;
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
    selectedNodes,
    setSelectedNodes,
  };
}
