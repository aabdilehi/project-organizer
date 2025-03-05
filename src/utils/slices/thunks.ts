import { RootState } from "../../store";
import { formatData, NodeType, NodeTypeMap } from "../classes/new-classes";
import { BoardObjects } from "../enums/items";
import { addCopyNode, clearCopiedNodes, setPosition } from "./copiedSlice";
import { clearDragData, setDragData } from "./dragSlice";
import { v4 as uuidv4 } from "uuid";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  setSliceData,
  updateSize,
} from "./nodeActions";
import { removeSelectNode } from "./selectionSlice";

// export function updateNodeSize(id: string, type: BoardObjects, sX: number, sY: number) {
//     // fetchTodoByIdThunk is the "thunk function"
//     return (dispatch, getState) => {
//         const state = getState();
//         dispatch(updateSize.action({id, type, sX, sY}));
//     }
// }

export function removeNodeThunk(id: string, type: BoardObjects) {
  return (dispatch, getState) => {
    const state = getState();
    const node = state[`${type}s`][id];
    if (!node) return;
    // Create node and add to parent
    // dispatch(clearDragData());
    dispatch(removeSelectNode({ id: node.id }));
    dispatch(
      removeChild.action({
        id: node.parent.id,
        type: node.parent.type,
        cId: node.id,
      })
    );
    dispatch(
      removeNode.action({
        id: node.id,
        type: node.type,
      })
    );
  };
}

export function deleteSelection() {
  return (dispatch, getState) => {
    const state: RootState = getState();
    const selectedNodes = state.selection;

    for (const id in selectedNodes) {
      const selectedNode = selectedNodes[id];
      if (selectedNode) {
        dispatch(deleteRecursive(selectedNode.id, selectedNode.type));
      }
    }
  };
}

function deleteRecursive(id: string, type: BoardObjects) {
  return (dispatch, getState) => {
    const state = getState(); // Maybe just pass state as a param rather than doing this every time
    const node = state[`${type}s`][id];
    if (!node) return;
    if (Object.hasOwn(node, "childRefs")) {
      node.childRefs.forEach(({ childId, childType }) => {
        dispatch(deleteRecursive(childId, childType));
      });
    }
    dispatch(removeNodeThunk(id, type));
  };
}

export function copySelection(boardId: string, x?: number, y?: number) {
  return (dispatch, getState) => {
    dispatch(clearCopiedNodes());
    const state: RootState = getState();
    const selectedNodes = state.selection;
    let centroidX = 0;
    let centroidY = 0;
    let centroidCount = 0;
    for (const id in selectedNodes) {
      const selectedNode = selectedNodes[id];
      if (selectedNode) {
        const node = state[`${selectedNode.type}s`][selectedNode.id];
        if (node) {
          centroidX += node.pX;
          centroidY += node.pY;
          centroidCount += 1;
          dispatch(copyRecursive(selectedNode.id, selectedNode.type));
        }
      }
    }
    if (x && y) {
      const { offset, scale } = state.boards[boardId];
      const newX = (x - offset.x) / scale;
      const newY = (y - offset.y) / scale;
      dispatch(setPosition({ x: newX, y: newY }));
      return;
    }
    const centroid = {
      x: centroidX / centroidCount,
      y: centroidY / centroidCount,
    };
    dispatch(setPosition(centroid));
  };
}

function copyRecursive(id: string, type: BoardObjects) {
  return (dispatch, getState) => {
    const state = getState();
    const node = state[`${type}s`][id];
    if (!node) return;
    if (Object.hasOwn(node, "childRefs")) {
      node.childRefs.forEach(({ childId, childType }) =>
        copyRecursive(childId, childType)
      );
    }
    dispatch(copyNodeThunk(id, type));
  };
}

function copyNodeThunk(id: string, type: BoardObjects) {
  return (dispatch, getState) => {
    const state = getState();
    const node = state[`${type}s`][id];
    if (!node) return;
    dispatch(addCopyNode(node));
  };
}

export function pasteCopiedNodes(
  boardId: string,
  x: number = 0,
  y: number = 0
) {
  return (dispatch, getState) => {
    const state = getState();
    const { position, nodes } = state.copied;

    const { offset, scale } = state.boards[boardId];
    const newX = (x - offset.x) / scale;
    const newY = (y - offset.y) / scale;
    // create one to one mapping of existing id to new id
    const mappedIds = {};
    nodes.forEach((node) => {
      const newId = uuidv4();
      mappedIds[node.id] = newId;
    });

    nodes.forEach((node) => {
      const hasMappedParent = Object.hasOwn(mappedIds, node.parent.id);
      const newNode = {
        ...node,
        id: mappedIds[node.id],
        pX: node.pX - position.x + newX,
        pY: node.pY - position.y + newY,
        parent: hasMappedParent
          ? { id: mappedIds[node.parent.id], type: node.parent.type }
          : { id: boardId, type: BoardObjects.BOARD },
      };
      if (Object.hasOwn(node, "childRefs")) {
        newNode.childRefs = node.childRefs.map(({ childId, childType }) => ({
          childId: mappedIds[childId],
          childType,
        }));
      }
      dispatch(createNodeThunk(newNode, !hasMappedParent));
    });
  };
}

export function createNodeThunk(
  node: Partial<NodeType>,
  shouldAddChild: boolean = true
) {
  return (dispatch, getState) => {
    if (!Object.hasOwn(node, "type")) return;
    // Complete partial node data
    const newNode = formatData(node, NodeTypeMap[node.type]);

    // Create node and add to parent
    dispatch(addNode.action(newNode));
    if (!shouldAddChild) return;
    dispatch(
      addChild.action({
        id: newNode.parent.id,
        type: newNode.parent.type,
        cId: newNode.id,
        cType: newNode.type,
      })
    );
  };
}

export function importDataThunk(data) {
  return (dispatch, getState) => {
    const keys = Object.keys(data);
    keys.forEach((key) => {
      dispatch(setSliceData.action({ nodes: data[key], merge: false }));
    });
  };
}

export function prepareDataThunk() {
  return (dispatch, getState) => {
    const { selection, copied, drag, _persist, ...state } = getState();

    const jsonData = JSON.stringify(state);
    var file = new Blob([jsonData], { type: "application/json" });
    return file;
  };
}

export function addSelectedNodesToDragged() {
  return (dispatch, getState) => {
    const state = getState();
    const selection = state.selection;
    const dragged = state.drag;
    dispatch(setDragData({ ...dragged, nodes: selection }));
  };
}
