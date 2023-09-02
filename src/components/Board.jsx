//#region Imports
import React, { useContext, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  MenuDivider,
  MenuItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { connect, useDispatch } from "react-redux";

import { BoardObjects, SidebarObjects } from "../utils/enums/items";

import BoardIcon from "./BoardIcon";

import Note from "./Note";
//import { addNote } from "../utils/slices/noteSlice";
import { addChild, addNode } from "../utils/slices/nodeActions";
import { bindActionCreators } from "redux";

import Column from "./Column";
import Picture from "./Picture";
import ToDo from "./ToDo";
import Document from "./Document";
import { useBoardDrop } from "../utils/hooks/useDrop";
import { useSmoothBoardControls } from "../utils/hooks/useSmoothBoardControls";
import { withRouter } from "./ComponentWithRouterProp";
import {
  ContextMenuContext,
  useContextMenu,
} from "../utils/hooks/useContextMenu";
import {
  BoardC,
  ColumnC,
  DocumentC,
  NoteC,
  PictureC,
  TaskC,
} from "../utils/classes/classes";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
//#endregion

const Board = ({ validBoard, title, router, childRefs }) => {
  //#region Handle initial page setup
  const { id } = router.params;
  const boardId = id ? id : "root";

  const dispatch = useDispatch();

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
    const newNote = new NoteC({
      pX: mouseX,
      pY: mouseY,
      parent: {
        id: boardId,
        type: BoardObjects.BOARD,
      },
    });
    dispatch(addNode.action(newNote));
    dispatch(
      addChild.action({
        id: boardId,
        type: BoardObjects.BOARD,
        cId: newNote.id,
        cType: newNote.type,
      })
    );
  };

  //#region Pan and zoom behaviour
  const {
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    animate: boardAnimate,
    scale,
    position,
  } = useSmoothBoardControls(transformRef, ref);

  boardAnimate();
  //#endregion

  //#region Drag behaviour

  const {
    handleDragStart,
    handleDrag,
    handleDragEnd,
    animate: nodeAnimate,
  } = useSmoothDrag({
    boardRef: ref,
    offset: position,
    scale,
  });

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

  const { setMenuItems, setMenuProps, copiedNodes } =
    useContext(ContextMenuContext);

  const pasteNodes = (nodes, mouseX, mouseY) => {
    nodes?.forEach((node) => {
      let copiedNode;
      switch (node.type) {
        case BoardObjects.NOTE:
          copiedNode = {
            ...node,
            pX: mouseX,
            pY: mouseY,
            parent: !!node.parent
              ? node.parent
              : { id: boardId, type: BoardObjects.BOARD },
          };
          break;
        case BoardObjects.DOCUMENT:
          copiedNode = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: !!node.parent
              ? node.parent
              : { id: boardId, type: BoardObjects.BOARD },
          };
          break;
        case BoardObjects.IMAGE:
          copiedNode = {
            ...node,
            pX: mouseX,
            pY: mouseY,
            parent: !!node.parent
              ? node.parent
              : { id: boardId, type: BoardObjects.BOARD },
          };
          break;
        case BoardObjects.TODO:
          copiedNode = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: !!node.parent
              ? node.parent
              : { id: boardId, type: BoardObjects.BOARD },
          };
          break;
        case BoardObjects.COLUMN:
          // Need to copy the contents of the column and assign new Ids to them
          copiedNode = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          break;
        case BoardObjects.BOARD:
          copiedNode = {
            ...node,
            id: uuidv4(),
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          break;
        default:
          break;
      }

      /// I think the order is messed up here
      // Maybe go through and only add the nodes that have parent as this board
      // Then do second pass (things can only ever be 2 levels deep I think?)
      // Nvm boards can have other boards that have other boards
      // then i guess do the board idea then just go recursively?
      if (!!copiedNode) {
        dispatch(addNode.action(copiedNode));
        dispatch(
          addChild.action({
            id: copiedNode.parent.id,
            type: copiedNode.parent.type,
            cId: copiedNode.id,
            cType: copiedNode.type,
          })
        );
      }
    });
  };

  const updateContextMenu = (e) => {
    const { mouseX, mouseY } = getMouse(e);
    setMenuItems([
      //<MenuItem onClick={() => pasteNodes(mouseX, mouseY)}>Paste</MenuItem>,
      //<MenuDivider />,
      <MenuItem // Note
        onClick={() => {
          const { ...newNote } = new NoteC({
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          });
          dispatch(addNode.action(newNote));
          dispatch(
            addChild.action({
              id: boardId,
              type: BoardObjects.BOARD,
              cId: newNote.id,
              cType: newNote.type,
            })
          );
        }}
      >
        New Note
      </MenuItem>,
      <MenuItem // Document
        onClick={() => {
          const { ...newDocument } = new DocumentC({
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          });
          dispatch(addNode.action(newDocument));
          dispatch(
            addChild.action({
              id: boardId,
              type: BoardObjects.BOARD,
              cId: newDocument.id,
              cType: newDocument.type,
            })
          );
        }}
      >
        New Document
      </MenuItem>,
      <MenuItem // Task
        onClick={() => {
          const { ...newTask } = new TaskC({
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          });
          dispatch(addNode.action(newTask));
          dispatch(
            addChild.action({
              id: boardId,
              type: BoardObjects.BOARD,
              cId: newTask.id,
              cType: newTask.type,
            })
          );
        }}
      >
        New Task
      </MenuItem>,
      <MenuItem // Column
        onClick={() => {
          const { ...newColumn } = new ColumnC({
            pX: mouseX,
            pY: mouseY,
            sX: 200,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          });
          dispatch(addNode.action(newColumn));
          dispatch(
            addChild.action({
              id: boardId,
              type: BoardObjects.BOARD,
              cId: newColumn.id,
              cType: newColumn.type,
            })
          );
        }}
      >
        New Column
      </MenuItem>,
      <MenuItem // Board
        onClick={() => {
          const { ...newBoard } = new BoardC({
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          });
          dispatch(addNode.action(newBoard));
          dispatch(
            addChild.action({
              id: boardId,
              type: BoardObjects.BOARD,
              cId: newBoard.id,
              cType: newBoard.type,
            })
          );
        }}
      >
        New Board
      </MenuItem>,
      <MenuItem // Picture
        onClick={() => {
          const { ...newPicture } = new PictureC({
            pX: mouseX,
            pY: mouseY,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          });
          dispatch(addNode.action(newPicture));
          dispatch(
            addChild.action({
              id: boardId,
              type: BoardObjects.BOARD,
              cId: newPicture.id,
              cType: newPicture.type,
            })
          );
        }}
      >
        New Image
      </MenuItem>,
    ]);
    setMenuProps({
      canPaste: true,
      paste: (nodes) => {
        pasteNodes(nodes, mouseX, mouseY);
      },
    });
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
        onDrop={(event) => {
          drop(event);
        }}
        onDragOver={(event) => {
          allowDrop(event);
        }}
        onResize={(e) => e.preventDefault()}
      >
        <ContextMenu canCopy canCut canDelete />
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
                    openContextMenu={handleRightClick}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={nodeAnimate}
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
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={nodeAnimate}
                  />
                );
              case BoardObjects.IMAGE:
                return (
                  <Picture
                    key={childId}
                    id={childId}
                    openContextMenu={handleRightClick}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={nodeAnimate}
                  />
                );
              case BoardObjects.TODO:
                return (
                  <ToDo
                    key={childId}
                    id={childId}
                    openContextMenu={handleRightClick}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={nodeAnimate}
                  />
                );
              case BoardObjects.BOARD:
                return (
                  <BoardIcon
                    key={childId}
                    id={childId}
                    openContextMenu={handleRightClick}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={nodeAnimate}
                  />
                );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={childId}
                    id={childId}
                    openContextMenu={handleRightClick}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={nodeAnimate}
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
  return bindActionCreators({}, dispatch);
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Board));
