import { EditableTextarea, Textarea } from "@chakra-ui/react";
import React from "react";
import ResizeTextarea from "react-textarea-autosize";

// eslint-disable-next-line react/display-name
export const AutoResizeTextArea = React.forwardRef((props, ref) => {
  return (
    <Textarea
      as={ResizeTextarea}
      minH="unset"
      maxH="unset"
      ref={ref}
      {...props}
    />
  );
});

// eslint-disable-next-line react/display-name
export const AutoResizeEditableTextArea = React.forwardRef((props, ref) => {
  return (
    <EditableTextarea as={ResizeTextarea} minH="unset" ref={ref} {...props} />
  );
});
