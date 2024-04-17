import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SelectedNodeContext } from "../../App";
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
  let initialOffset = useRef({ x: 0, y: 0 });

  // linearly interpolated mouse position
  const lerpedMouseX = useRef(0); // was initial coords
  const lerpedMouseY = useRef(0); // was initial coords

  const container = useRef();
  const originals = useRef([]);

  const selectedNodes = useSelector((state) => state.selection);

  const handleDragStart = (event) => {
    event.stopPropagation();
    if (boardRef.current === null) {
      return;
    }

    // Initial click pos
    initialOffset.current = {
      x: event.clientX,
      y: event.clientY,
    };

    // remove or hide drag preview image
    const prev = document.createElement("span");
    prev.style.display = "none";
    // set data
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        offset: initialOffset.current,
        selectedNodes,
      })
    );

    // create drag container
    container.current = document.createElement("div");
    container.current.classList.add("clone-container");
    originals.current = Object.keys(selectedNodes).map((item) => {
      const elem = document.querySelector(`[data-nodeid='${item}']`);
      if (!elem) return;
      const dupe = elem.cloneNode(true);
      elem.classList.add("dragging");
      const elemBounds = elem.getBoundingClientRect();
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

    transformRef.current.appendChild(container.current);
  };

  const handleDrag = (event) => {
    if (!container.current) return;
    requestAnimationFrame(() => {
      container.current.style.transform = `translate(${
        (event.clientX - initialOffset.current.x) / scale
      }px, ${(event.clientY - initialOffset.current.y) / scale}px)`;
    });
  };

  const clearPortal = () => {
    if (!!container.current) {
      container.current.remove();
      container.current = undefined;
    }

    originals.current.forEach((elem) => {
      elem?.classList?.remove("dragging");
    });
  };

  return {
    handleDragStart,
    handleDrag,
    clearPortal,
  };
}
