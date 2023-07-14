//#region Imports
import React, { useContext, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  MenuDivider,
  MenuItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { connect } from "react-redux";

import { BoardObjects, SidebarObjects } from "../utils/enums/items";

import BoardIcon from "./BoardIcon";
import {
  addBoard,
  addBoardChild,
  removeBoardChild,
} from "../utils/slices/boardSlice";

import Note from "./Note";
import { addNote } from "../utils/slices/noteSlice";
import { bindActionCreators } from "redux";

import Column from "./Column";
import { addColumn } from "../utils/slices/columnSlice";

import Picture from "./Picture";
import { addPicture } from "../utils/slices/pictureSlice";

import ToDo from "./ToDo";
import { addTask } from "../utils/slices/taskSlice";

import Document from "./Document";
import { addDocument } from "../utils/slices/docSlice";

import { useBoardDrop } from "../utils/hooks/useDrop";
import { useSmoothBoardControls } from "../utils/hooks/useSmoothBoardControls";
import { withRouter } from "./ComponentWithRouterProp";
import {
  ContextMenuContext,
  useContextMenu,
} from "../utils/hooks/useContextMenu";
import { NoteC, TaskC } from "../utils/classes/classes";
//#endregion

const Board = ({
  validBoard,
  title,
  router,
  childRefs,
  addNote,
  addBoardChild,
  addColumn,
  addTask,
  addPicture,
  addBoard,
  addDocument,
}) => {
  //#region Handle initial page setup
  const { id } = router.params;
  const boardId = id ? id : "root";

  // Redirect if board is invalid
  useEffect(() => {
    if (!validBoard) {
      router.navigate("/");
    }
  }, []);

  // Set title of page to name of board
  useEffect(() => {
    if (document.querySelector("title")) {
      document.querySelector("title").textContent = title ? title : "Home";
    }
  }, [document.querySelector("title"), title]);
  //#endregion

  //#region References
  const ref = useRef(null);
  const transformRef = useRef(null);
  //#endregion

  const getMouse = (e) => {
    const boundingRect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - boundingRect.left) / scale - position.x;
    const mouseY = (e.clientY - boundingRect.top) / scale - position.y;

    return {
      mouseX,
      mouseY,
    };
  };

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current && e.target.parentNode !== ref.current) {
      return;
    }

    const { mouseX, mouseY } = getMouse(e);
    const newNote = new NoteC(mouseX, mouseY, undefined, undefined, undefined, {
      id: boardId,
      type: BoardObjects.BOARD,
    });
    addNote(newNote);
    addBoardChild({ boardId, childId: newNote.id, childType: newNote.type });
  };

  //#region Pan and zoom behaviour
  const {
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    animate,
    scale,
    position,
  } = useSmoothBoardControls(transformRef, ref);

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
      BoardObjects.DOCUMENT,
      SidebarObjects.NOTE,
      SidebarObjects.COLUMN,
      SidebarObjects.IMAGE,
      SidebarObjects.TODO,
      SidebarObjects.BOARD,
      SidebarObjects.DOCUMENT,
    ],
    boardId,
    boardRef: ref,
    position,
    scale,
  });
  //#endregion

  //#region Context Menu
  const { handleRightClick, ContextMenu } = useContextMenu({
    containerRef: ref,
  });

  const { setMenuItems, copiedNodes } = useContext(ContextMenuContext);

  const pasteNodes = (mouseX, mouseY) => {
    copiedNodes.forEach((node) => {
      switch (node.type) {
        case BoardObjects.NOTE:
          const copiedNote = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: { id: boardId, type: BoardObjects.BOARD },
          };
          addNote(copiedNote);
          addBoardChild({
            boardId,
            childId: copiedNote.id,
            childType: copiedNote.type,
          });
          break;
        case BoardObjects.DOCUMENT:
          const copiedDocument = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          addDocument(copiedDocument);
          addBoardChild({
            boardId,
            childId: copiedDocument.id,
            childType: copiedDocument.type,
          });
          break;
        case BoardObjects.IMAGE:
          const newPicture = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
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
          break;
        case BoardObjects.TODO:
          const copiedTask = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          addTask(copiedTask);
          addBoardChild({
            boardId,
            childId: copiedTask.id,
            childType: copiedTask.type,
          });
          break;
        case BoardObjects.COLUMN:
          // Need to copy the contents of the column and assign new Ids to them
          const copiedColumn = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
            childRefs: [],
          };
          addColumn(copiedColumn);
          addBoardChild({
            boardId,
            childId: copiedColumn.id,
            childType: copiedColumn.type,
          });
          break;
        case BoardObjects.BOARD:
          const copiedBoard = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
            childRefs: [],
          };
          addBoard(copiedBoard);
          addBoardChild({
            boardId,
            childId: copiedBoard.id,
            childType: copiedBoard.type,
          });
          break;
        default:
          break;
      }
    });
  };

  const updateContextMenu = (e) => {
    const { mouseX, mouseY } = getMouse(e);
    setMenuItems([
      <MenuItem onClick={() => pasteNodes(mouseX, mouseY)}>Paste</MenuItem>,
      <MenuDivider />,
      <MenuItem
        onClick={() => {
          const newNote = new NoteC(
            mouseX,
            mouseY,
            undefined,
            undefined,
            undefined,
            {
              id: boardId,
              type: BoardObjects.BOARD,
            }
          );
          addNote(newNote);
          addBoardChild({
            boardId,
            childId: newNote.id,
            childType: newNote.type,
          });
        }}
      >
        New Note
      </MenuItem>,
      <MenuItem
        onClick={() => {
          const newDocument = {
            id: uuidv4(),
            type: BoardObjects.DOCUMENT,
            pX: mouseX,
            pY: mouseY,
            title: "New Document",
            content: `<strong>New note<strong>`,
            expanded: false,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          addDocument(newDocument);
          addBoardChild({
            boardId,
            childId: newDocument.id,
            childType: newDocument.type,
          });
        }}
      >
        New Document
      </MenuItem>,
      <MenuItem
        onClick={() => {
          const { ...newTask } = new TaskC(
            mouseX,
            mouseY,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              id: boardId,
              type: BoardObjects.BOARD,
            }
          );
          addTask(newTask);
          addBoardChild({
            boardId,
            childId: newTask.id,
            childType: newTask.type,
          });
        }}
      >
        New Task
      </MenuItem>,
      <MenuItem
        onClick={() => {
          const newColumn = {
            id: uuidv4(),
            type: BoardObjects.COLUMN,
            pX: mouseX,
            pY: mouseY,
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
      </MenuItem>,
      <MenuItem
        onClick={() => {
          const newBoard = {
            id: uuidv4(),
            type: BoardObjects.BOARD,
            pX: mouseX,
            pY: mouseY,
            title: "New Board",
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
            childRefs: [],
          };
          addBoard(newBoard);
          addBoardChild({
            boardId,
            childId: newBoard.id,
            childType: newBoard.type,
          });
        }}
      >
        New Board
      </MenuItem>,
      <MenuItem
        onClick={() => {
          const newPicture = {
            id: uuidv4(),
            type: BoardObjects.IMAGE,
            pX: mouseX,
            pY: mouseY,
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
      </MenuItem>,
    ]);
  };

  //#endregion

  //#region Render board
  if (validBoard) {
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
        // onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          updateContextMenu(e);
          handleRightClick(e);
        }}
        onDrop={(event) => drop(event)}
        onDragOver={(event) => {
          allowDrop(event);
        }}
        onResize={(e) => e.preventDefault()}
      >
        <ContextMenu />
        <Box
          ref={transformRef}
          style={{
            transformOrigin: "top left",
            width: "100%",
            height: "100%",
          }}
          onPaste={(event) => {
            event.preventDefault();
            event.stopPropagation();
            pasteNodes(0, 0);
          }}
        >
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
                    openContextMenu={handleRightClick}
                  />
                );
              case BoardObjects.COLUMN:
                return (
                  <Column
                    key={childId}
                    boardId={boardId}
                    id={childId}
                    boardRef={ref}
                    offset={position}
                    scale={scale}
                    openContextMenu={handleRightClick}
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
                    openContextMenu={handleRightClick}
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
                    openContextMenu={handleRightClick}
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
                    openContextMenu={handleRightClick}
                  />
                );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={childId}
                    boardId={boardId}
                    id={childId}
                    boardRef={ref}
                    offset={position}
                    scale={scale}
                    openContextMenu={handleRightClick}
                  />
                );
              default:
                break;
            }
          })}
        </Box>
      </Box>
    );
  }
  //#endregion
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.router.params;
  const boardId = id ? id : "root";
  const board = state.boards[boardId];
  if (board) {
    return {
      validBoard: true,
      title: board.title,
      childRefs: board.childRefs,
      parent: board.parent,
    };
  }
  return {
    validBoard: false,
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
      addBoard,
      addDocument,
    },
    dispatch
  );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Board));
