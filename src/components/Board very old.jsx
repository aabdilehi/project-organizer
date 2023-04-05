//#region Imports
import React, { useRef, useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { v4 as uuidv4 } from "uuid";
import { Box, Menu, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react";
import { connect, useSelector } from "react-redux";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { BoardObjects, SidebarObjects } from "../enums/items";
import { addBoardChild, removeBoardChild } from "../slices/boardSlice";

import Note from "./Note";
import {
  addNote,
  updateNotePosition,
  updateNoteParent,
} from "../slices/noteSlice";
import { bindActionCreators } from "redux";

import Column from "./Columnss";
import {
  addColumn,
  removeColumnChild,
  updateColumnPosition,
} from "../slices/columnSlice";

import Picture from "./Picture";
import {
  addPicture,
  updatePictureParent,
  updatePicturePosition,
} from "../slices/pictureSlice";

import ToDo from "./ToDo";
import {
  addTask,
  updateTaskParent,
  updateTaskPosition,
} from "../slices/taskSlice";
//#endregion

const Board = ({
  boardId,
  title,
  childRefs,
  addNote,
  addColumn,
  updateNotePosition,
  updateColumnPosition,
  addBoardChild,
  removeBoardChild,
  removeColumnChild,
  updateNoteParent,
  addPicture,
  updatePicturePosition,
  updatePictureParent,
  addTask,
  updateTaskPosition,
  updateTaskParent,
}) => {
  const ref = useRef(null);

  const aa = useSelector((state) => state.tasks);

  useEffect(() => {
    if (ref.current !== null) {
      console.log(aa);
    }
  }, [aa]);

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current) {
      return;
    }

    const mouseX = e.clientX - 100;
    const mouseY = e.clientY - 20;

    const newNote = {
      id: uuidv4(),
      type: BoardObjects.NOTE,
      pX: mouseX,
      pY: mouseY,
      sX: 200,
      sY: 200,
      text: "New note",
      parent: {
        id: boardId,
        type: BoardObjects.BOARD,
      },
    };
    addNote(newNote);
    addBoardChild({ boardId, childId: newNote.id, childType: newNote.type });
  };
  //#region Context Menu
  const initialRef = useRef(null);
  const [mousePos, setMousePos] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (mousePos !== null) {
      console.log(mousePos);
    }
  }, [mousePos]);

  const handleRightClick = (e) => {
    if (e.target !== ref.current) {
      return;
    }
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    setMousePos({ x: mouseX, y: mouseY });
    onOpen();
  };

  const ContextMenu = () => {
    return (
      <Menu
        initialFocusRef={initialRef}
        isOpen={isOpen}
        closeOnBlur={true}
        onClose={onClose}
        isLazy
      >
        <MenuList
          position="absolute"
          left={mousePos !== null ? mousePos.x + "px" : 0}
          top={mousePos !== null ? mousePos.y + "px" : 0}
        >
          <MenuItem
            onClick={(e) => {
              const newNote = {
                id: uuidv4(),
                type: BoardObjects.NOTE,
                pX: e.clientX - 100,
                pY: e.clientY - 20,
                sX: 200,
                sY: 200,
                text: "New note",
                parent: {
                  id: boardId,
                  type: BoardObjects.BOARD,
                },
              };
              addNote(newNote);
              addBoardChild({
                boardId,
                childId: newNote.id,
                childType: newNote.type,
              });
            }}
          >
            New Note
          </MenuItem>
          <MenuItem>New Column</MenuItem>
          <MenuItem>New Image</MenuItem>
          <MenuItem>New To-Do</MenuItem>
        </MenuList>
      </Menu>
    );
  };
  //#endregion

  //#region Drop behaviour
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      BoardObjects.NOTE,
      SidebarObjects.NOTE,
      SidebarObjects.COLUMN,
      BoardObjects.COLUMN,
      BoardObjects.TODO,
      SidebarObjects.TODO,
      BoardObjects.IMAGE,
      SidebarObjects.IMAGE,
    ],
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    drop: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      switch (item.type) {
        case BoardObjects.NOTE:
          if (ref != null) {
            if (
              item.parent.id !== boardId &&
              monitor.isOver({ shallow: true })
            ) {
              switch (item.parent.type) {
                case BoardObjects.BOARD:
                  removeBoardChild({
                    boardId: item.parent.id,
                    childId: item.id,
                  });
                  addBoardChild({
                    boardId: boardId,
                    childId: item.id,
                    childType: item.type,
                  });
                  break;
                case BoardObjects.COLUMN:
                  removeColumnChild({
                    columnId: item.parent.id,
                    childId: item.id,
                  });
                  addBoardChild({
                    boardId: boardId,
                    childId: item.id,
                    childType: item.type,
                  });
                  updateNoteParent({
                    noteId: item.id,
                    newParentId: boardId,
                    newParentType: BoardObjects.BOARD,
                  });
                  break;
                default:
                  break;
              }
            }
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            updateNotePosition({
              noteId: item.id,
              pX: mouse?.x - boundingRect.left,
              pY: mouse?.y,
            });
          }
          break;
        case BoardObjects.IMAGE:
          if (ref != null) {
            if (
              item.parent.id !== boardId &&
              monitor.isOver({ shallow: true })
            ) {
              switch (item.parent.type) {
                case BoardObjects.BOARD:
                  removeBoardChild({
                    boardId: item.parent.id,
                    childId: item.id,
                  });
                  addBoardChild({
                    boardId: boardId,
                    childId: item.id,
                    childType: item.type,
                  });
                  break;
                case BoardObjects.COLUMN:
                  removeColumnChild({
                    columnId: item.parent.id,
                    childId: item.id,
                  });
                  addBoardChild({
                    boardId: boardId,
                    childId: item.id,
                    childType: item.type,
                  });
                  updatePictureParent({
                    pictureId: item.id,
                    newParentId: boardId,
                    newParentType: BoardObjects.BOARD,
                  });
                  break;
                default:
                  break;
              }
            }
            const mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            updatePicturePosition({
              pictureId: item.id,
              pX: mouse?.x - boundingRect.left,
              pY: mouse?.y,
            });
          }
          break;
        case BoardObjects.TODO:
          if (ref != null) {
            if (
              item.parent.id !== boardId &&
              monitor.isOver({ shallow: true })
            ) {
              switch (item.parent.type) {
                case BoardObjects.BOARD:
                  removeBoardChild({
                    boardId: item.parent.id,
                    childId: item.id,
                  });
                  addBoardChild({
                    boardId: boardId,
                    childId: item.id,
                    childType: item.type,
                  });
                  break;
                case BoardObjects.COLUMN:
                  removeColumnChild({
                    columnId: item.parent.id,
                    childId: item.id,
                  });
                  addBoardChild({
                    boardId: boardId,
                    childId: item.id,
                    childType: item.type,
                  });
                  updateTaskParent({
                    taskId: item.id,
                    newParentId: boardId,
                    newParentType: BoardObjects.BOARD,
                  });
                  break;
                default:
                  break;
              }
            }
            const mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            updateTaskPosition({
              taskId: item.id,
              pX: mouse?.x - boundingRect.left,
              pY: mouse?.y,
            });
          }
          break;
        case BoardObjects.COLUMN:
          if (ref != null) {
            console.log(item);
            if (item.parent.id !== boardId) {
              removeBoardChild({ boardId: item.parent.id, childId: item.id });
              addBoardChild({
                boardId,
                childId: item.id,
                childType: BoardObjects.COLUMN,
              });
              break;
            }
            const mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            updateColumnPosition({
              columnId: item.id,
              pX: mouse?.x - boundingRect.left,
              pY: mouse?.y,
            });
          }
          break;

        case SidebarObjects.NOTE:
          if (ref != null) {
            const mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const newNote = {
              id: uuidv4(),
              type: BoardObjects.NOTE,
              pX: mouse?.x,
              pY: mouse?.y,
              sX: 200,
              sY: 200,
              text: "New note",
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            };
            addNote(newNote);
            addBoardChild({
              boardId,
              childId: newNote.id,
              childType: newNote.type,
            });
          }
          break;
        case SidebarObjects.COLUMN:
          if (ref != null) {
            const mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const newColumn = {
              id: uuidv4(),
              type: BoardObjects.COLUMN,
              pX: mouse?.x - boundingRect.left,
              pY: mouse?.y,
              sX: 200,
              sY: 200,
              title: "New note",
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
              childRefs: [],
            };
            addColumn(newColumn);
            addBoardChild({
              boardId,
              childId: newColumn.id,
              childType: newColumn.type,
            });
          }
          break;
        case SidebarObjects.IMAGE:
          if (ref != null) {
            const mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const newPicture = {
              id: uuidv4(),
              type: BoardObjects.IMAGE,
              pX: mouse?.x - boundingRect.left,
              pY: mouse?.y,
              sX: 200,
              sY: 200,
              image: "",
              label: "Label",
              showLabel: false,
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            };
            addPicture(newPicture);
            addBoardChild({
              boardId,
              childId: newPicture.id,
              childType: newPicture.type,
            });
          }
          break;
        case SidebarObjects.TODO:
          if (ref != null) {
            const mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const newTask = {
              id: uuidv4(),
              type: BoardObjects.TODO,
              pX: mouse?.x - boundingRect.left,
              pY: mouse?.y,
              text: "New task",
              taskStatus: false,
              summary: "",
              deadline: null,
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            };
            addTask(newTask);
            addBoardChild({
              boardId,
              childId: newTask.id,
              childType: newTask.type,
            });
          }
          break;
        default:
          return;
      }
    },
  }));

  drop(ref);

  //#endregion

  //#region Render board
  return (
    <Box
      overflow={"hidden"}
      w={"full"}
      minH={"full"}
      maxH={"unset"}
      m={0}
      p={0}
      flex={1}
      ref={ref}
      id="board"
      position={"relative"}
      bgColor={"gray.900"}
      onClick={(e) => {
        if (e.detail === 2) {
          handleDoubleClick(e);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        console.log("hi");
        handleRightClick(e);
      }}
      onKeyUp={(e) => {
        console.log(e.key);
      }}
    >
      <ContextMenu />
      {childRefs.map(({ childId, childType }) => {
        switch (childType) {
          case BoardObjects.NOTE:
            return <Note key={childId} id={childId} boardRef={ref} />;
          case BoardObjects.COLUMN:
            return <Column key={childId} columnId={childId} boardRef={ref} />;
          case BoardObjects.IMAGE:
            return <Picture key={childId} id={childId} />;
          case BoardObjects.TODO:
            return <ToDo key={childId} id={childId} boardRef={ref} />;
          default:
            break;
        }
      })}
    </Box>
  );
  //#endregion
};

const mapStateToProps = (state, ownProps) => {
  const { boardId } = ownProps;
  const board = state.boards[boardId];
  return {
    title: board.title,
    childRefs: board.childRefs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      addBoardChild,
      removeBoardChild,
      addNote,
      updateNotePosition,
      updateNoteParent,
      addColumn,
      updateColumnPosition,
      removeColumnChild,
      addPicture,
      updatePicturePosition,
      updatePictureParent,
      addTask,
      updateTaskPosition,
      updateTaskParent,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Board);
