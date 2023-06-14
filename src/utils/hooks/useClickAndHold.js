import React from "react";

import { useRef } from "react";

export function useClickAndHold(
  clickCallback,
  holdCallback,
  delay = 250,
  stopPropagation = true
) {
  const downRef = useRef();
  const upRef = useRef();
  const timerRef = useRef();

  const handleMouseDown = (event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    downRef.current = new Date();
    timerRef.current = setTimeout(() => {
      holdCallback(event);
    }, delay);
  };

  const handleMouseUp = (event) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    upRef.current = new Date();
    clearTimeout(timerRef.current);
    if (upRef.current - downRef.current < delay) {
      clickCallback(event);
    }
  };

  return [handleMouseDown, handleMouseUp];
}
