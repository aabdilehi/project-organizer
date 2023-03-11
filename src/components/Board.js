import { useState, useRef, useCallback } from "react";
import { useDrop } from "react-dnd";

import { v4 as uuidv4 } from "uuid";

import { BoardObjects, SidebarObjects } from "../enums/items";
import Column from "./Column";
import Note from "./Note";
import React from "react";
import ToDo from "./ToDo";
import useBoardData from "../hooks/useBoardData";

const Board = () => {
  const ref = useRef(null);

  const {
    data,
    addNote,
    addTodo,
    addColumn,
    updatePosition,
    updateSize,
    updateParent,
    updateContent,
    updateTaskStatus,
  } = useBoardData("board");

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current) {
      return;
    }
    const mouseX = e.clientX - ref.current.getBoundingClientRect().left - 100;
    const mouseY = e.clientY - ref.current.getBoundingClientRect().top - 20;
    addNote(uuidv4(), mouseX, mouseY, "New note", {
      id: "board",
      type: BoardObjects.BOARD,
    });
  };

  const handleTextChange = (e, id) => {
    updateContent(id, e.target.textContent);
  };

  const getChildren = useCallback(
    (parentID) => {
      return data.filter((item) => item.parent.id === parentID);
    },
    [data]
  );

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      BoardObjects.NOTE,
      SidebarObjects.NOTE,
      SidebarObjects.COLUMN,
      BoardObjects.COLUMN,
      BoardObjects.TODO,
      SidebarObjects.TODO,
    ],
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    drop: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      switch (item.type) {
        case BoardObjects.NOTE:
        case BoardObjects.COLUMN:
        case BoardObjects.TODO:
          if (ref != null) {
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x - boundingRect.left,
              y: mouse?.y - boundingRect.top,
            };
            if (item.parent.id === "board") {
              updatePosition(item.id, relPos.x, relPos.y);
            } else {
              updateParent(
                item.id,
                relPos.x,
                relPos.y,
                {
                  id: "board",
                  type: BoardObjects.BOARD,
                },
                true
              );
            }
          }
          break;

        case SidebarObjects.NOTE:
          if (ref != null) {
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x - boundingRect.left,
              y: mouse?.y - boundingRect.top,
            };
            const parent = {
              id: "board",
              type: BoardObjects.BOARD,
            };
            addNote(uuidv4(), relPos.x, relPos.y, 200, 200, "New Note", parent);
          }
          break;

        case SidebarObjects.COLUMN:
          if (ref != null) {
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x - boundingRect.left,
              y: mouse?.y - boundingRect.top,
            };
            const parent = {
              id: "board",
              type: BoardObjects.BOARD,
            };
            addColumn(uuidv4(), relPos.x, relPos.y, "New Column", parent);
          }
          break;
        case SidebarObjects.TODO:
          if (ref != null) {
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x - boundingRect.left,
              y: mouse?.y - boundingRect.top,
            };
            const parent = {
              id: "board",
              type: BoardObjects.BOARD,
            };
            addTodo(uuidv4(), relPos.x, relPos.y, "New Task", parent);
          }
          break;
        default:
          return;
      }
    },
  }));

  drop(ref);
  return (
    <section
      ref={ref}
      id="board"
      onClick={(e) => {
        if (e.detail === 2) {
          handleDoubleClick(e);
        }
      }}
    >
      {getChildren("board").map((b, index) => {
        console.log(b);
        switch (b.type) {
          case BoardObjects.NOTE:
            return (
              <Note
                key={b.id}
                onTextChange={handleTextChange}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                sX={b.size.x}
                sY={b.size.y}
                text={b.content}
                parent={{ id: "board", type: BoardObjects.BOARD }}
                updateSize={updateSize}
              />
            );

          case BoardObjects.COLUMN:
            return (
              <Column
                key={b.id}
                onTextChange={handleTextChange}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                title={b.content}
                parent={{ id: "board", type: BoardObjects.BOARD }}
                children={getChildren(b.id)}
                addNote={addNote}
                addTodo={addTodo}
                updateSize={updateSize}
                updateTaskStatus={updateTaskStatus}
                updateParent={updateParent}
              />
            );

          case BoardObjects.TODO:
            return (
              <ToDo
                key={b.id}
                onTextChange={handleTextChange}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                text={b.content}
                parent={{ id: "board", type: BoardObjects.BOARD }}
                taskStatus={b.taskStatus}
                updateTaskStatus={updateTaskStatus}
              />
            );
        }
      })}
    </section>
  );
};

export default Board;
