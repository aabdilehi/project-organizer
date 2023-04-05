import React from "react";

import { useRef } from "react";

export function useCanvasControls(currentOffsetX, currentOffsetY, delay = 250) {
  // Refs for detecting click vs hold in mouse controls
  const downRef = useRef();
  const upRef = useRef();
  const timerRef = useRef();

  // Pan-related stuff
  const canPan = useRef(false);
  const offsetX = useRef(currentOffsetX);
  const offsetY = useRef(currentOffsetY);

  // overall offset from origin

  const handleMouseDown = (event) => {
    const target = event.target;
    downRef.current = new Date();
    timerRef.current = setTimeout(() => {
      // This is where hold behaviour goes
      // Will be using mousemove event so likely will just
      // use this to flip a bool saying canPan = true
      canPan.current = true;
    }, delay);
  };

  const handleMouseUp = (event) => {
    const target = event.target;

    canPan.current = false;
    upRef.current = new Date();
    clearTimeout(timerRef.current);
    if (upRef.current - downRef.current < delay) {
      // This is where click behaviour goes. Probably just sets canPan to false
    }
  };

  const handleMouseMove = (event) => {
    if (canPan.current) {
      const prevX = currentOffsetX;
      const prevY = currentOffsetY;
      const deltaX = event.clientX - prevX;
      const deltaY = event.clientY - prevY;
      offsetX.current = event.clientX - currentOffsetX;
      offsetY.current = event.clientY - currentOffsetY;
    }
    return { x: offsetX, y: offsetY };
  };

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
}
