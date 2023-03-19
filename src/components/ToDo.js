/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import "../App.css";
import React, { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import {
  Checkbox,
  Card,
  Stack,
  Badge,
  Tooltip,
  Text,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Box,
  Input,
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverContent,
} from "@chakra-ui/react";
import { BoardObjects } from "../enums/items";
import { AutoResizeTextArea } from "./AutoResizeTextarea.js";
import { CalendarIcon, CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import ChkrDatepicker from "./Datepicker";
import ReactDatePicker from "react-datepicker";
import { format } from "date-fns";

const ToDo = ({
  id,
  pX,
  pY,
  text,
  deadline,
  summary,
  parent,
  taskStatus,
  updateTaskStatus,
  updateContent,
  updateDeadline,
  updateSummary,
}) => {
  const finalRef = useRef(null);

  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Temporary storage for editing text. Pushes this value to data storage on submit
  const [taskText, setTaskText] = useState(text);
  const [taskSummary, setTaskSummary] = useState(summary);

  const [date, setDate] = useState(deadline);
  const dpRef = useRef(null);
  const ref = useRef(null);
  const [isEditing, setEditMode] = useState(false);
  const [isInColumn, setIsInColumn] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.TODO,
    item: { id: id, type: BoardObjects.TODO, ref: ref, parent: parent },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));
  drag(ref);

  useEffect(() => {
    setIsInColumn(parent.type === BoardObjects.COLUMN);
  }, [parent]);

  const edit = () => {
    setEditMode(true);
  };

  const endEdit = () => {
    setEditMode(false);
  };

  const initialFocusRef = React.useRef();
  const dateBadgeRef = useRef();

  return (
    <Card
      role="group"
      ref={ref}
      direction={{ base: "row" }}
      bg="gray.800"
      variant="outline"
      size={"sm"}
      alignItems="flex-start"
      draggable={!isEditing}
      pt={2}
      pr={2}
      w={isInColumn ? "100%" : "250px"}
      position={isInColumn ? "relative" : "absolute"}
      h="fit-content"
      cursor={isEditing ? "auto" : "pointer"}
      css={css`
        ${isInColumn ? "min-width: 100%;" : ""}
        ${isInColumn ? "" : "left: " + pX + "px;"}
        ${isInColumn ? "" : "top: " + pY + "px;"}
      `}
    >
      <Checkbox
        size={"lg"}
        pl={5}
        pr={5}
        pt={1.5}
        h="100%"
        isChecked={taskStatus}
        onChange={() => updateTaskStatus(id)}
      ></Checkbox>
      <Stack marginBottom={2} direction={{ base: "column" }}>
        <IconButton
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
            setTaskText(text);
            setDate(deadline);
            setTaskSummary(summary);
            onOpen();
          }}
        />
        <Text>{text}</Text>
        <Stack direction={{ base: "row" }}>
          {date !== null ? (
            <Badge
              variant={"subtle"}
              fontSize="md"
              letterSpacing="wide"
              colorScheme={"messenger"}
              px={2}
              py={1}
              width="fit-content"
              fontSize={{ base: "10px" }}
              size="lg"
              rounded="lg"
              onClick={(e) => console.log(dpRef.current.setOpen(e))}
            >
              Due: {format(date, "dd MMM")}
            </Badge>
          ) : (
            ""
          )}
          <Badge
            variant={"subtle"}
            fontSize="md"
            letterSpacing="wide"
            colorScheme={"whatsapp"}
            px={2}
            py={1}
            width="fit-content"
            fontSize={{ base: "10px" }}
            size="lg"
            rounded="lg"
          >
            @ Abokor
          </Badge>
        </Stack>
      </Stack>
      <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text as="h2">Edit note</Text>
          </ModalHeader>
          <ModalBody>
            <Stack gap={2}>
              <Box>
                <Text as="p">Task:</Text>
                <Input
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                />
              </Box>
              <Box>
                <Text as="p">Summary:</Text>
                <AutoResizeTextArea
                  value={taskSummary}
                  onChange={(e) => setTaskSummary(e.target.value)}
                />
              </Box>
              <Box>
                <Text as="p">Deadline:</Text>
                <Stack direction={"row"} w="full">
                  <ChkrDatepicker
                    selectedDate={date}
                    onChange={(date) => setDate(date)}
                  />
                  <Tooltip label="Clear deadline">
                    <IconButton
                      icon={<CloseIcon />}
                      aria-label="clear-date"
                      onClick={() => setDate(null)}
                    />
                  </Tooltip>
                </Stack>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter gap={2}>
            <IconButton
              aria-label="submit-button"
              onClick={() => {
                updateContent(id, taskText);
                updateDeadline(id, date);
                updateSummary(id, taskSummary);
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
      </Modal>
    </Card>
  );
};

export default ToDo;
