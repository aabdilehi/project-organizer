/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import "../App.css";
import { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

import { BoardObjects } from "../enums/items";
import ResizeObserver from "rc-resize-observer";

const Note = ({
  id,
  pX,
  pY,
  sX,
  sY,
  text,
  onTextChange,
  parent,
  updateSize,
}) => {
  const ref = useRef(null);
  const [isEditing, setEditMode] = useState(false);
  const [isInColumn, setIsInColumn] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.NOTE,
    item: { id: id, type: BoardObjects.NOTE, ref: ref, parent: parent },
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
    <ResizeObserver
      ref={ref}
      onResize={({ width, height }) => {
        if (!isInColumn) {
          updateSize(id, width, height);
        }
      }}
    >
      <div
        css={css`
          background-color: #598c72;
          color: #2e493c;
          position: ${isInColumn ? "static" : "absolute"};
          min-height: 75px;
          overflow: auto;
          width: ${isInColumn ? "100%" : sX + "px"};
          ${isInColumn ? "min-width: 100%;" : ""}
          height: ${sY}px;
          ${isInColumn ? "" : "left: " + pX + "px;"}
          ${isInColumn ? "" : "top: " + pY + "px;"}
        resize: ${isInColumn ? "vertical" : "both"};

          cursor: ${isEditing ? "auto" : "pointer"};
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
    </ResizeObserver>
  );
};

export default Note;
