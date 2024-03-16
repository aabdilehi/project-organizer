import { useContext, useEffect } from "react";
import { useRef, useState } from "react";
import { SelectedNodeContext } from "../../App";
import { ContextMenuContext } from "./useContextMenu";

export function useSmoothBoardControls(transformRef, boardRef) {
  const offX = useRef(0);
  const offY = useRef(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lerpedScale = useRef(scale);
  const currentPositionX = useRef(0);
  const currentPositionY = useRef(0);
  const {
    copiedNodes,
    copyNodes,
    paste,
    delete: del,
  } = useContext(ContextMenuContext);
  const { selectedNode, setSelectedNode } = useContext(SelectedNodeContext);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "v":
            break;
          case "c":
            const c = Object.values(selectedNode);
            copyNodes(c);
            break;
          case "x":
            Object.values(selectedNode).forEach((item) => {
              del();
            });
            copyNodes(Object.values(selectedNode));
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
  }, [selectedNode]);

  const handleWheel = (event) => {
    if (
      event.target === boardRef.current ||
      event.target.parentNode === boardRef.current
    ) {
      const newScale = Math.max(0.1, scale + event.deltaY * -0.0025);
      lerpedScale.current += (newScale - scale) * 0.2;

      setScale((prev) => {
        if (prev !== lerpedScale.current) {
          return lerpedScale.current;
        }
        return prev;
      });
    }
  };
  const { handleSelectNode } = useContext(SelectedNodeContext);
  const handleMouseDown = (event) => {
    if (event.type !== "mousedown") return;
    if (
      event.target !== boardRef.current &&
      event.target !== transformRef.current
    )
      return;
    if (event.button === 0) {
      handleSelectNode(event, undefined);
    }

    if (event.button === 1) {
      event.preventDefault();
      const startX = event.pageX - position.x;
      const startY = event.pageY - position.y;

      const handleMouseMove = (event) => {
        event.preventDefault();
        if (transformRef.current !== null) {
          currentPositionX.current = event.pageX - startX;
          currentPositionY.current = event.pageY - startY;
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

  const animate = () => {
    if (transformRef.current !== null) {
      transformRef.current.style.transform = `scale(${lerpedScale.current}) translate(${currentPositionX.current}px, ${currentPositionY.current}px)`;
    }
    requestAnimationFrame(animate);
  };
  return {
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    animate,
    scale,
    position,
  };
}

// Same thing as drag. Only update internally until panning is over and THEN set state
// Users cannot pan and drag at the same time so this will save a lot on performance
