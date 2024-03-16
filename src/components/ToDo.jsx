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
  Button,
  Center,
  EditableInput,
} from "@chakra-ui/react";
import { BoardObjects } from "../utils/enums/items";
import {
  AutoResizeEditableInput,
  AutoResizeTextArea,
} from "./AutoResizeTextarea.jsx";
import { AddIcon, CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import ChkrDatepicker from "./Datepicker";
import { format, parseISO } from "date-fns";
import { bindActionCreators } from "redux";
import {
  updateDeadline,
  updateTaskStatus,
  addBadge,
  removeBadge,
  updateBadgeText,
} from "../utils/slices/taskSlice";
import { connect, useDispatch } from "react-redux";
import CustomEditablePreview from "./CustomEditablePreview";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import { BadgeC } from "../utils/classes/classes";
import { SelectedNodeContext } from "../App";
import { IconPlus } from "@tabler/icons-react";
import {
  removeChild,
  removeNode,
  updateContent,
  updateTitle,
} from "../utils/slices/nodeActions";
import NodeWrapper from "./NodeWrapper.jsx";

const ToDo = ({
  id,
  pX,
  pY,
  title,
  badges,
  deadline,
  content,
  parent,
  openContextMenu,
  addBadge,
  removeBadge,
  updateBadgeText,
  taskStatus,
  updateTaskStatus,
  updateDeadline,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  animate,
}) => {
  const finalRef = useRef(null);

  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  const dispatch = useDispatch();
  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Temporary storage for editing text. Pushes this value to data storage on submit
  const [taskText, setTaskText] = useState(title);
  const [taskSummary, setTaskSummary] = useState(content);

  const [date, setDate] = useState(deadline);
  const dragRef = useRef(null);
  const [isInColumn, setIsInColumn] = useState(false);

  //#region  Drag behaviour
  const item = {
    id: id,
    type: BoardObjects.TODO,
    parent: parent,
  };

  //#endregion

  useEffect(() => {
    setIsInColumn(parent.type === BoardObjects.COLUMN);
  }, [parent]);

  const { setMenuItems, setMenuProps, copyNodes } =
    useContext(ContextMenuContext);

  const copyTask = () => {
    const task = {
      // new Id will be assigned
      type: BoardObjects.TODO,
      pX, // need position in case user uses keyboard shortcut
      pY,
      title,
      deadline,
      content,
      taskStatus,
      badges,
      parent,
    };
    copyNodes([task]);
  };

  const cutTask = () => {
    copyTask();
  };

  const updateContextMenu = () => {
    setMenuItems([]);
    setMenuProps({
      canCopy: true,
      canCut: true,
      canDelete: true,
    });
  };

  const selectData = useMemo(() => {
    return {
      id, // new Id will be assigned
      type: BoardObjects.TODO,
      pX, // need position in case user uses keyboard shortcut
      pY,
      title,
      deadline,
      content,
      taskStatus,
      badges,

      parent, // parent does not have to be the same
    };
  }, [id, pX, pY, title, deadline, content, taskStatus, badges]);

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
            <Box>
              <Text as="p">Badges:</Text>
              <Stack direction={"row"} flexWrap={"wrap"} gap={1} height={"2em"}>
                {Object.values(badges)?.map((badge, index) => {
                  return (
                    <Badge
                      variant={"subtle"}
                      letterSpacing="wide"
                      colorScheme={badge.colour}
                      h={"100%"}
                      px={2}
                      py={1}
                      style={{
                        margin: 0,
                      }}
                      width="fit-content"
                      fontSize={{ base: "10px" }}
                      size="lg"
                      rounded="lg"
                    >
                      <Stack direction={"row"}>
                        <Editable
                          onChange={(value) => {
                            updateBadgeText({
                              taskId: id,
                              badgeId: badge.id,
                              text: value,
                            });
                          }}
                          m={0}
                          p={0}
                          style={{ height: "100%" }}
                          textAlign={"center"}
                          wordBreak="break-word"
                          isPreviewFocusable={false}
                          value={badge.text?.toUpperCase()}
                        >
                          <CustomEditablePreview h={"100%"} m={0} p={0} />
                          <AutoResizeEditableInput
                            h={"100%"}
                            m={0}
                            p={0}
                            textAlign={"center"}
                          />
                        </Editable>
                        <IconButton
                          size="xs"
                          rounded={"3xl"}
                          icon={<CloseIcon fontSize={"3xs"} />}
                          onClick={() => {
                            removeBadge({ taskId: id, badgeId: badge.id });
                          }}
                        />
                      </Stack>
                    </Badge>
                  );
                })}
                <IconButton
                  icon={<AddIcon />}
                  variant={"solid"}
                  letterSpacing="wide"
                  colorScheme={"messenger"}
                  width="fit-content"
                  h={"100%"}
                  style={{
                    margin: "0",
                  }}
                  p={1}
                  pr={2}
                  pl={2}
                  border={"none"}
                  textAlign={"center"}
                  onClick={(e) => {
                    const { ...newBadge } = new BadgeC();
                    addBadge({ taskId: id, newBadge });
                  }}
                  size="sm"
                  rounded="lg"
                />
              </Stack>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <IconButton
            aria-label="submit-button"
            onClick={() => {
              dispatch(
                updateTitle.action({
                  id,
                  type: BoardObjects.TODO,
                  title: taskText,
                })
              );
              updateDeadline({ taskId: id, deadline: date });
              dispatch(
                updateContent.action({
                  id,
                  type: BoardObjects.TODO,
                  content: taskSummary,
                })
              );
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
    <NodeWrapper
      nodeId={id}
      pX={pX}
      pY={pY}
      isInColumn={isInColumn}
      animate={animate}
      menuItems={[]}
      menuProps={{
        canCopy: true,
        canCut: true,
        canDelete: true,
      }}
      canPosition={true}
      clickCallback={() => {}}
      holdCallback={() => {}}
      canResize={false}
      handleDragStart={handleDragStart}
      handleDrag={handleDrag}
      handleDragEnd={handleDragEnd}
      onSelectNode={selectData}
      openContextMenu={openContextMenu}
      zIndex={2}
      role="group"
      direction={{ base: "row" }}
      bg={useColorModeValue("gray.400", "gray.800")}
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
      <Stack direction={{ base: "column" }} pl={5}>
        <Stack
          flexDirection={"row"}
          alignItems={"center"}
          alignContent={"center"}
          gap={5}
        >
          <Checkbox
            size={"lg"}
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
          <Editable
            onChange={(value) =>
              dispatch(
                updateTitle.action({
                  id,
                  type: BoardObjects.TODO,
                  title: value,
                })
              )
            }
            textAlign={"left"}
            wordBreak="break-word"
            isPreviewFocusable={false}
            value={title}
            flex={1}
            p={0}
            style={{
              margin: "0px",
              height: "fit-content",
              padding: "0px",
            }}
            color={useColorModeValue("black", "white")}
            justifyItems={"center"}
          >
            <CustomEditablePreview p={0} m={0} h={"100%"} />

            <AutoResizeEditableInput
              p={0}
              m={0}
              h={"100%"}
              textAlign={"left"}
            />
          </Editable>
          <IconButton
            opacity={0}
            variant={"outline"}
            _groupHover={{ opacity: 1 }} // add this line
            _hover={{ bgColor: "green.500" }}
            tabIndex={1}
            position="absolute"
            top={-1}
            right={1}
            aria-label="edit-button"
            size="sm"
            icon={<EditIcon />}
            onClick={() => {
              setTaskText(title);
              setDate(deadline);
              setTaskSummary(content);
              onOpen();
            }}
          />
        </Stack>

        <Stack direction={{ base: "row" }} pb={2} wrap={"wrap"} gap={1}>
          {deadline !== null ? (
            <Badge
              variant={"subtle"}
              letterSpacing="wide"
              colorScheme={"messenger"}
              px={2}
              py={1}
              width="fit-content"
              fontSize={{ base: "10px" }}
              style={{}}
              size="lg"
              rounded="lg"
            >
              {typeof deadline === "string"
                ? format(parseISO(deadline), "dd MMM")
                : format(deadline, "dd MMM")}
            </Badge>
          ) : null}
          {Object.values(badges)?.map((badge) => {
            return (
              <Badge
                variant={"subtle"}
                letterSpacing="wide"
                colorScheme={badge.colour}
                px={2}
                py={1}
                style={{
                  margin: 0,
                }}
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
    </NodeWrapper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const task = state.tasks[id];
  return {
    title: task.title,
    content: task.content,
    deadline: task.deadline,
    badges: task.badges,
    pX: task.pX,
    pY: task.pY,
    taskStatus: task.taskStatus,
    parent: task.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      addBadge,
      removeBadge,
      updateBadgeText,
      updateDeadline,
      updateTaskStatus,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ToDo);
