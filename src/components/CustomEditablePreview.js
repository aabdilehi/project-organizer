import { EditablePreview, useEditableControls } from "@chakra-ui/react";
import React from "react";

import { useRef } from "react";

import { useClickAndHold } from "../hooks/useClickAndHold";

function CustomEditablePreview(props) {
  const editRef = useRef();
  const { getEditButtonProps } = useEditableControls();
  const startEdit = getEditButtonProps().onClick;
  const handleClick = (event) => {
    startEdit();
  };

  const handleHold = (event) => {
    console.log("Hold", event.target);
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
