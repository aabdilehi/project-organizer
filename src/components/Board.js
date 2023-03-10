import { useState, useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import { useDropType } from "../hooks/useDropType";

import { BoardObjects, SidebarObjects } from "../enums/items";
import Column from "./Column";
import Note from "./Note";

const Board = () => {
  const ref = useRef(null);

  // Use your custom hook to access or update the drop type
  const { dropType, setDropType } = useDropType();

  const [data, setData] = useState([
    {
      id: "aaa",
      type: "note",
      pos: { x: 200, y: 300 },
      size: { x: 200, y: 50 },
      content: "AAAAAA",
      isInColumn: false,
    },
    {
      id: "bbb",
      type: "note",
      pos: { x: 100, y: 100 },
      size: { x: 250, y: 250 },
      content: "BBBBBB",
      isInColumn: false,
    },
  ]);

  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const handleDoubleClick = (e) => {
    if (e.target != ref.current) {
      return;
    }
    const mouseX = e.clientX - ref.current.getBoundingClientRect().left - 100;
    const mouseY = e.clientY - ref.current.getBoundingClientRect().top - 20;

    const dA = [...dataRef.current];

    dA.push({
      id: `pl${dA.length}`,
      type: "note",
      pos: { x: mouseX, y: mouseY },
      size: { x: 200, y: 200 },
      content: "New note",
      isInColumn: false,
    });

    setData(dA);
  };

  const handleTextChange = (e, id) => {
    const dA = [...dataRef.current];
    let index = dA.findIndex((p) => p.id === id);
    if (index == -1) {
      return;
    }
    dA[index].content = e.target.textContent;
    setData(dA);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      BoardObjects.NOTE,
      SidebarObjects.NOTE,
      SidebarObjects.COLUMN,
      BoardObjects.COLUMN,
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
          console.log(item);
          if (ref != null) {
            setDropType({
              type: item.type,
              ref: item.ref,
              dropLoc: BoardObjects.BOARD,
            });
            let bA = [...dataRef.current];
            let index = bA.findIndex((b) => b.id === item.id);
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x - boundingRect.left,
              y: mouse?.y - boundingRect.top,
            };
            console.log(bA[index]);
            bA[index].pos = relPos;
            setData(bA);
            ref.current.appendChild(item.ref.current);
          }
          break;

        case SidebarObjects.NOTE:
          if (ref != null) {
            let dA = [...dataRef.current];
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x - boundingRect.left,
              y: mouse?.y - boundingRect.top,
            };
            dA.push({
              id: `pl${dA.length}`,
              type: "note",
              pos: relPos,
              size: { x: 200, y: 200 },
              content: "New Note",
              isInColumn: false,
            });
            setData(dA);
          }
          break;

        case SidebarObjects.COLUMN:
          if (ref != null) {
            let dA = [...dataRef.current];
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x - boundingRect.left,
              y: mouse?.y - boundingRect.top,
            };
            dA.push({
              id: `pl${dA.length}`,
              type: "column",
              pos: relPos,
              size: { x: 200, y: 200 },
              content: "New Column",
              isInColumn: false,
            });
            setData(dA);
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
        if (e.detail == 2) {
          handleDoubleClick(e);
        }
      }}
    >
      {data.map((b, index) => {
        switch (b.type) {
          case BoardObjects.NOTE:
            return (
              <Note
                onTextChange={handleTextChange}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                sX={b.size.x}
                sY={b.size.y}
                text={b.content}
                isInColumn={false}
              />
            );

          case BoardObjects.COLUMN:
            return (
              <Column
                data={dataRef}
                setData={setData}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                title={b.content}
              />
            );
        }
      })}
    </section>
  );
};

export default Board;
