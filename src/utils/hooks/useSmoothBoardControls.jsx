import { useRef, useState } from "react";

export function useSmoothBoardControls(transformRef, boardRef) {
  const offX = useRef(0);
  const offY = useRef(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lerpedScale = useRef(scale);
  const currentPositionX = useRef(0);
  const currentPositionY = useRef(0);

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

  const handleMouseDown = (event) => {
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

  const animate = () => {
    if (transformRef.current !== null) {
      transformRef.current.style.transform = `scale(${lerpedScale.current}) translate(${currentPositionX.current}px, ${currentPositionY.current}px)`;
    }
    requestAnimationFrame(animate);
  };
  return { handleWheel, handleMouseDown, animate, scale, position };
}

// Same thing as drag. Only update internally until panning is over and THEN set state
// Users cannot pan and drag at the same time so this will save a lot on performance
