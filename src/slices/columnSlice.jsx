import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { columnSchema } from "../schema";
import { updateParent } from "./nodeActions";

const columnSlice = createSlice({
  name: "columns",
  initialState: {},
  reducers: {
    addColumn: (state, action) => {
      const normalizedData = normalize(action.payload, columnSchema);
      const { entities } = normalizedData;
      console.log(action.payload);
      return {
        ...state,
        ...entities.columns,
      };
    },
    addChild: (state, action) => {
      const { columnId, childId, childType } = action.payload;
      const column = state[columnId];
      return {
        ...state,
        [columnId]: {
          ...column,
          childRefs: [...column.childRefs, { childId, childType }],
        },
      };
    },
    removeChild: (state, action) => {
      const { columnId, childId } = action.payload;
      const column = state[columnId];
      const index = column.childRefs.findIndex((item) => {
        return item.childId === childId;
      });
      if (index === -1) return;
      column.childRefs.splice(index, 1);
    },
    updateTitle: (state, action) => {
      const { columnId, title } = action.payload;
      const column = state[columnId];
      return {
        ...state,
        [columnId]: {
          ...column,
          title,
        },
      };
    },
    updatePosition: (state, action) => {
      const { columnId, pX, pY } = action.payload;
      const column = state[columnId];
      return {
        ...state,
        [columnId]: {
          ...column,
          pX,
          pY,
        },
      };
    },
    updateSize: (state, action) => {
      const { columnId, sX, sY } = action.payload;
      const column = state[columnId];
      return {
        ...state,
        [columnId]: {
          ...column,
          sX,
          sY,
        },
      };
    },
    updateParent: (state, action) => {
      const { columnId, newParentId, newParentType } = action.payload;
      const column = state[columnId];
      return {
        ...state,
        [columnId]: {
          ...column,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
  },
});

export const {
  addColumn,
  addChild: addColumnChild,
  removeChild: removeColumnChild,
  updateTitle: updateColumnTitle,
  updatePosition: updateColumnPosition,
  updateSize: updateColumnSize,
  updateParent: updateColumnParent,
} = columnSlice.actions;

export default columnSlice.reducer;
