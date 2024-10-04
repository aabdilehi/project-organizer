import { BoardObjects, SidebarObjects } from "../enums/items";
import { v4 as uuidv4 } from "uuid";

import {
  addNode,
  removeNode,
  addChild,
  removeChild,
  updateParent,
  updatePosition,
  offsetPosition,
} from "../slices/nodeActions";

import { useDispatch, useSelector } from "react-redux";
import {
  BoardC,
  ColumnC,
  DocumentC,
  NoteC,
  PictureC,
  TaskC,
} from "../classes/classes";
import { useCallback, useRef } from "react";
import {
  BoardClass,
  ColumnClass,
  DocumentClass,
  NoteClass,
  TaskClass,
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
  BoardObjects.IMAGE,
  BoardObjects.DOCUMENT,
  SidebarObjects.NOTE,
  SidebarObjects.COLUMN,
  SidebarObjects.IMAGE,
  SidebarObjects.TASK,
  SidebarObjects.BOARD,
  SidebarObjects.DOCUMENT,
];

export function useDrop({ boardRef, scale = 1 }) {
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

    console.log(event.dataTransfer.types);

    //#region Drop from sidebar
    let data = event.dataTransfer.getData("custom/sidebar");
    if (data) {
      data = JSON.parse(data);
      if (!boardAcceptedTypes.includes(data.type)) return;
      createNode(event, data, id, BoardObjects.BOARD);
      return;
    }
    //#endregion

    //#region Drop from board/column
    data = event.dataTransfer.getData("custom/board");
    if (data) {
      data = JSON.parse(data);
      console.log(data);
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (
          !boardAcceptedTypes.includes(item.type) ||
          item.id === id ||
          handledNodes.current.find((node) => node.id === item.id)
        ) {
          return;
        }

        if (boardAcceptedTypes.includes(item.type)) {
          // check if should re-parent
          if (item.parent.id !== id) {
            updateNodeParent(item, id, BoardObjects.BOARD);
            setNodePosition(event, item);
          } else {
            setNodePosition(event, item);
          }
        }
      });
    }
    //#endregion

    //#region Drop text
    data = event.dataTransfer.getData("plain/text");
    if (data) {
      createNode(event, { type: BoardObjects.NOTE }, id, BoardObjects.BOARD, {
        content: data,
      });
    }
    handledNodes.current = [];
  }

  const allowDropOnColumn = (event) => {
    if (event.dataTransfer.types.length <= 0) return;

    switch (event.dataTransfer.types[0]) {
      case "custom/sidebar":
      case "custom/board":
        //case "text/plain": // can make note node for this
        // assume sidebar if no dragged nodes (can probably add validation but eh)
        event.stopPropagation();
        event.preventDefault();
      default:
        return;
    }
  };

  function dropOnColumn(event, id) {
    //#region Drop from sidebar
    let data = event.dataTransfer.getData("custom/sidebar");
    if (data) {
      data = JSON.parse(data);
      if (!columnAcceptedTypes.includes(data.type)) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      createNode(event, data, id, BoardObjects.COLUMN);
      return;
    }
    //#endregion

    //#region Drop from board/column
    data = event.dataTransfer.getData("custom/board");
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

  function createNode(event, data, pId, pType, extraData = {}) {
    if (boardRef == null) return;
    const boundingRect = boardRef.current.getBoundingClientRect();
    const xCoord = event.clientX - boundingRect.left;
    const yCoord = event.clientY - boundingRect.top;
    let node;

    switch (data.type) {
      case SidebarObjects.NOTE:
        node = new NoteClass({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
          ...extraData,
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

      case SidebarObjects.TASK:
        node = new TaskClass({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        }).serialize();
        break;
      case SidebarObjects.BOARD:
        node = new BoardClass({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        }).serialize();
        break;
      case SidebarObjects.COLUMN:
        node = new ColumnClass({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        }).serialize();
        break;
      case SidebarObjects.DOCUMENT:
        node = new DocumentClass({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        }).serialize();
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
  function setNodePosition(event, data) {
    const boundingRect = boardRef.current.getBoundingClientRect();

    const node = state[data.type + "s"][data.id];
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

    const xCoord = (data.offset.x + event.clientX) / scale;
    const yCoord = (data.offset.y + event.clientY) / scale;
    dispatch(
      updatePosition.action({
        id: data.id,
        type: data.type,
        pX: xCoord,
        pY: yCoord,
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
