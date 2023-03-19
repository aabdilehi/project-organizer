/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import "../App.css";
import { useState, useEffect, useRef } from "react";
import { useDrag, useDragDropManager } from "react-dnd";

import { BoardObjects } from "../enums/items";
import ResizeObserver from "rc-resize-observer";
import {
  Card,
  CardBody,
  Editable,
  EditableTextarea,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { AutoResizeEditableTextArea } from "./AutoResizeTextarea";
import CustomEditablePreview from "./CustomEditablePreview";

const Note = ({
  id,
  pX,
  pY,
  sX,
  sY,
  text,
  onTextChange,
  parent,
  updateSize,
  updateContent,
  setFocusedElement,
}) => {
  const ref = useRef(null);
  const finalRef = useRef(null);

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  // Drag hook
  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.NOTE,
    item: {
      id: id,
      type: BoardObjects.NOTE,
      ref: ref,
      parent: parent,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    previewOptions: {
      captureDraggingState: true,
    },
  }));
  drag(ref);
  console.log(isDragging);
  // Read parent prop and set isInColumn
  useEffect(() => {
    setIsInColumn(parent.type === BoardObjects.COLUMN);
  }, [parent]);

  const monitor = useDragDropManager().getMonitor();
  useEffect(() => {
    console.log(monitor.getItem());
  }, [monitor]);

  return (
    <ResizeObserver
      ref={ref}
      onResize={({ width, height }) => {
        if (!isInColumn) {
          updateSize(id, width, height);
        }
      }}
    >
      <Editable
        onFocus={() => setFocusedElement(id)}
        w={isInColumn ? "full" : sX + "px"}
        bg="gray.800"
        border="1px solid"
        resize={isInColumn ? "vertical" : "both"}
        overflow="hidden"
        borderColor="inherit"
        position={isInColumn ? "relative" : "absolute"}
        rounded="md"
        style={{
          minWidth: isInColumn ? "100%" : undefined,
          left: isInColumn ? undefined : pX + "px",
          top: isInColumn ? undefined : pY + "px",
        }}
        h={sY + "px"}
        isPreviewFocusable={false}
        onSubmit={() => setIsEditing(false)}
        placeholder={text}
        onChange={(value) => {
          setIsEditing(true);
          updateContent(id, value);
        }}
      >
        <CustomEditablePreview
          tabIndex={2}
          overflow="hidden"
          whiteSpace={"pre-wrap"}
          w="full"
          h={sY + "px"}
          p={2}
        />
        <AutoResizeEditableTextArea m={0} p={2} minH={sY + "px"} w="full" />
      </Editable>
    </ResizeObserver>
  );
};

export default Note;
