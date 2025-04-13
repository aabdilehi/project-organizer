import { useContext, useEffect } from "react";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { clearSelectNode } from "../slices/selectionSlice";
import {
  copySelection,
  deleteSelection,
  pasteToSelectedNodes,
} from "../node-helper-functions";

export function useSmoothBoardControls(boardId, transformRef, boardRef) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lerpedScale = useRef(scale);
  const currentPositionX = useRef(0);
  const currentPositionY = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "v":
            pasteToSelectedNodes(boardId, 0, 0);
            break;
          case "c":
            copySelection(boardId);
            dispatch(clearSelectNode());
            break;
          case "x":
            copySelection(boardId);
            deleteSelection();
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const dispatch = useDispatch();

  const handleWheel = (event) => {
    if (
      event.target === boardRef.current ||
      event.target.parentNode === boardRef.current
    ) {
      const newScale = Math.max(0.05, scale + event.deltaY * -0.0025);
      lerpedScale.current += (newScale - scale) * 0.2;
      setScale((prev) => {
        if (prev !== lerpedScale.current) {
          return lerpedScale.current;
        }
        return prev;
      });
      requestAnimationFrame(() => {
        transformRef.current.style.transform = `scale(${scale}) translate(${
          currentPositionX.current / scale
        }px, ${currentPositionY.current / scale}px)`;
      });
    }
  };
  const handleMouseDown = (event) => {
    if (event.type !== "mousedown") return;
    if (
      event.target !== boardRef.current &&
      event.target !== transformRef.current
    )
      return;

    if (event.button === 1) {
      event.preventDefault();
      const startX = event.pageX - position.x;
      const startY = event.pageY - position.y;

      const handleMouseMove = (event) => {
        event.preventDefault();
        if (transformRef.current !== null) {
          requestAnimationFrame(() => {
            currentPositionX.current = event.pageX - startX;
            currentPositionY.current = event.pageY - startY;
            transformRef.current.style.transform = `scale(${scale}) translate(${
              currentPositionX.current / scale
            }px, ${currentPositionY.current / scale}px)`;
          });
        }
      };

      const handleMouseUp = () => {
        setPosition({
          x: currentPositionX.current,
          y: currentPositionY.current,
        });
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    const startX = event.touches[0].pageX - position.x;
    const startY = event.touches[0].pageY - position.y;

    const handleTouchMove = (event) => {
      event.preventDefault();
      if (transformRef.current !== null) {
        currentPositionX.current = event.touches[0].pageX - startX;
        currentPositionY.current = event.touches[0].pageY - startY;
      }
    };

    const handleTouchEnd = () => {
      setPosition({
        x: currentPositionX.current,
        y: currentPositionY.current,
      });
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };
  return {
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    scale,
    position,
  };
}

// Same thing as drag. Only update internally until panning is over and THEN set state
// Users cannot pan and drag at the same time so this will save a lot on performance
