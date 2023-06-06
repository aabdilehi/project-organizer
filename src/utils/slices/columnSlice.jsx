import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { columnSchema } from "../../schema";
import { updateParent } from "./nodeActions";
import { BoardObjects } from "../enums/items";

const columnSlice = createSlice({
  name: "columns",
  initialState: {},
  reducers: {
    getColumns: (state, action) => {
      const columns = action.payload;
      return columns;
    },

    addColumn: (state, action) => {
      const normalizedData = normalize(action.payload, columnSchema);
      const { entities } = normalizedData;

      fetch("/api/create-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entities.columns),
      }).then((response) => response.json());

      return {
        ...state,
        ...entities.columns,
      };
    },
    addChild: (state, action) => {
      const { columnId, childId, childType } = action.payload;
      const column = state[columnId];
      let updatedColumn;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.COLUMN,
          query: { pubId: columnId },
          update: {
            $push: {
              children: {
                id: childId,
                type: childType,
              },
            },
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatedColumn = data;
          console.log(data);
        });
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

      let updatedColumn;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.COLUMN,
          query: { pubId: columnId },
          update: {
            $pull: {
              children: {
                id: childId,
                type: childType,
              },
            },
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatedColumn = data;
          console.log(data);
        });

      const index = column.childRefs.findIndex((item) => {
        return item.childId === childId;
      });
      if (index === -1) return;
      column.childRefs.splice(index, 1);
    },
    updateTitle: (state, action) => {
      const { columnId, title } = action.payload;
      const column = state[columnId];

      let updatedColumn;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.COLUMN,
          query: { pubId: columnId },
          update: {
            title,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatedColumn = data;
          console.log(data);
        });

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

      let updatedColumn;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.COLUMN,
          query: { pubId: columnId },
          update: {
            position: {
              x: pX,
              y: pY,
            },
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatedColumn = data;
          console.log(data);
        });

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
      const { columnId, sX } = action.payload;
      const column = state[columnId];

      let updatedColumn;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.COLUMN,
          query: { pubId: columnId },
          update: {
            size: {
              x: sX,
            },
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatedColumn = data;
          console.log(data);
        });

      return {
        ...state,
        [columnId]: {
          ...column,
          sX,
        },
      };
    },
    updateParent: (state, action) => {
      const { columnId, newParentId, newParentType } = action.payload;
      const column = state[columnId];

      let updatedColumn;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.COLUMN,
          query: { pubId: columnId },
          update: {
            parent: {
              id: newParentId,
              type: newParentType,
            },
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatedColumn = data;
          console.log(data);
        });

      return {
        ...state,
        [columnId]: {
          ...column,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
    removeColumn: (state, action) => {
      const { columnId } = action.payload;
      delete state[columnId];
    },
  },
});

export const {
  getColumns,
  addColumn,
  addChild: addColumnChild,
  removeChild: removeColumnChild,
  updateTitle: updateColumnTitle,
  updatePosition: updateColumnPosition,
  updateSize: updateColumnSize,
  updateParent: updateColumnParent,
  removeColumn,
} = columnSlice.actions;

export default columnSlice.reducer;
