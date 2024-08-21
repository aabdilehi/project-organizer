import React, { useEffect, useMemo, useRef } from "react";
import { useContext } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { BoardObjects } from "../enums/items";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
} from "../slices/nodeActions";
import {
  BoardC,
  ColumnC,
  DocumentC,
  NoteC,
  PictureC,
  TaskC,
} from "../classes/classes";
import { addCopyNode, clearCopiedNodes } from "../slices/copiedSlice";
//import { removeBoard } from "../slices/boardSlice";

// get selected nodes

// check how many *types* of nodes there are
// show any overlapping *basic* options if multiple types

// standardised cut, copy and delete functions
//

export function useContextMenu({ boardId, containerRef }) {
  const [isOpen, setIsOpen] = useState(false);

  // need these to read their children property
  const boards = useSelector((state) => state.boards);
  const columns = useSelector((state) => state.columns);

  const nodes = useSelector((state) => {
    return {
      ...state.boards,
      ...state.columns,
      ...state.notes,
      ...state.documents,
      ...state.pictures,
      ...state.tasks,
    };
  });
  // need this to convert from/to documents to/from notes
  const notes = useSelector((state) => state.notes);
  const documents = useSelector((state) => state.documents);

  const selectedNodes = useSelector((state) => state.selection);
  const copiedNodes = useSelector((state) => state.copied);

  const [menuItems, setMenuItems] = useState([]);
  const [menuProps, setMenuProps] = useState({
    canCopy: true,
    canCut: true,
    canPaste: true,
    canDelete: false,
  });

  const createNote = (mouseX, mouseY) => {
    const { ...newNote } = new NoteC({
      pX: mouseX,
      pY: mouseY,
      parent: {
        id: boardId,
        type: BoardObjects.BOARD,
      },
    });
    dispatch(addNode.action(newNote));
    dispatch(
      addChild.action({
        id: boardId,
        type: BoardObjects.BOARD,
        cId: newNote.id,
        cType: newNote.type,
      })
    );
  };

  const convertNoteToDocument = (id) => {
    const note = notes[id];
    if (!note) return;

    const { ...newDocument } = new DocumentC({
      id: note.id,
      pX: note.pX,
      pY: note.pY,
      title:
        note.content.length > 10
          ? `${note.content.slice(0, 10)}...`
          : note.content,
      content: note.content,
      parent: note.parent,
    });

    dispatch(
      removeChild.action({
        id: note.parent.id,
        type: note.parent.type,
        cId: id,
      })
    );
    dispatch(removeNode.action({ id, type: BoardObjects.NOTE }));
    dispatch(addNode.action(newDocument));
    dispatch(
      addChild.action({
        id: note.parent.id,
        type: note.parent.type,
        cId: id,
        cType: BoardObjects.DOCUMENT,
      })
    );
  };
  const convertDocumentToNote = (id) => {};

  const typeMapping = (mouseX, mouseY) => {
    // nothing selected means board
    const selectedNodesArr = Object.values(selectedNodes);
    if (selectedNodesArr.length <= 0) {
      setMenuProps({
        canCopy: false,
        canCut: false,
        canPaste: true,
        canDelete: false,
      });
      setMenuItems([
        <div
          className="context-menu-item" // Note
          onClick={() => createNote(mouseX, mouseY)}
        >
          New Note
        </div>,

        <div
          className="context-menu-item" // Document
          onClick={() => {
            const { ...newDocument } = new DocumentC({
              pX: mouseX,
              pY: mouseY,
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            });
            dispatch(addNode.action(newDocument));
            dispatch(
              addChild.action({
                id: boardId,
                type: BoardObjects.BOARD,
                cId: newDocument.id,
                cType: newDocument.type,
              })
            );
          }}
        >
          New Document
        </div>,

        <div
          className="context-menu-item" // Task
          onClick={() => {
            const { ...newTask } = new TaskC({
              pX: mouseX,
              pY: mouseY,
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            });
            dispatch(addNode.action(newTask));
            dispatch(
              addChild.action({
                id: boardId,
                type: BoardObjects.BOARD,
                cId: newTask.id,
                cType: newTask.type,
              })
            );
          }}
        >
          New Task
        </div>,

        <div
          className="context-menu-item" // Column
          onClick={() => {
            const { ...newColumn } = new ColumnC({
              pX: mouseX,
              pY: mouseY,
              sX: 200,
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            });
            dispatch(addNode.action(newColumn));
            dispatch(
              addChild.action({
                id: boardId,
                type: BoardObjects.BOARD,
                cId: newColumn.id,
                cType: newColumn.type,
              })
            );
          }}
        >
          New Column
        </div>,

        <div
          className="context-menu-item" // Board
          onClick={() => {
            const { ...newBoard } = new BoardC({
              pX: mouseX,
              pY: mouseY,
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            });
            dispatch(addNode.action(newBoard));
            dispatch(
              addChild.action({
                id: boardId,
                type: BoardObjects.BOARD,
                cId: newBoard.id,
                cType: newBoard.type,
              })
            );
          }}
        >
          New Board
        </div>,

        <div
          className="context-menu-item" // Picture
          onClick={() => {
            const { ...newPicture } = new PictureC({
              pX: mouseX,
              pY: mouseY,
              parent: {
                id: boardId,
                type: BoardObjects.BOARD,
              },
            });
            dispatch(addNode.action(newPicture));
            dispatch(
              addChild.action({
                id: boardId,
                type: BoardObjects.BOARD,
                cId: newPicture.id,
                cType: newPicture.type,
              })
            );
          }}
        >
          New Image
        </div>,
      ]);
      return;
    }
    // multiple selected should give only basic options
    if (selectedNodesArr.length > 1) {
      setMenuProps({
        canCopy: true,
        canCut: true,
        canPaste: false,
        canDelete: true,
      });
      setMenuItems([]);
      return;
    }
    // specialised options when only one node is selected
    // really should have it be based on how many TYPES of nodes present rather than the how many nodes in general
    if (!selectedNodesArr[0].type) {
      setMenuProps({
        canCopy: true,
        canCut: true,
        canPaste: false,
        canDelete: true,
      });
      setMenuItems([]);
      return;
    }
    switch (selectedNodesArr[0].type) {
      case "note":
        setMenuProps({
          canCopy: true,
          canCut: true,
          canPaste: false,
          canDelete: true,
        });
        setMenuItems([
          <div
            className="context-menu-item"
            onClick={() => convertNoteToDocument(selectedNodesArr[0].id)}
          >
            Convert to document
          </div>,
        ]);
        return;
      case "document":
        setMenuProps({
          canCopy: true,
          canCut: true,
          canPaste: false,
          canDelete: true,
        });
        setMenuItems([
          <div
            className="context-menu-item"
            onClick={() => convertDocumentToNote(selectedNodesArr[0].id)}
          >
            Convert to note
          </div>,
        ]);
        return;
      case "column":
        setMenuProps({
          canCopy: true,
          canCut: true,
          canPaste: true,
          canDelete: true,
        });
        setMenuItems([]);
        return;
      case "picture":
      case "task":
      case "board":
      default:
        setMenuProps({
          canCopy: true,
          canCut: true,
          canPaste: false,
          canDelete: true,
        });
        setMenuItems([]);
        return;
    }
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const dispatch = useDispatch();
  const handleRightClick = (event) => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;

    // determine menu items and props
    typeMapping(mouseX, mouseY);

    // open context menu at mouse pos
    setMousePos({ x: mouseX, y: mouseY });
    setIsOpen(true);
  };

  const handleDelete = (id, type, parent) => {
    // column
    const deleteBoard = () => {
      const board = boards[id];
      if (!board) return;

      board.childRefs.forEach(({ childId, childType }) => {
        handleDelete(childId, childType, board);
      });

      dispatch(
        removeChild.action({ id: parent.id, type: parent.type, cId: id })
      );
      dispatch(removeNode.action({ id, type: BoardObjects.BOARD }));
    };

    // column
    const deleteColumn = () => {
      const column = columns[id];
      if (!column) return;

      column.childRefs.forEach(({ childId, childType }) => {
        handleDelete(childId, childType, column);
      });

      dispatch(
        removeChild.action({ id: parent.id, type: parent.type, cId: id })
      );
      dispatch(removeNode.action({ id, type: BoardObjects.COLUMN }));
    };

    // note, task, picture, document
    const deleteOther = () => {
      dispatch(
        removeChild.action({ id: parent.id, type: parent.type, cId: id })
      );
      dispatch(removeNode.action({ id, type }));
    };

    switch (type) {
      case BoardObjects.BOARD:
        deleteBoard();
        break;
      case BoardObjects.COLUMN:
        deleteColumn();
        break;
      default:
        deleteOther();
        break;
    }
  };

  const handleCopy = (id, type) => {
    // column
    const copyBoard = () => {
      const board = boards[id];
      if (!board) return;

      board.childRefs.forEach(({ childId, childType }) => {
        handleCopy(childId, childType);
      });
      dispatch(addCopyNode(board));
    };

    // column
    const copyColumn = () => {
      const column = columns[id];
      if (!column) return;

      column.childRefs.forEach(({ childId, childType }) => {
        handleCopy(childId, childType);
      });

      dispatch(addCopyNode(column));
    };

    // note, task, picture, document
    const copyOther = () => {
      const node = nodes[id];
      console.log(node);
      if (!node) return;
      dispatch(addCopyNode(node));
    };

    switch (type) {
      case BoardObjects.BOARD:
        copyBoard();
        break;
      case BoardObjects.COLUMN:
        copyColumn();
        break;
      default:
        copyOther();
        break;
    }
  };

  const ContextMenu = () => {
    // I think paste should still be custom (?)
    const contextRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
      const handleClick = (e) => {
        if (
          e.currentTarget !== contextRef.current ||
          e.currentTarget.parentNode !== contextRef.current
        ) {
          setIsOpen(false);
        }
      };
      window.addEventListener("click", handleClick);
      return () => {
        window.removeEventListener("click", handleClick);
      };
    }, []);

    const styleProps = {
      rounded: "none",
      style: {
        border: "none",
        outline: "none",
        ":focus": {
          border: "none",
          outline: "none",
        },
      },
    };
    return isOpen ? (
      <div
        className="context-menu"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        }}
        ref={contextRef}
      >
        {menuProps.canCopy ||
        menuProps.canCut ||
        menuProps.canDelete ||
        menuProps.canPaste ? (
          <div
            className="context-menu-group"
            onClickCapture={(e) => console.log("HELLO")}
          >
            <p>Standard Node Actions</p>
            {menuProps.canCut ? (
              <div
                className="context-menu-item"
                onClick={() => {
                  const selectedNodesArr = Object.values(selectedNodes);
                  if (
                    selectedNodesArr.length > 1 ||
                    selectedNodesArr.some(
                      (value) =>
                        value.type == BoardObjects.COLUMN ||
                        value.type == BoardObjects.BOARD
                    )
                  ) {
                    const result = window.confirm(
                      "Are you sure you wish to delete these nodes?"
                    );
                    if (!result) return;
                  }
                  Object.values(selectedNodes).forEach((item) => {
                    handleCopy(item.id, item.type);
                    handleDelete(item.id, item.type, item.parent);
                  });
                  //copyNodes(selectedNodesArr);
                }}
              >
                Cut
              </div>
            ) : null}
            {menuProps.canCopy ? (
              <div
                className="context-menu-item"
                onClick={() => {
                  const selectedNodesArr = Object.values(selectedNodes);
                  dispatch(clearCopiedNodes);
                  selectedNodesArr.forEach((item) => {
                    handleCopy(item.id, item.type);
                  });
                  console.log(copiedNodes);
                }}
              >
                Copy
              </div>
            ) : null}
            {menuProps.canDelete ? (
              <div
                className="context-menu-item"
                onClick={() => {
                  const selectedNodesArr = Object.values(selectedNodes);
                  if (
                    selectedNodesArr.length > 1 ||
                    selectedNodesArr.some(
                      (value) =>
                        value.type == BoardObjects.COLUMN ||
                        value.type == BoardObjects.BOARD
                    )
                  ) {
                    const result = window.confirm(
                      "Are you sure you wish to delete these nodes?"
                    );
                    if (!result) return;
                  }
                  selectedNodesArr.forEach((item) => {
                    handleDelete(item.id, item.type, item.parent);
                  });
                }}
              >
                Delete
              </div>
            ) : null}
            {menuProps.canPaste ? (
              <div
                className="context-menu-item"
                onClick={() => {
                  const mappedIDs = {};
                  Object.values(copiedNodes).forEach((item) => {
                    mappedIDs[item.id] = uuidv4();
                  });
                  const a = Object.values(copiedNodes).map((item) => {
                    const node = {
                      ...item,
                      id: mappedIDs[item.id],
                      pX: mousePos.x,
                      pY: mousePos.y,
                    };

                    // Check if parent's ID is in object.
                    // if true, use mappedIDs to update; else assign id of node that triggered the paste
                    node.parent = !!mappedIDs[node.parent.id]
                      ? { ...node.parent, id: mappedIDs[node.parent.id] }
                      : { id: boardId, type: BoardObjects.BOARD }; // paste node id;
                    if (!node.childRefs) return node;
                    // Update childRefs of IDS
                    node.childRefs = node.childRefs
                      .map((item2) => {
                        const child = {
                          ...item2,
                          childId: !!mappedIDs[item2.childId]
                            ? mappedIDs[item2.childId]
                            : undefined,
                        };
                        return child;
                      })
                      .filter((item2) => item2.childID !== undefined);

                    return node;
                  });
                  //paste(a);
                  a.forEach((node) => {
                    // check if node has parent in paste list
                    const parent = a.find((node2) => {
                      if (!node2.childRefs) return false;
                      if (!node2.childRefs.find((item) => item.id === node.id))
                        return false;
                      return true;
                    });
                    if (!!parent) {
                      dispatch(addNode.action(node));
                      dispatch(
                        addChild.action({
                          id: parent.id,
                          type: parent.type,
                          cId: node.id,
                          cType: node.type,
                        })
                      );
                      return;
                    }
                    // if not then paste to board
                    dispatch(addNode.action(node));
                    dispatch(
                      addChild.action({
                        id: boardId,
                        type: BoardObjects.BOARD,
                        cId: node.id,
                        cType: node.type,
                      })
                    );
                  });
                }}
              >
                Paste
              </div>
            ) : null}
          </div>
        ) : null}

        {menuItems.length > 0 && (
          <div className="context-menu-group">
            <p>Exclusive Node Actions</p>
            {menuItems}
          </div>
        )}
      </div>
    ) : undefined;
  };

  return {
    handleRightClick,
    ContextMenu,
  };
}
