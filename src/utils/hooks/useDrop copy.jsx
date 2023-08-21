import { BoardObjects, SidebarObjects } from "../enums/items";
import { v4 as uuidv4 } from "uuid";

import {
  addNode,
  removeNode,
  addChild,
  removeChild,
  updateParent,
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

export function useBoardDrop({
  accept,
  boardId,
  boardRef,
  position,
  scale = 1,
}) {
  const dispatch = useDispatch();

  function allowDrop(event) {
    event.preventDefault();
  }

  const drop = (event) => {
    event.preventDefault();
    let data = JSON.parse(event.dataTransfer.getData("application/json"));

    if (!accept.includes(data.type)) {
      console.log("Rejected");
      return;
    }
    // Something about sidebar objects here
    if (Object.values(SidebarObjects).includes(data.type)) {
      createNode(event, data, boardId, BoardObjects.BOARD);
    } else if (Object.values(BoardObjects).includes(data.type)) {
      if (data.parent.id !== boardId) {
        updateNodeParent(data, boardId, BoardObjects.BOARD);
        updateNodePosition(event, data);
      } else {
        updateNodePosition(event, data);
      }
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
    dispatch(
      updateParent.action({
        id: data.id,
        type: data.type,
        pId,
        pType,
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

  const allowDrop = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  function drop(event) {
    event.stopPropagation();
    console.log("DROPPED ON COLUMN");
    let data = JSON.parse(event.dataTransfer.getData("application/json"));
    if (!accept.includes(data.type)) {
      console.log("Rejected");
      return;
    }
    // Something about sidebar objects here
    if (Object.values(SidebarObjects).includes(data.type)) {
      createNode(event, data, columnId, BoardObjects.COLUMN);
    } else if (Object.values(BoardObjects).includes(data.type)) {
      if (data.parent.id !== columnId) {
        updateNodeParent(data, columnId, BoardObjects.COLUMN);
      }
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
    dispatch(
      updateParent.action({
        id: data.id,
        type: data.type,
        pId,
        pType,
      })
    );
  };

  return {
    allowDrop,
    drop,
  };
}
