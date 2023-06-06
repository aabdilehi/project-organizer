import { createSlice, current } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { boardSchema } from "../../schema";
import { BoardObjects } from "../enums/items";

const boardSlice = createSlice({
  name: "boards",
  initialState: {
    "84fb6ab7-69e4-47ff-9d3c-817d55c105bc": {
      id: "84fb6ab7-69e4-47ff-9d3c-817d55c105bc",
      title: "Home",
      children: [],
    },
  },
  reducers: {
    getBoards: (state, action) => {
      const boards = action.payload;
      // get board from mongodb
      return boards;
      // return board
    },
    addBoard: (state, action) => {
      const normalizedData = normalize(action.payload, boardSchema);
      const { entities } = normalizedData;
      const board = entities.boards;

      // return {
      //   ...state,
      //   ...board,
      // };

      // post request to database

      fetch("/api/create-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(board),
      }).then((response) => response.json());

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
      let updatedBoard;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.BOARD,
          query: { pubId: boardId },
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
          updatedBoard = data;
          console.log(data);
        });
      return {
        ...state,
        [boardId]: {
          ...board,
          children: [...board.children, { childId, childType }],
        },
      };
    },
    removeChild: (state, action) => {
      const { boardId, childId, childType } = action.payload;
      const board = state[boardId];
      let updatedBoard;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.BOARD,
          query: { pubId: boardId },
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
          updatedBoard = data;
          console.log(data);
        });
      const index = board.children.findIndex((item) => {
        return item.childId === childId;
      });
      if (index === -1) return;
      board.children.splice(index, 1);
    },
    updateTitle: (state, action) => {
      const { boardId, title } = action.payload;
      const board = state[boardId];
      let updatedBoard;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.BOARD,
          query: { pubId: boardId },
          update: {
            title,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          updatedBoard = data;
          console.log(data);
        });
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
      let updatedBoard;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.BOARD,
          query: { pubId: boardId },
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
          updatedBoard = data;
          console.log(data);
        });
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
      let updatedBoard;
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.BOARD,
          query: { pubId: boardId },
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
          updatedBoard = data;
          console.log(data);
        });
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
      fetch("/api/delete-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.BOARD,
          query: { pubId: boardId },
        }),
      }).then((response) => response.json());

      //delete state[boardId];
    },
  },
});

export const {
  getBoards,
  addBoard,
  addChild: addBoardChild,
  removeChild: removeBoardChild,
  updateTitle,
  updatePosition: updateBoardPosition,
  updateParent: updateBoardParent,
  removeBoard,
} = boardSlice.actions;

export default boardSlice.reducer;
