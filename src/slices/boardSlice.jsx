import { createSlice, current } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { boardSchema } from "../schema";

const boardSlice = createSlice({
  name: "boards",
  initialState: {
    root: {
      id: "root",
      title: "Home",
      childRefs: [],
    },
  },
  reducers: {
    addBoard: (state, action) => {
      const normalizedData = normalize(action.payload, boardSchema);
      const { entities } = normalizedData;
      const board = entities.boards;

      return {
        ...state,
        ...board,
      };
    },
    // Can probably merge board and board version of this function
    // Will need to move it out of both
    addChild: (state, action) => {
      const { boardId, childId, childType } = action.payload;
      console.log(action.payload);
      const board = state[boardId];
      return {
        ...state,
        [boardId]: {
          ...board,
          childRefs: [...board.childRefs, { childId, childType }],
        },
      };
    },
    removeChild: (state, action) => {
      const { boardId, childId } = action.payload;
      const board = state[boardId];
      const index = board.childRefs.findIndex((item) => {
        return item.childId === childId;
      });
      if (index === -1) return;
      board.childRefs.splice(index, 1);
    },
    updateTitle: (state, action) => {
      const { boardId, title } = action.payload;
      const board = state[boardId];
      return {
        ...state,
        [boardId]: {
          ...board,
          title,
        },
      };
    },
    updatePosition: (state, action) => {
      const { boardId, pX, pY } = action.payload;
      const board = state[boardId];
      return {
        ...state,
        [boardId]: {
          ...board,
          pX,
          pY,
        },
      };
    },
    updateParent: (state, action) => {
      const { boardId, newParentId, newParentType } = action.payload;
      const board = state[boardId];
      return {
        ...state,
        [boardId]: {
          ...board,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
    removeBoard: (state, action) => {
      const { boardId } = action.payload;
      delete state[boardId];
    },
  },
});

export const {
  addBoard,
  addChild: addBoardChild,
  removeChild: removeBoardChild,
  updateTitle,
  updatePosition: updateBoardPosition,
  updateParent: updateBoardParent,
  removeBoard,
} = boardSlice.actions;

export default boardSlice.reducer;
