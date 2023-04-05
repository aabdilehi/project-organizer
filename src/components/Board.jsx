//#region Imports
import React, { useRef, useState } from "react";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Menu,
  MenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { connect } from "react-redux";

import { BoardObjects, SidebarObjects } from "../enums/items";
import { addBoardChild, removeBoardChild } from "../slices/boardSlice";

import Note from "./Note";
import { addNote } from "../slices/noteSlice";
import { bindActionCreators } from "redux";

import Column from "./Column";
import { addColumn } from "../slices/columnSlice";

import Picture from "./Picture";
import { addPicture } from "../slices/pictureSlice";

import ToDo from "./ToDo";
import { addTask } from "../slices/taskSlice";
import { useBoardDrop } from "../hooks/useDrop";
//#endregion

import { useSmoothBoardControls } from "../hooks/useSmoothBoardControls";
import BoardIcon from "./BoardIcon";
import { withRouter } from "./ComponentWithRouterProp";
// @ts-ignore

const Board = ({
  router,
  childRefs,
  addNote,
  addBoardChild,
  addColumn,
  addTask,
  addPicture,
}) => {
  const ref = useRef(null);

  // @ts-ignore
  const { id } = router.params;
  const boardId = id ? id : "root";

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current && e.target.parentNode !== ref.current) {
      return;
    }

    // @ts-ignore
    const mouseX = (e.clientX - boundingRect.left) / scale - position.x;
    // @ts-ignore
    const mouseY = (e.clientY - boundingRect.top) / scale - position.y;

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

  //#region Pan and zoom behaviour
  const transformRef = useRef(null);
  const { handleWheel, handleMouseDown, animate, scale, position } =
    useSmoothBoardControls(transformRef, ref);

  animate();
  //#endregion

  //#region Drop behaviour
  const { drop, allowDrop } = useBoardDrop({
    accept: [
      BoardObjects.BOARD,
      BoardObjects.NOTE,
      BoardObjects.COLUMN,
      BoardObjects.TODO,
      BoardObjects.IMAGE,
      SidebarObjects.NOTE,
      SidebarObjects.COLUMN,
      SidebarObjects.IMAGE,
      SidebarObjects.TODO,
      SidebarObjects.BOARD,
    ],
    boardId,
    boardRef: ref,
    position,
    scale,
  });
  //#endregion

  //#region Context Menu
  const initialRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRightClick = (e) => {
    if (e.target !== ref.current && e.target.parentNode !== ref.current) {
      return;
    }
    // @ts-ignore
    const boundingRect = ref.current.getBoundingClientRect();

    const mouseX = (e.clientX - boundingRect.left) / scale - position.x;
    const mouseY = (e.clientY - boundingRect.top) / scale - position.y;

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
          zIndex={"popover"}
          position="absolute"
          left={mousePos.x + "px"}
          top={mousePos.y + "px"}
          h={"fit-content"}
        >
          <MenuItem
            onClick={(e) => {
              // @ts-ignore
              const boundingRect = ref.current.getBoundingClientRect();
              const newNote = {
                id: uuidv4(),
                type: BoardObjects.NOTE,
                pX: (e.clientX - boundingRect.left) / scale - position.x,
                pY: (e.clientY - boundingRect.top) / scale - position.y,
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
          <MenuItem
            onClick={(e) => {
              // @ts-ignore
              const boundingRect = ref.current.getBoundingClientRect();
              const newColumn = {
                id: uuidv4(),
                type: BoardObjects.COLUMN,
                pX: (e.clientX - boundingRect.left) / scale - position.x,
                pY: (e.clientY - boundingRect.top) / scale - position.y,
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
            }}
          >
            New Column
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              // @ts-ignore
              const boundingRect = ref.current.getBoundingClientRect();
              const newPicture = {
                id: uuidv4(),
                type: BoardObjects.IMAGE,
                pX: (e.clientX - boundingRect.left) / scale - position.x,
                pY: (e.clientY - boundingRect.top) / scale - position.y,
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
            }}
          >
            New Image
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              // @ts-ignore
              const boundingRect = ref.current.getBoundingClientRect();
              const newTask = {
                id: uuidv4(),
                type: BoardObjects.TODO,
                pX: (e.clientX - boundingRect.left) / scale - position.x,
                pY: (e.clientY - boundingRect.top) / scale - position.y,
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
            }}
          >
            New To-Do
          </MenuItem>
        </MenuList>
      </Menu>
    );
  };
  //#endregion

  //#region Render board
  return (
    <Box
      ref={ref}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
      }}
      bgColor={useColorModeValue("gray.200", "gray.900")}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        console.log("hi");
        handleRightClick(e);
      }}
      onDrop={(event) => drop(event)}
      onDragOver={(event) => {
        allowDrop(event);
      }}
    >
      <Box
        ref={transformRef}
        style={{
          transformOrigin: "top left",
          width: "100%",
          height: "100%",
        }}
      >
        <ContextMenu />
        {childRefs.map(({ childId, childType }) => {
          switch (childType) {
            case BoardObjects.NOTE:
              return (
                <Note
                  key={childId}
                  id={childId}
                  boardRef={ref}
                  offset={position}
                  scale={scale}
                />
              );
            case BoardObjects.COLUMN:
              return (
                <Column
                  key={childId}
                  boardId={boardId}
                  columnId={childId}
                  boardRef={ref}
                  offset={position}
                  scale={scale}
                />
              );
            case BoardObjects.IMAGE:
              return (
                <Picture
                  key={childId}
                  boardId={boardId}
                  id={childId}
                  boardRef={ref}
                  offset={position}
                  scale={scale}
                />
              );
            case BoardObjects.TODO:
              return (
                <ToDo
                  key={childId}
                  boardId={boardId}
                  id={childId}
                  boardRef={ref}
                  offset={position}
                  scale={scale}
                />
              );
            case BoardObjects.BOARD:
              return (
                <BoardIcon
                  key={childId}
                  boardId={boardId}
                  id={childId}
                  boardRef={ref}
                  offset={position}
                  scale={scale}
                />
              );
            default:
              break;
          }
        })}
      </Box>
    </Box>
  );
  //#endregion
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.router.params;
  const boardId = id ? id : "root";
  const board = state.boards[boardId];
  // redirect to "/" if board is not valid
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
      addColumn,
      addPicture,
      addTask,
    },
    dispatch
  );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Board));
