/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import "../App.css";
import { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

import { BoardObjects } from "../enums/items";

const ToDo = ({
  id,
  pX,
  pY,
  text,
  onTextChange,
  parent,
  taskStatus,
  setTaskStatus,
}) => {
  const ref = useRef(null);
  const [isEditing, setEditMode] = useState(false);
  const [isInColumn, setIsInColumn] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.TODO,
    item: { id: id, type: BoardObjects.TODO, ref: ref, parent: parent },
    collect: (monitor) => {
      console.log(monitor.getItem());
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));
  drag(ref);

  useEffect(() => {
    setIsInColumn(parent.type === BoardObjects.COLUMN);
  }, [parent]);

  const edit = (e) => {
    setEditMode(true);
    e.target.focus();
  };

  const endEdit = (string) => {
    setEditMode(false);
    onTextChange(string, id);
  };

  return (
    <div
      ref={ref}
      css={css`
        display: flex;
        flex-direction: row;
        background-color: #598c72;
        color: #2e493c;
        position: ${isInColumn ? "static" : "absolute"};
        width: ${isInColumn ? "100%" : "250px"};
        ${isInColumn ? "min-width: 100%;" : ""}
        height: 85px;
        ${isInColumn ? "" : "left: " + pX + "px;"}
        ${isInColumn ? "" : "top: " + pY + "px;"}
        cursor: ${isEditing ? "auto" : "pointer"};
      `}
    >
      <div>
        <input
          type="checkbox"
          checked={taskStatus}
          onChange={() => setTaskStatus(id)}
        ></input>
      </div>
      <div
        css={css`
          overflow: auto;
        `}
        contentEditable={isEditing ? true : false}
        tabIndex={0}
        onClick={(e) => {
          edit(e);
        }}
        draggable={!isEditing}
        onBlur={(e) => {
          endEdit(e);
        }}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            e.preventDefault();
            text += "\n";
          }
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default ToDo;
