import { createAction } from "@reduxjs/toolkit";

// Actions
const addNodeAction = createAction<{}>("addNode");
const removeNodeAction = createAction<{id: string, type: string}>("removeNode");
const addChildAction = createAction<{id: string, type: string, cId: string, cType: string}>("addChild");
const removeChildAction = createAction<{id: string, type: string, cId: string}>("removeChild");
const updateTitleAction = createAction<{id: string, type: string, title: string}>("updateTitle");
const updateContentAction = createAction<{id: string, type: string, content: string}>("updateContent");
const updatePositionAction = createAction<{id: string, type: string, pX: number, pY: number}>("updatePosition");
const updateSizeAction = createAction<{id: string, type: string, sX: number, sY: number}>("updateSize");
const updateParentAction = createAction<{id: string, type: string, parent: object}>("updateParent");

// Reducers (Function wrapped in function so I can have extra params)
const addNodeReducer = (nodeType) => (state, action) => {
  const node = action.payload;
  if (!node || node.type !== nodeType) return;
  return {
    ...state,
    [node.id]: node,
  };
};
const removeNodeReducer = (nodeType) => (state, action) => {
  const { id, type } = action.payload;
  if (!id || type !== nodeType) return;
  delete state[id];
};
const addChildReducer = (nodeType) => (state, action) => {
  const { id, type, cId, cType } = action.payload;
  if (!id || !cId || !cType || type !== nodeType) return;
  const node = state[id];
  return {
    ...state,
    [id]: {
      ...node,
      childRefs: [...node.childRefs, { childId: cId, childType: cType }],
    },
  };
};
const removeChildReducer = (nodeType) => (state, action) => {
  const { id, type, cId } = action.payload;
  if (!id || !cId || type !== nodeType) return;
  const node = state[id];
  const index = node.childRefs.findIndex((item) => {
    return item.childId === cId;
  });
  if (index === -1) return;
  node.childRefs.splice(index, 1);
};
const updateTitleReducer = (nodeType) => (state, action) => {
  const { id, type, title } = action.payload;
  if (!id || !title || type !== nodeType) return;
  const node = state[id];
  return {
    ...state,
    [id]: {
      ...node,
      title,
    },
  };
};
const updateContentReducer = (nodeType) => (state, action) => {
  const { id, type, content } = action.payload;
  if (!id || !content || type !== nodeType) return;
  const node = state[id];
  return {
    ...state,
    [id]: {
      ...node,
      content,
    },
  };
};
const updatePositionReducer = (nodeType) => (state, action) => {
  const { id, type, pX, pY } = action.payload;

  if (!id || type !== nodeType || !pX || !pY) return;
  const node = state[id];

  return {
    ...state,
    [id]: {
      ...node,
      pX,
      pY,
    },
  };
};
const updateSizeReducer = (nodeType) => (state, action) => {
  const { id, type, sX, sY } = action.payload;

  if (!id || type !== nodeType || !sX || !sY) return;
  const node = state[id];
  return {
    ...state,
    [id]: {
      ...node,
      sX,
      sY,
    },
  };
};
const updateParentReducer = (nodeType) => (state, action) => {
  const { id, type, pId, pType } = action.payload;
  if (!id || type !== nodeType || !pId || !pType) return;
  const node = state[id];
  return {
    ...state,
    [id]: {
      ...node,
      parent: { id: pId, type: pType },
    },
  };
};

// Exports
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
export const updateSize = {
  action: updateSizeAction,
  reducer: updateSizeReducer,
};
export const updateParent = {
  action: updateParentAction,
  reducer: updateParentReducer,
};
