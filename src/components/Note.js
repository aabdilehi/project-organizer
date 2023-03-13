/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import "../App.css";
import { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

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
}) => {
  const ref = useRef(null);
  const finalRef = useRef(null);

  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Temporary storage for editing text. Pushes this value to data storage on submit
  const [noteText, setNoteText] = useState(text);

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  // Drag hook
  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.NOTE,
    item: { id: id, type: BoardObjects.NOTE, ref: ref, parent: parent },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));
  drag(ref);

  // Read parent prop and set isInColumn
  useEffect(() => {
    setIsInColumn(parent.type === BoardObjects.COLUMN);
  }, [parent]);

  return (
    <>
      <ResizeObserver
        ref={ref}
        onResize={({ width, height }) => {
          if (!isInColumn) {
            updateSize(id, width, height);
          }
        }}
      >
        <Card
          bg="gray.800"
          border="1px solid"
          borderColor="inherit"
          position={isInColumn ? "relative" : "absolute"}
          p={2}
          w={isInColumn ? "full" : sX + "px"}
          resize={isInColumn ? "vertical" : "both"}
          rounded="md"
          style={{
            minWidth: isInColumn ? "100%" : undefined,
            left: isInColumn ? undefined : pX + "px",
            top: isInColumn ? undefined : pY + "px",
          }}
          cursor="pointer"
          role="group"
          onDoubleClick={() => {
            setNoteText(text);
            onOpen();
          }}
        >
          {/* <IconButton
            position="absolute"
            opacity={0}
            bgColor={"gray.500"}
            _groupHover={{ opacity: 1 }} // add this line
            _hover={{ bgColor: "green.500" }}
            _active={{ bgColor: "green.200" }}
            tabIndex={1}
            top={1.5}
            right={1.5}
            aria-label="edit-button"
            size="sm"
            icon={<EditIcon />}
            onClick={() => {
              setNoteText(text);
              onOpen();
            }}
          /> */}
          <Editable
            isPreviewFocusable={false}
            w="full"
            onSubmit={() => setIsEditing(false)}
            defaultValue={text}
            onChange={(value) => {
              setIsEditing(true);
              updateContent(id, value);
            }}
          >
            <CustomEditablePreview
              overflow="hidden"
              whiteSpace={"pre-wrap"}
              w="full"
            />
            <AutoResizeEditableTextArea w="full" />
          </Editable>
        </Card>
      </ResizeObserver>
      {/* <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text as="h2">Edit note</Text>
          </ModalHeader>
          <ModalBody>
            <AutoResizeTextArea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </ModalBody>
          <ModalFooter gap={2}>
            <IconButton
              aria-label="submit-button"
              onClick={() => {
                updateContent(id, noteText);
                onClose();
              }}
              icon={<CheckIcon />}
            />
            <IconButton
              aria-label="cancel-button"
              onClick={onClose}
              icon={<CloseIcon />}
            />
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </>
  );
};

export default Note;
