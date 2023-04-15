import { BoardObjects, SidebarObjects } from "../enums/items";
import { v4 as uuidv4 } from "uuid";
import {
  addBoard,
  addBoardChild,
  removeBoardChild,
  updateBoardParent,
  updateBoardPosition,
} from "../slices/boardSlice";
import {
  addColumn,
  addColumnChild,
  removeColumnChild,
  updateColumnParent,
  updateColumnPosition,
} from "../slices/columnSlice";
import {
  addNote,
  updateNoteParent,
  updateNotePosition,
} from "../slices/noteSlice";

import {
  addTask,
  updateTaskParent,
  updateTaskPosition,
} from "../slices/taskSlice";
import {
  addPicture,
  updatePictureParent,
  updatePicturePosition,
} from "../slices/pictureSlice";
import { useDispatch } from "react-redux";
import {
  addDocument,
  updateDocumentParent,
  updateDocumentPosition,
} from "../slices/docSlice";

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
      addNode(data, event);
    } else if (Object.values(BoardObjects).includes(data.type)) {
      if (data.parent.id !== boardId) {
        updateParent(data);
        updatePosition(data, event);
      } else {
        updatePosition(data, event);
      }
    }
  };

  const addNode = (data, event) => {
    switch (data.type) {
      case SidebarObjects.NOTE:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord =
            (event.clientX - boundingRect.left) / scale - position.x;
          const yCoord =
            (event.clientY - boundingRect.top) / scale - position.y;
          const newNote = {
            id: uuidv4(),
            type: BoardObjects.NOTE,
            pX: xCoord,
            pY: yCoord,
            sX: 200,
            sY: 200,
            text: "New note",
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          dispatch(addNote(newNote));
          dispatch(
            addBoardChild({
              boardId,
              childId: newNote.id,
              childType: newNote.type,
            })
          );
        }
        break;
      case SidebarObjects.COLUMN:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord =
            (event.clientX - boundingRect.left) / scale - position.x;
          const yCoord =
            (event.clientY - boundingRect.top) / scale - position.y;
          const newColumn = {
            id: uuidv4(),
            type: BoardObjects.COLUMN,
            pX: xCoord,
            pY: yCoord,
            sX: 200,
            sY: 200,
            title: "New column",
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
            childRefs: [],
          };
          dispatch(addColumn(newColumn));
          dispatch(
            addBoardChild({
              boardId,
              childId: newColumn.id,
              childType: newColumn.type,
            })
          );
        }
        break;

      case SidebarObjects.IMAGE:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord =
            (event.clientX - boundingRect.left) / scale - position.x;
          const yCoord =
            (event.clientY - boundingRect.top) / scale - position.y;
          const newPicture = {
            id: uuidv4(),
            type: BoardObjects.IMAGE,
            pX: xCoord,
            pY: yCoord,
            sX: 200,
            sY: 200,
            image: "",
            label: "Label",
            showLabel: false,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          dispatch(addPicture(newPicture));
          dispatch(
            addBoardChild({
              boardId,
              childId: newPicture.id,
              childType: newPicture.type,
            })
          );
        }
        break;

      case SidebarObjects.TODO:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord =
            (event.clientX - boundingRect.left) / scale - position.x;
          const yCoord =
            (event.clientY - boundingRect.top) / scale - position.y;
          const newTask = {
            id: uuidv4(),
            type: BoardObjects.TODO,
            pX: xCoord,
            pY: yCoord,
            text: "New task",
            taskStatus: false,
            summary: "",
            deadline: null,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          dispatch(addTask(newTask));
          dispatch(
            addBoardChild({
              boardId,
              childId: newTask.id,
              childType: newTask.type,
            })
          );
        }
        break;
      case SidebarObjects.BOARD:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord =
            (event.clientX - boundingRect.left) / scale - position.x;
          const yCoord =
            (event.clientY - boundingRect.top) / scale - position.y;
          const newBoard = {
            id: uuidv4(),
            type: BoardObjects.BOARD,
            pX: xCoord,
            pY: yCoord,
            title: "New Board",
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
            childRefs: [],
          };
          dispatch(addBoard(newBoard));
          dispatch(
            addBoardChild({
              boardId,
              childId: newBoard.id,
              childType: newBoard.type,
            })
          );
        }
        break;
      case SidebarObjects.DOCUMENT:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord =
            (event.clientX - boundingRect.left) / scale - position.x;
          const yCoord =
            (event.clientY - boundingRect.top) / scale - position.y;
          const newDocument = {
            id: uuidv4(),
            type: BoardObjects.DOCUMENT,
            pX: xCoord,
            pY: yCoord,
            title: "New Document",
            content: `<strong>Content goes here</strong>`,
            expanded: false,
            parent: {
              id: boardId,
              type: BoardObjects.BOARD,
            },
          };
          dispatch(addDocument(newDocument));
          dispatch(
            addBoardChild({
              boardId,
              childId: newDocument.id,
              childType: newDocument.type,
            })
          );
        }
        break;
    }
  };

  const updateParent = (data) => {
    switch (data.parent.type) {
      case BoardObjects.BOARD:
        dispatch(
          removeBoardChild({
            boardId: data.parent.id,
            childId: data.id,
          })
        );
        dispatch(
          addBoardChild({
            boardId: boardId,
            childId: data.id,
            childType: data.type,
          })
        );
        break;
      case BoardObjects.COLUMN:
        dispatch(
          removeColumnChild({
            columnId: data.parent.id,
            childId: data.id,
          })
        );
        dispatch(
          addBoardChild({
            boardId: boardId,
            childId: data.id,
            childType: data.type,
          })
        );
        break;
    }
    switch (data.type) {
      case BoardObjects.NOTE:
        dispatch(
          updateNoteParent({
            noteId: data.id,
            newParentId: boardId,
            newParentType: BoardObjects.BOARD,
          })
        );
        break;
      case BoardObjects.COLUMN:
        dispatch(
          updateColumnParent({
            columnId: data.id,
            newParentId: boardId,
            newParentType: BoardObjects.BOARD,
          })
        );
        break;
      case BoardObjects.TODO:
        dispatch(
          updateTaskParent({
            taskId: data.id,
            newParentId: boardId,
            newParentType: BoardObjects.BOARD,
          })
        );
        break;
      case BoardObjects.IMAGE:
        dispatch(
          updatePictureParent({
            pictureId: data.id,
            newParentId: boardId,
            newParentType: BoardObjects.BOARD,
          })
        );
        break;
      case BoardObjects.BOARD:
        dispatch(
          updateBoardParent({
            boardId: data.id,
            newParentId: boardId,
            newParentType: BoardObjects.BOARD,
          })
        );
        break;
      case BoardObjects.DOCUMENT:
        dispatch(
          updateDocumentParent({
            documentId: data.id,
            newParentId: boardId,
            newParentType: BoardObjects.BOARD,
          })
        );
        break;
      default:
        break;
    }
  };

  const updatePosition = (data, event) => {
    const boundingRect = boardRef.current.getBoundingClientRect();
    const xCoord = (event.clientX - boundingRect.left) / scale - data.offset.x;
    const yCoord = (event.clientY - boundingRect.top) / scale - data.offset.y;
    switch (data.type) {
      case BoardObjects.NOTE:
        dispatch(
          updateNotePosition({
            noteId: data.id,
            pX: xCoord,
            pY: yCoord,
          })
        );
        break;
      case BoardObjects.COLUMN:
        dispatch(
          updateColumnPosition({
            columnId: data.id,
            pX: xCoord,
            pY: yCoord,
          })
        );
        break;
      case BoardObjects.TODO:
        dispatch(
          updateTaskPosition({
            taskId: data.id,
            pX: xCoord,
            pY: yCoord,
          })
        );
        break;
      case BoardObjects.IMAGE:
        dispatch(
          updatePicturePosition({
            pictureId: data.id,
            pX: xCoord,
            pY: yCoord,
          })
        );
        break;
      case BoardObjects.BOARD:
        dispatch(
          updateBoardPosition({
            boardId: data.id,
            pX: xCoord,
            pY: yCoord,
          })
        );
        break;
      case BoardObjects.DOCUMENT:
        dispatch(
          updateDocumentPosition({
            documentId: data.id,
            pX: xCoord,
            pY: yCoord,
          })
        );
        break;
      default:
        break;
    }
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
      addNode(data, event);
    } else if (Object.values(BoardObjects).includes(data.type)) {
      if (data.parent.id !== columnId) {
        updateParent(data);
      }
    }
  }

  const addNode = (data, event) => {
    switch (data.type) {
      case SidebarObjects.NOTE:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord = event.clientX - boundingRect.left;
          const yCoord = event.clientY - boundingRect.top;
          const newNote = {
            id: uuidv4(),
            type: BoardObjects.NOTE,
            pX: xCoord,
            pY: yCoord,
            sX: 200,
            sY: 200,
            text: "New note",
            parent: {
              id: columnId,
              type: BoardObjects.COLUMN,
            },
          };
          dispatch(addNote(newNote));
          dispatch(
            addColumnChild({
              columnId,
              childId: newNote.id,
              childType: newNote.type,
            })
          );
        }
        break;
      case SidebarObjects.IMAGE:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord = event.clientX - boundingRect.left;
          const yCoord = event.clientY - boundingRect.top;
          const newPicture = {
            id: uuidv4(),
            type: BoardObjects.IMAGE,
            pX: xCoord,
            pY: yCoord,
            sX: 200,
            sY: 200,
            image: "",
            label: "Label",
            showLabel: false,
            parent: {
              id: columnId,
              type: BoardObjects.COLUMN,
            },
          };
          dispatch(addPicture(newPicture));
          dispatch(
            addColumnChild({
              columnId,
              childId: newPicture.id,
              childType: newPicture.type,
            })
          );
        }
        break;

      case SidebarObjects.TODO:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord = event.clientX - boundingRect.left;
          const yCoord = event.clientY - boundingRect.top;
          const newTask = {
            id: uuidv4(),
            type: BoardObjects.TODO,
            pX: xCoord,
            pY: yCoord,
            text: "New task",
            taskStatus: false,
            summary: "",
            deadline: null,
            parent: {
              id: columnId,
              type: BoardObjects.COLUMN,
            },
          };
          dispatch(addTask(newTask));
          dispatch(
            addColumnChild({
              columnId,
              childId: newTask.id,
              childType: newTask.type,
            })
          );
        }
        break;
      case SidebarObjects.BOARD:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord = event.clientX - boundingRect.left;
          const yCoord = event.clientY - boundingRect.top;
          const newBoard = {
            id: uuidv4(),
            type: BoardObjects.BOARD,
            pX: xCoord,
            pY: yCoord,
            title: "New Board",
            parent: {
              id: columnId,
              type: BoardObjects.COLUMN,
            },
            childRefs: [],
          };
          dispatch(addBoard(newBoard));
          dispatch(
            addColumnChild({
              columnId,
              childId: newBoard.id,
              childType: newBoard.type,
            })
          );
        }
        break;
      case SidebarObjects.DOCUMENT:
        if (boardRef != null) {
          const boundingRect = boardRef.current.getBoundingClientRect();
          const xCoord = event.clientX - boundingRect.left;
          const yCoord = event.clientY - boundingRect.top;
          const newDocument = {
            id: uuidv4(),
            type: BoardObjects.DOCUMENT,
            pX: xCoord,
            pY: yCoord,
            title: "New Document",
            content: ``,
            expanded: false,
            parent: {
              id: columnId,
              type: BoardObjects.COLUMN,
            },
          };
          dispatch(addDocument(newDocument));
          dispatch(
            addColumnChild({
              columnId,
              childId: newDocument.id,
              childType: newDocument.type,
            })
          );
        }
        break;
    }
  };

  const updateParent = (data) => {
    switch (data.parent.type) {
      case BoardObjects.BOARD:
        dispatch(
          removeBoardChild({
            boardId: data.parent.id,
            childId: data.id,
          })
        );
        dispatch(
          addColumnChild({
            columnId: columnId,
            childId: data.id,
            childType: data.type,
          })
        );
        break;
      case BoardObjects.COLUMN:
        dispatch(
          removeColumnChild({
            columnId: data.parent.id,
            childId: data.id,
          })
        );
        dispatch(
          addColumnChild({
            columnId: columnId,
            childId: data.id,
            childType: data.type,
          })
        );
        break;
    }
    switch (data.type) {
      case BoardObjects.NOTE:
        dispatch(
          updateNoteParent({
            noteId: data.id,
            newParentId: columnId,
            newParentType: BoardObjects.COLUMN,
          })
        );
        break;
      case BoardObjects.COLUMN:
        dispatch(
          updateColumnParent({
            columnId: data.id,
            newParentId: columnId,
            newParentType: BoardObjects.COLUMN,
          })
        );
        break;
      case BoardObjects.TODO:
        dispatch(
          updateTaskParent({
            taskId: data.id,
            newParentId: columnId,
            newParentType: BoardObjects.COLUMN,
          })
        );
        break;
      case BoardObjects.IMAGE:
        dispatch(
          updatePictureParent({
            pictureId: data.id,
            newParentId: columnId,
            newParentType: BoardObjects.COLUMN,
          })
        );
        break;
      case BoardObjects.BOARD:
        dispatch(
          updateBoardParent({
            boardId: data.id,
            newParentId: columnId,
            newParentType: BoardObjects.COLUMN,
          })
        );
        break;
      case BoardObjects.DOCUMENT:
        dispatch(
          updateDocumentParent({
            documentId: data.id,
            newParentId: columnId,
            newParentType: BoardObjects.COLUMN,
          })
        );
        break;
      default:
        break;
    }
  };

  return {
    allowDrop,
    drop,
  };
}
