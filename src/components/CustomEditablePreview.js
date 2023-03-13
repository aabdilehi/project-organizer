import { EditablePreview, useEditableControls } from "@chakra-ui/react";
import React from "react";

import { useRef } from "react";

function useClickAndHold(clickCallback, holdCallback, delay = 250) {
  const downRef = useRef();
  const upRef = useRef();
  const timerRef = useRef();

  const handleMouseDown = (event) => {
    const target = event.target;
    downRef.current = new Date();
    timerRef.current = setTimeout(() => {
      holdCallback(target);
    }, delay);
  };

  const handleMouseUp = (event) => {
    const target = event.target;
    upRef.current = new Date();
    clearTimeout(timerRef.current);
    if (upRef.current - downRef.current < delay) {
      clickCallback(target);
    }
  };

  return [handleMouseDown, handleMouseUp];
}

function CustomEditablePreview(props) {
  const editRef = useRef();
  const { getEditButtonProps } = useEditableControls();
  const startEdit = getEditButtonProps().onClick;
  const handleClick = (target) => {
    startEdit();
  };

  const handleHold = (target) => {
    console.log("Hold", target);
  };

  const [mouseDownHandler, mouseUpHandler] = useClickAndHold(
    handleClick,
    handleHold
  );
  return (
    <EditablePreview
      ref={editRef}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      cursor="inherit"
      {...props}
    />
  );
}

export default CustomEditablePreview;
