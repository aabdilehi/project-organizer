import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cloneElement } from "react";
import { useSelector } from "react-redux";

export function useSmoothDrag({
  boardRef,
  transformRef,
  offset = { x: 0, y: 0 }, // board's position after panning
  scale = 1, // board's scale after zooming
  lerpValue = 0.01, // speed at which the element should follow the mouse
}) {
  // offset between top left of dragged element and actual mouse position
  let initialPosition = useRef({ x: 0, y: 0 });

  // linearly interpolated mouse position
  const lerpedMouseX = useRef(0); // was initial coords
  const lerpedMouseY = useRef(0); // was initial coords

  const container = useRef();
  const originals = useRef([]);

  const selectedNodes = useSelector((state) => state.selection);
  const [draggedNodes, setDraggedNodes] = useState();

  const handleDragStart = (event) => {
    event.stopPropagation();

    if (boardRef.current === null) {
      return;
    }
    // Initial click pos
    initialPosition.current = {
      x: event.clientX,
      y: event.clientY,
    };

    setDraggedNodes(selectedNodes);
    const selectedNodeOffsets = {};
    // create drag container
    container.current = document.createElement("div");
    container.current.classList.add("clone-container");
    originals.current = Object.keys(selectedNodes).map((item) => {
      const elem = document.querySelector(`#${CSS.escape(item)}`);
      //console.log(elem);

      if (!elem) {
        selectedNodeOffsets[item] = {
          ...selectedNodes[item],
          offset: { x: 0, y: 0 },
        };
        return;
      }
      const dupe = elem.cloneNode(true);
      elem.classList.add("dragging");
      const elemBounds = elem.getBoundingClientRect();
      selectedNodeOffsets[item] = {
        ...selectedNodes[item],
        offset: {
          x:
            elemBounds.left -
            event.clientX -
            transformRef.current.getBoundingClientRect().left,
          y:
            elemBounds.top -
            event.clientY -
            transformRef.current.getBoundingClientRect().top,
        },
      };
      dupe.classList.remove("in-column");
      dupe.style.setProperty(
        "transform",
        `translate(${
          (elemBounds.left -
            transformRef.current.getBoundingClientRect().left) /
          scale
        }px, ${
          (elemBounds.top - transformRef.current.getBoundingClientRect().top) /
          scale
        }px)`,
        "important"
      );
      container.current.appendChild(dupe);
      return elem;
    });

    // remove or hide drag preview image
    const prev = document.createElement("span");
    prev.style.display = "none";
    // set data
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData(
      "origin/board",
      JSON.stringify({
        initial: initialPosition.current,
        selectedNodes: selectedNodeOffsets,
      })
    );

    transformRef.current.appendChild(container.current);
  };

  const handleDrag = (event) => {
    if (!container.current || !container.current?.style) return;
    requestAnimationFrame(() => {
      if (!container.current) return;
      container.current.style.transform = `translate(${
        (event.clientX - initialPosition.current.x) / scale
      }px, ${(event.clientY - initialPosition.current.y) / scale}px)`;
    });
  };

  const clearPortal = () => {
    if (!!container.current) {
      container.current.remove();
      container.current = undefined;
    }
    setDraggedNodes(undefined);
    originals.current.forEach((elem) => {
      elem?.classList?.remove("dragging");
    });
  };

  return {
    handleDragStart,
    handleDrag,
    clearPortal,
    draggedNodes,
  };
}
