import { BoardObjects, SidebarObjects } from "../enums/items";

import {
  addNode,
  addChild,
  removeChild,
  updateParent,
  updatePosition,
  updateSize,
} from "../slices/nodeActions";

import { useDispatch, useSelector } from "react-redux";
import { PictureC } from "../classes/classes";
import { useRef } from "react";
import {
  BoardClass,
  ColumnClass,
  DocumentClass,
  NoteClass,
  TaskClass,
  TypeClassMap,
} from "../classes/new-classes";

const columnAcceptedTypes = [
  BoardObjects.NOTE,
  BoardObjects.TASK,
  BoardObjects.IMAGE,
  BoardObjects.BOARD,
  BoardObjects.DOCUMENT,
  SidebarObjects.NOTE,
  SidebarObjects.IMAGE,
  SidebarObjects.TASK,
  SidebarObjects.BOARD,
  SidebarObjects.DOCUMENT,
];

const boardAcceptedTypes = [
  BoardObjects.BOARD,
  BoardObjects.NOTE,
  BoardObjects.COLUMN,
  BoardObjects.TASK,
  BoardObjects.GROUP,
  BoardObjects.IMAGE,
  BoardObjects.DOCUMENT,
  SidebarObjects.NOTE,
  SidebarObjects.COLUMN,
  SidebarObjects.IMAGE,
  SidebarObjects.TASK,
  SidebarObjects.GROUP,
  SidebarObjects.BOARD,
  SidebarObjects.DOCUMENT,
];

export function useDrop({ boardRef, scale, offset }) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const handledNodes = useRef([]);

  function allowDropOnBoard(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // "board", "sidebar" (or some other form of differentiating between existing nodes and new nodes, eg. "node/new", "node/existing")
  function dropOnBoard(event, id) {
    event.stopPropagation();
    event.preventDefault();

    const boardId = id ?? "root";

    //#region Drop from sidebar
    if (event.dataTransfer.types.includes("origin/sidebar")) {
      let data = JSON.parse(event.dataTransfer.getData("origin/sidebar"));
      if (!boardAcceptedTypes.includes(data.type)) return;
      createNode(event, data, boardId, BoardObjects.BOARD, offset, scale);
      return;
    }
    //#endregion

    // event.stopPropagation();
    // event.preventDefault();
    // return;

    //#region Drop from board/column
    if (event.dataTransfer.types.includes("action/move")) {
      let data = event.dataTransfer.getData("action/move");
      console.log(data == "");
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
    if (event.dataTransfer.types.includes("action/resize")) {
      let data = JSON.parse(event.dataTransfer.getData("action/resize"));
      let direction = event.dataTransfer.types.find((value) =>
        value.includes("direction/")
      );
      console.log(direction);
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

  const allowDropOnColumn = (event) => {
    if (event.dataTransfer.types.length <= 0) return;
    if (
      !event.dataTransfer.types.includes("origin/board") &&
      !event.dataTransfer.types.includes("origin/sidebar")
    )
      return;
    event.stopPropagation();
    event.preventDefault();
  };

  function dropOnColumn(event, id) {
    //#region Drop from sidebar
    let data = event.dataTransfer.getData("origin/sidebar");
    if (data) {
      data = JSON.parse(data);
      if (!columnAcceptedTypes.includes(data.type)) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      createNode(event, data, id, BoardObjects.COLUMN, offset, scale);
      return;
    }
    //#endregion
    // event.stopPropagation();
    // event.preventDefault();
    // return;
    //#region Drop from board/column
    data = event.dataTransfer.getData("action/move");
    if (data) {
      data = JSON.parse(data);
      handledNodes.current = [];
      // determine here what can be handled based on accepted types
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (!columnAcceptedTypes.includes(item.type) || item.id === id) return;
        if (handledNodes.current.find((node) => node.id === item.id)) return;
        updateNodeParent(item, id, BoardObjects.COLUMN);
        handledNodes.current = [...handledNodes.current, item];
      });
    }
    //#endregion
  }

  function createNode(event, data, pId, pType, offset, scale) {
    const boundingRect = boardRef.current.getBoundingClientRect();
    const xCoord =
      (event.clientX - boundingRect.left - offset.current.x) / scale.current;
    const yCoord =
      (event.clientY - boundingRect.top - offset.current.y) / scale.current;
    let node;

    switch (data.type) {
      case SidebarObjects.NOTE:
      case SidebarObjects.TASK:
      case SidebarObjects.BOARD:
      case SidebarObjects.COLUMN:
      case SidebarObjects.GROUP:
      case SidebarObjects.DOCUMENT:
        node = new TypeClassMap[data.type]({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        }).serialize();
        break;
      case SidebarObjects.IMAGE:
        node = new PictureC({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        });
        break;
    }

    if (!!node) {
      dispatch(addNode.action(node));
      dispatch(
        addChild.action({
          id: pId,
          type: pType,
          cId: node.id,
          cType: node.type,
        })
      );
    }
  }
  function updateNodeParent(data, pId, pType) {
    console.log(data);
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
    const node = state[data.type + "s"][data.id];
    if (!node || !data.offset) {
      const xCoord = (event.clientX - boundingRect.left) / scale.current;
      const yCoord = (event.clientY - boundingRect.top) / scale.current;

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

    const xCoord = data.offset.x + (event.clientX - initial.x) / scale.current;
    const yCoord = data.offset.y + (event.clientY - initial.y) / scale.current;
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
    if (!data.offset) {
      return;
    }

    console.log(data);
    let pX, pY, sX, sY;

    switch (direction) {
      case "direction/left":
        pX = data.pX + (event.clientX - initial.x) / scale.current;
        pY = data.pY;
        sX = data.sX - (event.clientX - initial.x) / scale.current;
        sY = data.sY;
        break;
      case "direction/right":
        pX = data.pX;
        pY = data.pY;
        sX = data.sX + (event.clientX - initial.x) / scale.current;
        sY = data.sY;
        break;
      case "direction/top":
        pX = data.pX;
        pY = data.pY + (event.clientY - initial.y) / scale.current;
        sX = data.sX;
        sY = data.sY - (event.clientY - initial.y) / scale.current;
        break;

      case "direction/top-left":
        pX = data.pX + (event.clientX - initial.x) / scale.current;
        pY = data.pY + (event.clientY - initial.y) / scale.current;
        sX = data.sX - (event.clientX - initial.x) / scale.current;
        sY = data.sY - (event.clientY - initial.y) / scale.current;
        break;

      case "direction/top-right":
        pX = data.pX;
        pY = data.pY + (event.clientY - initial.y) / scale.current;
        sX = data.sX + (event.clientX - initial.x) / scale.current;
        sY = data.sY - (event.clientY - initial.y) / scale.current;
        break;
      case "direction/bottom":
        pX = data.pX;
        pY = data.pY;
        sX = data.sX;
        sY = data.sY + (event.clientY - initial.y) / scale.current;
        break;
      case "direction/bottom-left":
        pX = data.pX + (event.clientX - initial.x) / scale.current;
        pY = data.pY + (event.clientY - initial.y) / scale.current;
        sX = data.sX - (event.clientX - initial.x) / scale.current;
        sY = data.sY + (event.clientY - initial.y) / scale.current;
        break;
      case "direction/bottom-right":
        pX = data.pX;
        pY = data.pY;
        sX = data.sX + (event.clientX - initial.x) / scale.current;
        sY = data.sY + (event.clientY - initial.y) / scale.current;
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
    allowDropOnColumn,
    dropOnColumn,
  };
}
