/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { BoardObjects, SidebarObjects } from "../enums/items";

import { useDropType } from "../hooks/useDropType";

const Column = ({ id, pX, pY, title, data, setData }) => {
  const ref = useRef(null);
  const columnRef = useRef(null);

  // Use your custom hook to access or update the drop type
  const { setDropType } = useDropType();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [BoardObjects.NOTE, SidebarObjects.NOTE],
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    drop: (item, monitor) => {
      switch (item.type) {
        case BoardObjects.NOTE:
          if (monitor.isOver({ shallow: true })) {
            setDropType({
              type: item.type,
              ref: item.ref,
              dropLoc: BoardObjects.COLUMN,
            });

            columnRef.current.appendChild(item.ref.current);
          }
          break;
        case SidebarObjects.NOTE:
          if (monitor.isOver({ shallow: true })) {
            setDropType({
              type: item.type,
              ref: item.ref,
              dropLoc: BoardObjects.COLUMN,
            });

            let dA = [...data.current];

            dA.push({
              id: `pl${dA.length}`,
              type: "note",
              pos: { x: 0, y: 0 },
              size: { x: 200, y: 200 },
              content: "New Note",
              isInColumn: true,
            });
            setData(dA);

            if (columnRef.current !== null) {
              columnRef.current.appendChild(item.ref.current);
            }
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
        css={css`
          text-align: center;
          width: calc(100% - 15px);
          padding: 10px 0;
        `}
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
        `}
      ></div>
    </div>
  );
};

export default Column;
