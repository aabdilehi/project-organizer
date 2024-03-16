import React from "react";

import { useRef } from "react";

export function useClickAndHold(
  selectCallback,
  isSelected,
  clickCallback,
  holdCallback,
  delay = 250,
  stopPropagation = true
) {
  const downRef = useRef();
  const upRef = useRef();
  const timerRef = useRef();
  const selectedRef = useRef(isSelected);

  const handleMouseDown = (event) => {
    event.stopPropagation();

    selectedRef.current = isSelected;
    if (!selectedRef.current) {
      event.stopPropagation();
      selectCallback(event);
    }
    downRef.current = new Date();
    timerRef.current = setTimeout(() => {
      event.stopPropagation();
      holdCallback(event);
    }, delay);
  };

  const handleMouseUp = (event) => {
    event.stopPropagation();
    upRef.current = new Date();
    clearTimeout(timerRef.current);
    if (upRef.current - downRef.current < delay) {
      if (selectedRef.current) {
        event.stopPropagation();
        selectCallback(event);
      }
      clickCallback(event);
    }
  };

  return [handleMouseDown, handleMouseUp];
}
