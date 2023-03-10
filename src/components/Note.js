/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import "../App.css";
import { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

import { BoardObjects } from "../enums/items";

import { useDragLayer } from "react-dnd";

import { useDropType } from "../hooks/useDropType";

const useDragType = () => {
  const { itemType } = useDragLayer((monitor) => ({
    itemType: monitor.getItemType(),
  }));

  return itemType;
};

const Note = ({ id, pX, pY, sX, sY, text, onTextChange, isInColumn }) => {
  const ref = useRef(null);
  const [isEditing, setEditMode] = useState(false);
  const [gurb, setGurb] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.NOTE,
    item: { id: id, type: BoardObjects.NOTE, ref: ref, col: gurb },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(ref);

  const { dropType } = useDropType();

  useEffect(() => {
    setGurb(isInColumn);
  }, []);

  useEffect(() => {
    if (dropType?.ref && ref) {
      if (dropType.ref.current === ref.current) {
        console.log(dropType);
        if (dropType.dropLoc === BoardObjects.COLUMN) {
          setGurb(true);
        } else if (dropType.dropLoc === BoardObjects.BOARD) {
          setGurb(false);
        }
      }
    }
  }, [dropType]);

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
        background-color: red;
        color: green;
        position: ${gurb ? "static" : "absolute"};
        min-height: 75px;
        overflow: auto;
        margin-bottom: 5px;
        width: ${gurb ? "100%" : sX + "px"};
        ${gurb ? "min-width: 100%;" : ""}
        height: ${sY}px;
        ${gurb ? "" : "left: " + pX + "px;"}
        ${gurb ? "" : "top: " + pY + "px;"}
        resize: ${gurb ? "vertical" : "both"};

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
  );
};

export default Note;
