import { useState, useRef, useCallback } from "react";
import { useDrop } from "react-dnd";

import { v4 as uuidv4 } from "uuid";

import { BoardObjects, SidebarObjects } from "../enums/items";
import Column from "./Column";
import Note from "./Note";
import React from "react";
import ToDo from "./ToDo";

const Board = () => {
  const ref = useRef(null);

  const [data, setData] = useState([]);

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current) {
      return;
    }
    const mouseX = e.clientX - ref.current.getBoundingClientRect().left - 100;
    const mouseY = e.clientY - ref.current.getBoundingClientRect().top - 20;

    setData((prevData) => {
      prevData.push({
        id: uuidv4(),
        type: "note",
        pos: { x: mouseX, y: mouseY },
        size: { x: 200, y: 200 },
        content: "New note",
        parent: { id: "board", type: BoardObjects.BOARD },
      });
      return [...prevData];
    });
  };

  const handleTextChange = (e, id) => {
    setData((prevData) => {
      let index = prevData.findIndex((p) => p.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].content = e.target.textContent;
      return [...prevData];
    });
  };

  const getChildren = useCallback(
    (parentID) => {
      return data.filter((item) => item.parent.id === parentID);
    },
    [data]
  );

  const setSize = ({ id, width, height }) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].size = { x: width, y: height };
      return [...prevData];
    });
  };

  const setTaskStatus = (id) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      console.log(id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].taskStatus = !prevData[index].taskStatus;
      return [...prevData];
    });
  };

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
            setData((prevData) => {
              let index = prevData.findIndex((b) => {
                if (b.id === item.id) {
                  console.log(b);
                  return true;
                }
              });

              let mouse = monitor.getSourceClientOffset();
              const boundingRect = ref.current.getBoundingClientRect();
              const relPos = {
                x: mouse?.x - boundingRect.left,
                y: mouse?.y - boundingRect.top,
              };
              prevData[index].parent = {
                id: "board",
                type: BoardObjects.BOARD,
              };
              prevData[index].pos = relPos;
              return [...prevData];
            });
          }
          break;

        case SidebarObjects.NOTE:
          if (ref != null) {
            setData((prevData) => {
              let mouse = monitor.getSourceClientOffset();
              const boundingRect = ref.current.getBoundingClientRect();
              const relPos = {
                x: mouse?.x - boundingRect.left,
                y: mouse?.y - boundingRect.top,
              };
              prevData.push({
                id: uuidv4(),
                type: "note",
                pos: relPos,
                size: { x: 200, y: 200 },
                content: "New Note",
                parent: { id: "board", type: BoardObjects.BOARD },
              });
              return [...prevData];
            });
          }
          break;

        case SidebarObjects.COLUMN:
          if (ref != null) {
            setData((prevData) => {
              let mouse = monitor.getSourceClientOffset();
              const boundingRect = ref.current.getBoundingClientRect();
              const relPos = {
                x: mouse?.x - boundingRect.left,
                y: mouse?.y - boundingRect.top,
              };
              prevData.push({
                id: uuidv4(),
                type: "column",
                pos: relPos,
                size: { x: 200, y: 200 },
                content: "New Column",
                parent: { id: "board", type: BoardObjects.BOARD },
              });
              return [...prevData];
            });
          }
          break;
        case SidebarObjects.TODO:
          if (ref != null) {
            setData((prevData) => {
              let mouse = monitor.getSourceClientOffset();
              const boundingRect = ref.current.getBoundingClientRect();
              const relPos = {
                x: mouse?.x - boundingRect.left,
                y: mouse?.y - boundingRect.top,
              };
              prevData.push({
                id: uuidv4(),
                type: "to-do",
                pos: relPos,
                content: "New Task",
                parent: { id: "board", type: BoardObjects.BOARD },
                taskStatus: false,
              });
              return [...prevData];
            });
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
                setSize={setSize}
              />
            );

          case BoardObjects.COLUMN:
            return (
              <Column
                key={b.id}
                onTextChange={handleTextChange}
                setData={setData}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                title={b.content}
                parent={{ id: "board", type: BoardObjects.BOARD }}
                children={getChildren(b.id)}
                setSize={setSize}
                setTaskStatus={setTaskStatus}
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
                setTaskStatus={setTaskStatus}
              />
            );
        }
      })}
    </section>
  );
};

export default Board;
