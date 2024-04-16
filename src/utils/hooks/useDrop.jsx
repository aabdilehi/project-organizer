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

export function useBoardDrop({
  accept,
  boardId,
  boardRef,
  position,
  scale = 1,
}) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  function allowDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const drop = (event) => {
    event.stopPropagation();
    event.preventDefault();
    console.log(event.dataTransfer);
    let data = JSON.parse(event.dataTransfer.getData("application/json"));
    if (Object.values(SidebarObjects).includes(data.type)) {
      if (!accept.includes(data.type)) {
        return;
      }
      createNode(event, data, boardId, BoardObjects.BOARD);
    } else {
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (!accept.includes(item.type) || item.id === boardId) {
          return;
        }
        // Something about sidebar objects here
        if (accept.includes(item.type)) {
          // check if should re-parent
          if (item.parent.id !== boardId) {
            updateNodeParent(item, boardId, BoardObjects.BOARD);
            setNodePosition(event, item, data.offset);
          } else {
            offsetNodePosition(event, item, data.offset);
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
    setTimeout(() => {
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
    }, 15);
  };
  const updateNodePosition = (event, data) => {
    const boundingRect = boardRef.current.getBoundingClientRect();
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
  };

  const offsetNodePosition = (event, data, offset) => {
    const xCoord = (event.clientX - offset.x) / scale;
    const yCoord = (event.clientY - offset.y) / scale;
    dispatch(
      offsetPosition.action({
        id: data.id,
        type: data.type,
        offsetX: xCoord,
        offsetY: yCoord,
      })
    );
  };

  const setNodePosition = (event, data, offset) => {
    const boundingRect = boardRef.current.getBoundingClientRect();

    const node = state[data.type + "s"][data.id];
    if (!node) {
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

    const xCoord = node.pX - offset.x + event.clientX;
    const yCoord = node.pY - offset.y + event.clientY;
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
    event.preventDefault();

    let data = JSON.parse(event.dataTransfer.getData("application/json"));

    // Something about sidebar objects here
    if (Object.values(SidebarObjects).includes(data.type)) {
      if (!accept.includes(data.type)) {
        return;
      }
      createNode(event, data, columnId, BoardObjects.COLUMN);
    } else {
      if (!data.hasOwnProperty("selectedNodes")) return;
      Object.values(data.selectedNodes).forEach((item) => {
        if (accept.includes(item.type)) {
          if (
            !accept.includes(item.type) ||
            item.id === columnId ||
            item.parent.id === columnId
          ) {
            return;
          }
          updateNodeParent(item, columnId, BoardObjects.COLUMN);
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
    setTimeout(() => {
      // delay this as removing the node from DOM will unfortunately cancel the drag event before dragend can fire
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
    }, 15);
  };

  return {
    allowDrop,
    drop,
  };
}
