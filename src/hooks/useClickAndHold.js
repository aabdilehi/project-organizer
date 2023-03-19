import React from "react";

import { useRef } from "react";

export function useClickAndHold(clickCallback, holdCallback, delay = 250) {
  const downRef = useRef();
  const upRef = useRef();
  const timerRef = useRef();

  const handleMouseDown = (event) => {
    const target = event.target;
    downRef.current = new Date();
    timerRef.current = setTimeout(() => {
      holdCallback(event);
    }, delay);
  };

  const handleMouseUp = (event) => {
    const target = event.target;
    upRef.current = new Date();
    clearTimeout(timerRef.current);
    if (upRef.current - downRef.current < delay) {
      clickCallback(event);
    }
  };

  return [handleMouseDown, handleMouseUp];
}
