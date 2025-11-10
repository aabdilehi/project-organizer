import { BoardObjects, DragAction, ResizeDirection } from "../enums/items";

import {
  addNode,
  addChild,
  removeChild,
  updateParent,
  updatePosition,
  updateSize,
} from "../slices/nodeActions";

import { v4 as uuidv4 } from "uuid";
import { createNodeThunk } from "../slices/thunks";

import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import { formatData, NodeTypeMap } from "../classes/new-classes";
import { selectNodes } from "../slices/selectors";

const boardAcceptedTypes = [
  BoardObjects.BOARD,
  BoardObjects.NOTE,
  BoardObjects.TASK,
  BoardObjects.GROUP,
  BoardObjects.IMAGE,
  BoardObjects.DOCUMENT,
];

export function useDrop({ boardRef, scale, offset }) {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const handledNodes = useRef([]);

  function allowDropOnBoard(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // "board", "toolbar" (or some other form of differentiating between existing nodes and new nodes, eg. "node/new", "node/existing")
  function dropOnBoard(event, id) {
    event.stopPropagation();
    event.preventDefault();

    const boardId = id ?? "root";
    console.log(event.dataTransfer.types);
    //#region Drop from toolbar
    if (event.dataTransfer.types.includes("origin/toolbar")) {
      let data = JSON.parse(event.dataTransfer.getData("origin/toolbar"));
      if (!boardAcceptedTypes.includes(data.type)) return;
      createNode(event, data, boardId, BoardObjects.BOARD, offset, scale);
      return;
    }
    //#endregion

    // event.stopPropagation();
    // event.preventDefault();
    // return;

    //#region Drop from board/column
    if (event.dataTransfer.types.includes(DragAction.MOVE)) {
      let data = event.dataTransfer.getData(DragAction.MOVE);
      data = JSON.parse(data);
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (
          !boardAcceptedTypes.includes(item.type) ||
          item.id === boardId ||
          handledNodes.current.find((node) => node.id === item.id)
        ) {
          return;
        }

        if (boardAcceptedTypes.includes(item.type)) {
          // check if should re-parent
          if (item.parent.id !== boardId) {
            updateNodeParent(item, boardId, BoardObjects.BOARD);
            setNodePosition(event, item, data.initial);
          } else {
            setNodePosition(event, item, data.initial);
          }
        }
      });
    }
    //#endregion

    //#region Drop from board/column
    if (event.dataTransfer.types.includes(DragAction.RESIZE)) {
      let data = JSON.parse(event.dataTransfer.getData(DragAction.RESIZE));
      let direction = event.dataTransfer.types.find((value) =>
        Object.values(ResizeDirection).includes(value)
      );
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (boardAcceptedTypes.includes(item.type)) {
          setNodeSize(event, item, data.initial, direction);
        }
      });
    }
    //#endregion

    //#region Drop text
    if (event.dataTransfer.types.includes("plain/text")) {
      let data = event.dataTransfer.getData("plain/text");
      createNode(
        event,
        { type: BoardObjects.NOTE },
        boardId,
        BoardObjects.BOARD,
        {
          content: data,
        }
      );
    }
    handledNodes.current = [];
  }

  function createNode(event, data, pId, pType, offset, scale) {
    const boundingRect = boardRef.current.getBoundingClientRect();
    const xCoord = (event.clientX - boundingRect.left - offset.x) / scale;
    const yCoord = (event.clientY - boundingRect.top - offset.y) / scale;
    dispatch(
      createNodeThunk({
        id: uuidv4(),
        pX: xCoord,
        pY: yCoord,
        type: data.type,
        parent: {
          id: pId,
          type: pType,
        },
      })
    );
  }
  function updateNodeParent(data, pId, pType) {
    dispatch(
      updateParent.action({
        id: data.id,
        type: data.type,
        parent: {
          id: pId,
          type: pType,
        },
      })
    );
    dispatch(
      removeChild.action({
        id: data.parent.id,
        type: data.parent.type,
        cId: data.id,
      })
    );
    dispatch(
      addChild.action({
        id: pId,
        type: pType,
        cId: data.id,
        cType: data.type,
      })
    );
  }
  function setNodePosition(event, data, initial) {
    const boundingRect = boardRef.current.getBoundingClientRect();
    const node = nodes[data.id];
    if (!node || !data.offset) {
      const xCoord = (event.clientX - boundingRect.left) / scale;
      const yCoord = (event.clientY - boundingRect.top) / scale;

      dispatch(
        updatePosition.action({
          id: data.id,
          type: data.type,
          pX: xCoord,
          pY: yCoord,
        })
      );
      return;
    }

    const xCoord = data.offset.x + (event.clientX - initial.x) / scale;
    const yCoord = data.offset.y + (event.clientY - initial.y) / scale;
    dispatch(
      updatePosition.action({
        id: data.id,
        type: data.type,
        pX: xCoord,
        pY: yCoord,
      })
    );
  }

  function setNodeSize(event, data, initial, direction) {
    let pX, pY, sX, sY;

    switch (direction) {
      case ResizeDirection.LEFT:
        pX = data.pX + (event.clientX - initial.x) / scale;
        pY = data.pY;
        sX = data.sX - (event.clientX - initial.x) / scale;
        sY = data.sY;
        break;
      case ResizeDirection.RIGHT:
        pX = data.pX;
        pY = data.pY;
        sX = data.sX + (event.clientX - initial.x) / scale;
        sY = data.sY;
        break;
      case ResizeDirection.TOP:
        pX = data.pX;
        pY = data.pY + (event.clientY - initial.y) / scale;
        sX = data.sX;
        sY = data.sY - (event.clientY - initial.y) / scale;
        break;

      case ResizeDirection.TOPLEFT:
        pX = data.pX + (event.clientX - initial.x) / scale;
        pY = data.pY + (event.clientY - initial.y) / scale;
        sX = data.sX - (event.clientX - initial.x) / scale;
        sY = data.sY - (event.clientY - initial.y) / scale;
        break;

      case ResizeDirection.TOPRIGHT:
        pX = data.pX;
        pY = data.pY + (event.clientY - initial.y) / scale;
        sX = data.sX + (event.clientX - initial.x) / scale;
        sY = data.sY - (event.clientY - initial.y) / scale;
        break;
      case ResizeDirection.BOTTOM:
        pX = data.pX;
        pY = data.pY;
        sX = data.sX;
        sY = data.sY + (event.clientY - initial.y) / scale;
        break;
      case ResizeDirection.BOTTOMLEFT:
        pX = data.pX + (event.clientX - initial.x) / scale;
        pY = data.pY;
        sX = data.sX - (event.clientX - initial.x) / scale;
        sY = data.sY + (event.clientY - initial.y) / scale;
        break;
      case ResizeDirection.BOTTOMRIGHT:
        pX = data.pX;
        pY = data.pY;
        sX = data.sX + (event.clientX - initial.x) / scale;
        sY = data.sY + (event.clientY - initial.y) / scale;
        break;
      default:
        pX = data.pX;
        pY = data.pY;
        sX = data.sX;
        sY = data.sY;
        break;
    }
    dispatch(
      updatePosition.action({
        id: data.id,
        type: data.type,
        pX,
        pY,
      })
    );
    dispatch(
      updateSize.action({
        id: data.id,
        type: data.type,
        sX,
        sY,
      })
    );
  }

  return {
    allowDropOnBoard,
    dropOnBoard,
  };
}
