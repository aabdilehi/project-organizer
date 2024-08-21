//#region Imports
import React, { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { connect, useDispatch } from "react-redux";

import { BoardObjects } from "../utils/enums/items";
import Note from "./Note";

import { addChild, addNode } from "../utils/slices/nodeActions";
import { bindActionCreators } from "redux";

import { useDrop } from "../utils/hooks/useDrop";
import { useSmoothBoardControls } from "../utils/hooks/useSmoothBoardControls";
import { withRouter } from "./Modular/ComponentWithRouterProp.jsx";
import { useContextMenu } from "../utils/hooks/useContextMenu.tsx";
import { NoteC } from "../utils/classes/classes";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
import Column from "./Column";
import { clearSelectNode } from "../utils/slices/selectionSlice";
import BoardIcon from "./BoardIcon.jsx";
import Document from "./Document.jsx";
//#endregion

const Board = ({ validBoard, title, router, childRefs }) => {
  //#region Handle initial page setup
  const { id } = router.params;
  const boardId = id ? id : "root";

  const dispatch = useDispatch();

  //#region References
  const ref = useRef();
  const transformRef = useRef();
  //#endregion

  const calculateRelativePosition = (x, y) => {
    const boundingRect = ref.current.getBoundingClientRect();
    const newX = (x - boundingRect.left) / scale - position.x;
    const newY = (y - boundingRect.top) / scale - position.y;

    return {
      x: newX,
      y: newY,
    };
  };

  const calculateAbsolutePosition = (x, y) => {
    const boundingRect = ref.current.getBoundingClientRect();
    const newX = x + position.x;
    const newY = y + position.y;

    return {
      x: newX,
      y: newY,
    };
  };

  const getMouse = (e) => {
    return calculateRelativePosition(e.clientX, e.clientY);
  };

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current && e.target.parentNode !== ref.current) {
      return;
    }

    const { x: mouseX, y: mouseY } = getMouse(e);
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
  const { handleWheel, handleMouseDown, scale, position } =
    useSmoothBoardControls(transformRef, ref);

  //#endregion

  //#region Drag behaviour

  const { handleDragStart, handleDrag, clearPortal, draggedNodes } =
    useSmoothDrag({
      boardRef: ref,
      transformRef: transformRef,
      offset: position,
      scale,
    });

  //#endregion

  //#region Drop behaviour
  const { dropOnBoard, dropOnColumn, allowDropOnBoard, allowDropOnColumn } =
    useDrop({
      boardRef: ref,
      scale,
      clearPortal,
      draggedNodes,
    });
  //#endregion

  //#region Context Menu
  const { handleRightClick, ContextMenu } = useContextMenu({
    boardId,
    containerRef: ref,
    calculatePosition: calculateRelativePosition,
  });

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

  // const updateContextMenu = (e) => {
  //   const { mouseX, mouseY } = getMouse(e);
  //   setMenuItems();
  //   setMenuProps({
  //     canPaste: true,
  //     paste: (nodes) => {
  //       pasteNodes(nodes, mouseX, mouseY);
  //     },
  //   });
  // };

  //#endregion

  const randomRef = useRef();
  //#region Render board
  if (validBoard) {
    return (
      <div
        ref={ref}
        className="actualboard"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target == transformRef.current || e.target == ref.current) {
            dispatch(clearSelectNode());
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (e.target == transformRef.current || e.target == ref.current) {
            dispatch(clearSelectNode());
          }
          handleRightClick(e);
        }}
        onDrop={(event) => {
          event.stopPropagation();
          dropOnBoard(event, boardId);
        }}
        onDragOver={(event) => {
          allowDropOnBoard(event);
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={clearPortal}
        onResize={(e) => e.preventDefault()}
      >
        <ContextMenu />
        <div ref={transformRef} className="board-transform">
          {childRefs.map(({ childId, childType }) => {
            switch (childType) {
              case BoardObjects.NOTE:
                return <Note key={childId} id={childId} />;
              case BoardObjects.COLUMN:
                return (
                  <Column
                    key={childId}
                    id={childId}
                    drop={dropOnColumn}
                    allowDrop={allowDropOnColumn}
                    dropOnBoard={dropOnBoard}
                    allowDropOnBoard={allowDropOnBoard}
                  />
                );
              case BoardObjects.BOARD:
                return (
                  <BoardIcon
                    key={childId}
                    id={childId}
                    drop={dropOnBoard}
                    allowDrop={allowDropOnBoard}
                  />
                );
              case BoardObjects.DOCUMENT:
                return <Document key={childId} id={childId} />;
              default:
                break;
            }
          })}
        </div>
      </div>
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
