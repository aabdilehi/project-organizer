import { BoardObjects, SidebarObjects } from "../enums/items";
import { v4 as uuidv4 } from "uuid";

import {
  addNode,
  removeNode,
  addChild,
  removeChild,
  updatePosition,
} from "../slices/nodeActions";

import { useDispatch } from "react-redux";
import {
  BoardC,
  ColumnC,
  DocumentC,
  NoteC,
  PictureC,
  TaskC,
} from "../classes/classes";
import { useContext } from "react";
import { SelectedNodeContext } from "../../App";

export function useBoardDrop({
  accept,
  boardId,
  boardRef,
  position,
  scale = 1,
}) {
  const dispatch = useDispatch();
  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  function allowDrop(event) {
    event.preventDefault();
  }

  const drop = (event) => {
    event.preventDefault();
    let data = JSON.parse(event.dataTransfer.getData("application/json"));
    console.log(data);
    if (Object.values(SidebarObjects).includes(data.type)) {
      createNode(event, data, boardId, BoardObjects.BOARD);
    } else {
      Object.values(data).forEach((item) => {
        if (!accept.includes(item.type) || item.id === boardId) {
          console.log("Rejected");
          return;
        }
        // Something about sidebar objects here
        if (Object.values(BoardObjects).includes(item.type)) {
          if (item.parent.id !== boardId) {
            updateNodeParent(item, boardId, BoardObjects.BOARD);
            updateNodePosition(event, item);
            handleSelectNode(event, null); // temp fix for issue when selectednode data doesn't match actual node data
          } else {
            updateNodePosition(event, item);
          }
        }
      });
    }
  };

  const createNode = (event, data, pId, pType) => {
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
        });
        break;
      case SidebarObjects.IMAGE:
        node = new PictureC({
          pX: xCoord,
          pY: yCoord,
        });
        break;

      case SidebarObjects.TODO:
        node = new TaskC({
          pX: xCoord,
          pY: yCoord,
        });
        break;

      case SidebarObjects.BOARD:
        node = new BoardC({
          pX: xCoord,
          pY: yCoord,
        });
        break;
      case SidebarObjects.COLUMN:
        node = new ColumnC({
          pX: xCoord,
          pY: yCoord,
        });
        break;
      case SidebarObjects.DOCUMENT:
        node = new DocumentC({
          pX: xCoord,
          pY: yCoord,
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
  };

  const updateNodeParent = (data, pId, pType) => {
    console.log(data);
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
  };

  const updateNodePosition = (event, data) => {
    const boundingRect = boardRef.current.getBoundingClientRect();
    const xCoord = (event.clientX - boundingRect.left) / scale - data.offset.x;
    const yCoord = (event.clientY - boundingRect.top) / scale - data.offset.y;
    dispatch(
      updatePosition.action({
        id: data.id,
        type: data.type,
        pX: xCoord,
        pY: yCoord,
      })
    );
  };

  return {
    allowDrop,
    drop,
  };
}

export function useColumnDrop({
  accept,
  boardId,
  columnId,
  boardRef,
  position,
  scale,
}) {
  const dispatch = useDispatch();

  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);
  const allowDrop = (event) => {
    event.preventDefault();
  };

  function drop(event) {
    event.stopPropagation();
    let data = JSON.parse(event.dataTransfer.getData("application/json"));

    // Something about sidebar objects here
    if (Object.values(SidebarObjects).includes(data.type)) {
      if (!accept.includes(data.type)) {
        console.log("Rejected");
        return;
      }
      createNode(event, data, columnId, BoardObjects.COLUMN);
    } else {
      Object.values(data).forEach((item) => {
        if (Object.values(BoardObjects).includes(item.type)) {
          if (
            !accept.includes(item.type) ||
            item.id === columnId ||
            item.parent.id === columnId
          ) {
            console.log("Rejected");
            return;
          }
          updateNodeParent(item, columnId, BoardObjects.COLUMN);
          handleSelectNode(event, null); // temp fix for issue when selectednode data doesn't match actual node data
        }
      });
    }
  }

  const createNode = (event, data, pId, pType) => {
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
        });
        break;
      case SidebarObjects.IMAGE:
        node = new PictureC({
          pX: xCoord,
          pY: yCoord,
        });
        break;

      case SidebarObjects.TODO:
        node = new TaskC({
          pX: xCoord,
          pY: yCoord,
        });
        break;

      case SidebarObjects.BOARD:
        node = new BoardC({
          pX: xCoord,
          pY: yCoord,
        });
        break;

      case SidebarObjects.DOCUMENT:
        node = new DocumentC({
          pX: xCoord,
          pY: yCoord,
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
  };

  const updateNodeParent = (data, pId, pType) => {
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
  };

  return {
    allowDrop,
    drop,
  };
}
