/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { BoardObjects, SidebarObjects } from "../enums/items";

import { v4 as uuidv4 } from "uuid";

import Note from "./Note";
import ToDo from "./ToDo";

const Column = ({
  id,
  pX,
  pY,
  title,
  onTextChange,
  parent,
  children,
  addNote,
  addTodo,
  updateSize,
  updateTaskStatus,
  updateParent,
}) => {
  const ref = useRef(null);
  const columnRef = useRef(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      BoardObjects.NOTE,
      SidebarObjects.NOTE,
      BoardObjects.TODO,
      SidebarObjects.TODO,
    ],
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    drop: (item, monitor) => {
      switch (item.type) {
        case BoardObjects.NOTE:
        case BoardObjects.TODO:
          if (item.parent.id !== id) {
            if (monitor.isOver({ shallow: true })) {
              const newParent = {
                id: id,
                type: BoardObjects.COLUMN,
              };
              updateParent(item.id, -1, -1, newParent, false);
            }
          }
          break;
        case SidebarObjects.NOTE:
          if (monitor.isOver({ shallow: true })) {
            const parent = {
              id: id,
              type: BoardObjects.COLUMN,
            };
            addNote(uuidv4(), 0, 0, 200, 200, "New note", parent);
          }
          break;
        case SidebarObjects.TODO:
          if (monitor.isOver({ shallow: true })) {
            const parent = {
              id: id,
              type: BoardObjects.COLUMN,
            };
            addTodo(uuidv4(), 0, 0, "New task", parent);
          }
          break;
        default:
      }
    },
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.COLUMN,
    item: {
      id: id,
      type: BoardObjects.COLUMN,
      parent: parent,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drop(drag(ref));

  return (
    <div
      ref={ref}
      css={css`
        position: absolute;
        left: ${pX}px;
        top: ${pY}px;
        display: flex;
        flex-direction: column;
        padding-bottom: 10px;
        align-items: center;
        min-width: 300px;
        min-height: 120px;
        background-color: #40795d;
        resize: horizontal;
        overflow: auto;
      `}
    >
      <h1
        contentEditable={true}
        css={css`
          text-align: center;
          width: calc(100% - 15px);
          padding: 10px 0;
        `}
        onBlur={(e) => onTextChange(e, id)}
      >
        {title}
      </h1>
      <div
        ref={columnRef}
        css={css`
          display: flex;
          width: calc(100% - 15px);
          flex: 1;
          flex-direction: column;
          align-items: center;
          background-color: #3c6550;
          gap: 3px;
        `}
      >
        {children.map((b, index) => {
          switch (b.type) {
            case BoardObjects.NOTE:
              return (
                <Note
                  key={b.id}
                  onTextChange={onTextChange}
                  id={b.id}
                  pX={b.pos.x}
                  pY={b.pos.y}
                  sX={b.size.x}
                  sY={b.size.y}
                  text={b.content}
                  parent={{ id: id, type: BoardObjects.COLUMN }}
                  updateSize={updateSize}
                />
              );
            case BoardObjects.TODO:
              return (
                <ToDo
                  key={b.id}
                  onTextChange={onTextChange}
                  id={b.id}
                  pX={b.pos.x}
                  pY={b.pos.y}
                  text={b.content}
                  parent={{ id: id, type: BoardObjects.COLUMN }}
                  taskStatus={b.taskStatus}
                  updateTaskStatus={updateTaskStatus}
                />
              );
            default:
          }
        })}
      </div>
    </div>
  );
};

export default Column;
