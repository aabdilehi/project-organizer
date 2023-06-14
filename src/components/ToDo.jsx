/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef, useContext, useMemo } from "react";
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
  Editable,
  useColorModeValue,
  MenuItem,
} from "@chakra-ui/react";
import { BoardObjects } from "../utils/enums/items";
import {
  AutoResizeEditableInput,
  AutoResizeTextArea,
} from "./AutoResizeTextarea.jsx";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import ChkrDatepicker from "./Datepicker";
import { format, parseISO } from "date-fns";
import { bindActionCreators } from "redux";
import {
  updateText,
  updateSummary,
  updateDeadline,
  updateTaskStatus,
  removeTask,
} from "../utils/slices/taskSlice";
import { connect } from "react-redux";
import CustomEditablePreview from "./CustomEditablePreview";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import { removeBoardChild } from "../utils/slices/boardSlice";
import { removeColumnChild } from "../utils/slices/columnSlice";
import { BadgeC } from "../utils/classes/classes";
import { SelectedNodeContext } from "../App";

const ToDo = ({
  id,
  boardId,
  boardRef,
  pX,
  pY,
  offset,
  scale,
  text,
  deadline,
  summary,
  parent,
  setContextMenu,
  openContextMenu,
  taskStatus,
  updateTaskStatus,
  updateText,
  updateDeadline,
  updateSummary,
  removeBoardChild,
  removeColumnChild,
  removeTask,
}) => {
  const finalRef = useRef(null);

  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Temporary storage for editing text. Pushes this value to data storage on submit
  const [taskText, setTaskText] = useState(text);
  const [taskSummary, setTaskSummary] = useState(summary);

  const [date, setDate] = useState(deadline);
  const dragRef = useRef(null);
  const [isInColumn, setIsInColumn] = useState(false);

  const [badges, setBadges] = useState([]);

  const memoizedBadges = useMemo(() => badges, [badges, setBadges]);

  useEffect(() => {
    if (deadline !== null) {
      setBadges((prev) => {
        prev.push(
          new BadgeC(
            ` Due: ${
              typeof deadline === "string"
                ? format(parseISO(deadline), "dd MMM")
                : format(deadline, "dd MMM")
            }`,
            "whatsapp"
          )
        );
        return prev;
      });
    }
  }, [deadline]);

  //#region  Drag behaviour
  const item = {
    id: id,
    type: BoardObjects.TODO,
    parent: parent,
  };

  const { handleDragStart, handleDrag, handleDragEnd, animate } = useSmoothDrag(
    {
      boardId,
      boardRef,
      elementRef: dragRef,
      initialCoords: { x: pX, y: pY },
      shouldAnimate: true,
      shouldPosition: !isInColumn,
      item,
      offset,
      scale,
    }
  );

  animate();

  //#endregion

  useEffect(() => {
    setIsInColumn(parent.type === BoardObjects.COLUMN);
    console.log(isInColumn);
  }, [parent]);

  const deleteTask = () => {
    console.log("deleting note");
    switch (parent.type) {
      case BoardObjects.BOARD:
        removeBoardChild({ boardId: parent.id, childId: id });
        removeTask({ taskId: id });
        break;
      case BoardObjects.COLUMN:
        removeColumnChild({ columnId: parent.id, childId: id });
        removeTask({ taskId: id });
        break;
    }
  };

  const { setMenuItems, copyNodes } = useContext(ContextMenuContext);

  const copyTask = () => {
    const task = {
      // new Id will be assigned
      type: BoardObjects.TODO,
      pX, // need position in case user uses keyboard shortcut
      pY,
      text,
      deadline,
      summary,
      taskStatus,
      // parent does not have to be the same
    };
    copyNodes([task]);
  };

  const cutTask = () => {
    copyTask();
    deleteTask();
  };

  const updateContextMenu = () => {
    setMenuItems([
      <MenuItem onClick={cutTask}>Cut</MenuItem>,
      <MenuItem onClick={copyTask}>Copy</MenuItem>,
      <MenuItem onClick={deleteTask}>Delete</MenuItem>,
    ]);
  };

  //#region Modal menu
  // can't make this like the context menu in board as it will re-render on every state change
  const ModalMenu = (
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
                  selectedDate={
                    typeof date === "string" ? parseISO(date) : date
                  }
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
              updateText({ taskId: id, text: taskText });
              updateDeadline({ taskId: id, deadline: date });
              updateSummary({ taskId: id, summary: taskSummary });
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
  );
  //#endregion

  return (
    <Card
      draggable={true}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        updateContextMenu();
        openContextMenu(e);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        handleSelectNode(e, id);
      }}
      zIndex={2}
      role="group"
      ref={dragRef}
      direction={{ base: "row" }}
      bg={useColorModeValue("gray.400", "gray.800")}
      outline={selectedNode?.includes(id) ? "3px solid" : "1px solid"}
      outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
      size={"sm"}
      maxW="1000px"
      maxH="1000px"
      alignItems="flex-start"
      pt={2}
      pr={2}
      w={isInColumn ? "100%" : "250px"}
      position={isInColumn ? "relative" : "absolute"}
      h="fit-content"
      cursor={"grab"}
      minW={isInColumn ? "100%;" : ""}
    >
      <Checkbox
        size={"lg"}
        pl={5}
        pr={5}
        pt={1.5}
        h="100%"
        iconColor={useColorModeValue("black", "white")}
        borderColor={useColorModeValue("blackAlpha.700", "whiteAlpha.500")}
        _hover={useColorModeValue(
          {
            borderColor: "blackAlpha.500",
          },
          {
            borderColor: "whiteAlpha.700",
          }
        )}
        isChecked={taskStatus}
        onChange={() =>
          updateTaskStatus({ taskId: id, taskStatus: !taskStatus })
        }
      ></Checkbox>
      <Stack marginBottom={2} direction={{ base: "column" }}>
        <IconButton
          position="absolute"
          opacity={0}
          variant={"outline"}
          _groupHover={{ opacity: 1 }} // add this line
          _hover={{ bgColor: "green.500" }}
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
        <Editable
          onChange={(value) => updateText({ taskId: id, text: value })}
          m={0}
          p={0}
          pr={3}
          textAlign={"left"}
          wordBreak="break-word"
          isPreviewFocusable={false}
          value={text}
          color={useColorModeValue("black", "white")}
        >
          <CustomEditablePreview m={0} p={0} />
          <AutoResizeEditableInput m={0} p={0} textAlign={"left"} />
        </Editable>
        <Stack direction={{ base: "row" }}>
          {deadline !== null ? (
            <Badge
              variant={"subtle"}
              letterSpacing="wide"
              colorScheme={"messenger"}
              px={2}
              py={1}
              width="fit-content"
              fontSize={{ base: "10px" }}
              size="lg"
              rounded="lg"
            ></Badge>
          ) : null}
          <Badge
            variant={"subtle"}
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
          {memoizedBadges.map((badge) => {
            return (
              <Badge
                variant={"subtle"}
                letterSpacing="wide"
                colorScheme={badge.colour}
                px={2}
                py={1}
                width="fit-content"
                fontSize={{ base: "10px" }}
                size="lg"
                rounded="lg"
              >
                {badge.text}
              </Badge>
            );
          })}
        </Stack>
      </Stack>
      {ModalMenu}
    </Card>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const task = state.tasks[id];
  return {
    text: task.text,
    summary: task.summary,
    deadline: task.deadline,
    pX: task.pX,
    pY: task.pY,
    taskStatus: task.taskStatus,
    parent: task.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      updateText,
      updateSummary,
      updateDeadline,
      updateTaskStatus,
      removeBoardChild,
      removeColumnChild,
      removeTask,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ToDo);
