import { CaseReducer, createAction } from "@reduxjs/toolkit";
import {
  BoardType,
  formatData,
  formatRoot,
  NodeType,
  NodeTypeMap,
  SizeClassMap,
} from "../classes/new-classes";
import { BoardObjects } from "../enums/items";
import { NodeSliceKeys, PlainRootState, SliceNodeMap } from "./types";

// Actions

const setSliceDataAction = createAction<{
  nodes: { [id: string]: NodeType };
  merge: boolean;
}>("setSliceData");
const addNodeAction = createAction<NodeType>("addNode");
const removeNodeAction = createAction<{ id: string; type: BoardObjects }>(
  "removeNode"
);
const addChildAction = createAction<{
  id: string;
  type: BoardObjects;
  cId: string;
  cType: BoardObjects;
}>("addChild");
const removeChildAction = createAction<{
  id: string;
  type: BoardObjects;
  cId: string;
}>("removeChild");
const updateTitleAction = createAction<{
  id: string;
  type: BoardObjects;
  title: string;
}>("updateTitle");
const updateContentAction = createAction<{
  id: string;
  type: BoardObjects;
  content: string;
}>("updateContent");
const updatePositionAction = createAction<{
  id: string;
  type: BoardObjects;
  pX: number;
  pY: number;
}>("updatePosition");
const offsetPositionAction = createAction<{
  id: string;
  type: BoardObjects;
  offsetX: number;
  offsetY: number;
}>("offsetPosition");
const updateSizeAction = createAction<{
  id: string;
  type: BoardObjects;
  sX: number;
  sY: number;
}>("updateSize");
const updateParentAction = createAction<{
  id: string;
  type: BoardObjects;
  parent: object;
}>("updateParent");

// Reducers (Function wrapped in function so I can have extra params)
function setSliceDataReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof setSliceDataAction>> {
  return (state, action) => {
    // Ensure payload has been properly set
    if (!Object.hasOwn(action.payload, "merge")) return;
    if (!Object.hasOwn(action.payload, "nodes")) return;

    const { nodes, merge } = action.payload;
    if (!nodes) return;

    const keys = Object.keys(nodes);
    if (keys.length <= 0) return;

    // Filter keys for empty or incorrect values
    const newKeys = keys.filter(
      (key) => key.length > 0 && nodes[key].id == key
    );

    // Construct new object containing only appropriate values
    const newNodes: {
      [id: string]: NodeType;
    } = {};
    newKeys.forEach((key) => {
      if (!Object.hasOwn(nodes, key)) return; // Ensure it exists

      const newNode = nodes[key];
      if (!newNode) return;

      if (newNode.type !== SliceNodeMap[nodeType]) return;

      if (key == "root") {
        newNodes[key] = formatRoot(newNode);
        return;
      }

      newNodes[key] = formatData(newNode, NodeTypeMap[newNode.type]);
    });

    // Might be redundant but I want to make sure things are proper before potentially breaking the state
    console.log(newNodes);
    if (Object.keys(newNodes).length <= 0) return;

    return { ...newNodes };
  };
}
function addNodeReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof addNodeAction>> {
  return (state, action) => {
    const node = action.payload;
    if (!node || node.type !== SliceNodeMap[nodeType]) return;
    return {
      ...state,
      [node.id]: node,
    };
  };
}
function removeNodeReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof removeNodeAction>> {
  return (state, action) => {
    const { id, type } = action.payload;
    if (!id || type !== SliceNodeMap[nodeType]) return;
    delete state[id];
  };
}
function addChildReducer<T extends Extract<NodeSliceKeys, "boards">>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof addChildAction>> {
  return (state, action) => {
    const { id, type, cId, cType } = action.payload;
    if (!id || !cId || !cType || type !== SliceNodeMap[nodeType]) return;
    const node = state[id];
    const index = node.childRefs.findIndex((item) => {
      return item.id === cId;
    });
    if (index !== -1) return;
    return {
      ...state,
      [id]: {
        ...node,
        childRefs: [...node.childRefs, { id: cId, type: cType }],
      },
    };
  };
}
function removeChildReducer<T extends Extract<NodeSliceKeys, "boards">>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof removeChildAction>> {
  return (state, action) => {
    const { id, type, cId } = action.payload;
    if (!id || !cId || type !== SliceNodeMap[nodeType]) return;
    const node = state[id];
    const index = node.childRefs.findIndex((item) => {
      return item.id === cId;
    });
    if (index === -1) return;
    return {
      ...state,
      [id]: {
        ...node,
        childRefs: [
          ...node.childRefs.slice(0, index),
          ...node.childRefs.slice(index + 1),
        ],
      },
    };
  };
}

function updateTitleReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof updateTitleAction>> {
  return (state, action) => {
    const { id, type, title } = action.payload;
    if (!id || !title || type !== SliceNodeMap[nodeType]) return;
    const node = state[id];
    return {
      ...state,
      [id]: {
        ...node,
        title,
      },
    };
  };
}
function updateContentReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof updateContentAction>> {
  return (state, action) => {
    const { id, type, content } = action.payload;
    if (!id || !content || type !== SliceNodeMap[nodeType]) return;
    const node = state[id];
    return {
      ...state,
      [id]: {
        ...node,
        content,
      },
    };
  };
}
function updatePositionReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof updatePositionAction>> {
  return (state, action) => {
    const { id, type, pX, pY } = action.payload;

    if (!id || type !== SliceNodeMap[nodeType] || !pX || !pY) return;
    const node = state[id];
    if (!node) return;

    return {
      ...state,
      [id]: {
        ...node,
        pX,
        pY,
      },
    };
  };
}
function offsetPositionReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof offsetPositionAction>> {
  return (state, action) => {
    const { id, type, offsetX, offsetY } = action.payload;

    if (
      !id ||
      id == "root" ||
      type !== SliceNodeMap[nodeType] ||
      !offsetX ||
      !offsetY
    )
      return;
    const node = state[id] as BoardType;

    return {
      ...state,
      [id]: {
        ...node,
        pX: node.pX + offsetX,
        pY: node.pY + offsetY,
      },
    };
  };
}

function clampIfDefined(value?: number, min?: number, max?: number) {
  if (!value) return;
  let temp = value;
  if (min) {
    temp = Math.max(temp, min);
  }
  if (max) {
    temp = Math.min(temp, max);
  }
  return temp;
}

function updateSizeReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof updateSizeAction>> {
  return (state, action) => {
    const { id, type, sX, sY } = action.payload;
    if (!id || type !== SliceNodeMap[nodeType]) return;
    const node = state[id];
    // I need to limit this to the nodes min and max size;
    if (
      (Object.hasOwn(node, "sX") && !sX) ||
      (Object.hasOwn(node, "sY") && !sY)
    ) {
      return;
    }

    return {
      ...state,
      [id]: {
        ...node,
        sX: clampIfDefined(
          sX,
          SizeClassMap[type]?.min?.x,
          SizeClassMap[type]?.max?.x
        ),
        sY: clampIfDefined(
          sY,
          SizeClassMap[type]?.min?.y,
          SizeClassMap[type]?.max?.y
        ),
      },
    };
  };
}
function updateParentReducer<T extends NodeSliceKeys>(
  nodeType: T
): CaseReducer<PlainRootState[T], ReturnType<typeof updateParentAction>> {
  return (state, action) => {
    const { id, type, parent } = action.payload;
    if (!id || type !== SliceNodeMap[nodeType] || !parent) return;
    const node = state[id];
    return {
      ...state,
      [id]: {
        ...node,
        parent,
      },
    };
  };
}

// Exports
export const setSliceData = {
  action: setSliceDataAction,
  reducer: setSliceDataReducer,
};
export const addNode = {
  action: addNodeAction,
  reducer: addNodeReducer,
};
export const removeNode = {
  action: removeNodeAction,
  reducer: removeNodeReducer,
};
export const addChild = {
  action: addChildAction,
  reducer: addChildReducer,
};
export const removeChild = {
  action: removeChildAction,
  reducer: removeChildReducer,
};
export const updateTitle = {
  action: updateTitleAction,
  reducer: updateTitleReducer,
};
export const updateContent = {
  action: updateContentAction,
  reducer: updateContentReducer,
};
export const updatePosition = {
  action: updatePositionAction,
  reducer: updatePositionReducer,
};
export const offsetPosition = {
  action: offsetPositionAction,
  reducer: offsetPositionReducer,
};
export const updateSize = {
  action: updateSizeAction,
  reducer: updateSizeReducer,
};
export const updateParent = {
  action: updateParentAction,
  reducer: updateParentReducer,
};
