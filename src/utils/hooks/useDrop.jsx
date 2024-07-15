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

const columnAcceptedTypes = [
  BoardObjects.NOTE,
  BoardObjects.TODO,
  BoardObjects.IMAGE,
  BoardObjects.BOARD,
  BoardObjects.DOCUMENT,
  SidebarObjects.NOTE,
  SidebarObjects.IMAGE,
  SidebarObjects.TODO,
  SidebarObjects.BOARD,
  SidebarObjects.DOCUMENT,
];

const boardAcceptedTypes = [
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
];

export function useDrop({ boardRef, scale = 1, draggedNodes, clearPortal }) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const handledNodes = useRef([]);

  function allowDropOnBoard(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  function dropOnBoard(event, id) {
    event.stopPropagation();
    event.preventDefault();

    let data = JSON.parse(event.dataTransfer.getData("application/json"));
    if (Object.values(SidebarObjects).includes(data.type)) {
      if (!boardAcceptedTypes.includes(data.type)) {
        return;
      }
      createNode(event, data, id, BoardObjects.BOARD);
    } else {
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (
          !boardAcceptedTypes.includes(item.type) ||
          item.id === id ||
          !!handledNodes.current.find((node) => node.id === item.id)
        ) {
          return;
        }
        // Something about sidebar objects here
        if (boardAcceptedTypes.includes(item.type)) {
          // check if should re-parent
          if (item.parent.id !== id) {
            updateNodeParent(item, id, BoardObjects.BOARD);
            setNodePosition(event, item);
          } else {
            setNodePosition(event, item);
          }
          clearPortal();
        }
      });
    }
  }

  const allowDropOnColumn = useCallback(
    (event, id) => {
      // assume sidebar if no dragged nodes (can probably add validation but eh)
      if (!draggedNodes) {
        event.stopPropagation();
        event.preventDefault();
      }
      handledNodes.current = [];
      // determine here what can be handled based on accepted types
      Object.values(draggedNodes).forEach((item) => {
        if (columnAcceptedTypes.includes(item.type)) {
          if (
            !columnAcceptedTypes.includes(item.type) ||
            item.id === id ||
            item.parent.id === id
          ) {
            return;
          }
          handledNodes.current = [...handledNodes.current, item];
        }
      });
    },
    [draggedNodes]
  );

  function dropOnColumn(event, id) {
    let data = JSON.parse(event.dataTransfer.getData("application/json"));

    // Something about sidebar objects here
    if (Object.values(SidebarObjects).includes(data.type)) {
      if (!columnAcceptedTypes.includes(data.type)) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      createNode(event, data, id, BoardObjects.COLUMN);
    } else {
      console.log(handledNodes.current);
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (!handledNodes.current.find((node) => node.id === item.id)) return;
        updateNodeParent(item, id, BoardObjects.COLUMN);
      });
      clearPortal();
    }
  }

  function createNode(event, data, pId, pType) {
    if (boardRef == null) return;
    const boundingRect = boardRef.current.getBoundingClientRect();
    const xCoord = event.clientX - boundingRect.left;
    const yCoord = event.clientY - boundingRect.top;
    let node;

    switch (data.type) {
      case SidebarObjects.NOTE:
        node = new NoteC({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        });
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

      case SidebarObjects.TODO:
        node = new TaskC({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        });
        break;

      case SidebarObjects.BOARD:
        node = new BoardC({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        });
        break;
      case SidebarObjects.COLUMN:
        node = new ColumnC({
          pX: xCoord,
          pY: yCoord,
          parent: {
            id: pId,
            type: pType,
          },
        });
        break;
      case SidebarObjects.DOCUMENT:
        node = new DocumentC({
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
