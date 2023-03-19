import { useRef, useCallback, useState, useEffect } from "react";
import { useDrop } from "react-dnd";

import { v4 as uuidv4 } from "uuid";

import { BoardObjects, SidebarObjects } from "../enums/items";
import Column from "./Column";
import Note from "./Note";
import React from "react";
import ToDo from "./ToDo";
import Picture from "./Picture";
import useBoardData from "../hooks/useBoardData";
import { parseISO } from "date-fns";
import { Box, Menu, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react";
import DragLayerComponent from "./DragLayerComponent";

//import SelectionMarquee from "./SelectionMarquee";

const Board = () => {
  const ref = useRef(null);

  const {
    data,
    addNote,
    addTodo,
    addColumn,
    addImage,
    updatePosition,
    updateSize,
    updateParent,
    updateContent,
    updateTaskStatus,
    updateDeadline,
    updateSummary,
    updateImage,
    setFocusedElement,
    deleteFocusedElement,
    getChildren,
  } = useBoardData("board");

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current) {
      return;
    }
    const mouseX = e.clientX - 100;
    const mouseY = e.clientY - 20;
    addNote(uuidv4(), mouseX, mouseY, 200, 200, "New note", {
      id: "board",
      type: BoardObjects.BOARD,
    });
  };

  //#region Context Menu
  const initialRef = useRef(null);
  const [mousePos, setMousePos] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (mousePos !== null) {
      console.log(mousePos);
    }
  }, [mousePos]);

  const handleRightClick = (e) => {
    if (e.target !== ref.current) {
      return;
    }
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    setMousePos({ x: mouseX, y: mouseY });
    onOpen();
  };

  const ContextMenu = () => {
    return (
      <Menu
        initialFocusRef={initialRef}
        isOpen={isOpen}
        closeOnBlur={true}
        onClose={onClose}
        isLazy
      >
        <MenuList
          position="absolute"
          left={mousePos !== null ? mousePos.x + "px" : 0}
          top={mousePos !== null ? mousePos.y + "px" : 0}
        >
          <MenuItem
            onClick={(e) => {
              addNote(
                uuidv4(),
                e.clientX - 100,
                e.clientY - 20,
                200,
                200,
                "New note",
                {
                  id: "board",
                  type: BoardObjects.BOARD,
                }
              );
            }}
          >
            New Note
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              addColumn(
                uuidv4(),
                e.clientX - 150,
                e.clientY - 20,
                "New column",
                {
                  id: "board",
                  type: BoardObjects.BOARD,
                }
              );
            }}
          >
            New Column
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              addImage(uuidv4(), mousePos.x - 100, mousePos.y - 20, {
                id: "board",
                type: BoardObjects.BOARD,
              });
            }}
          >
            New Image
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              addTodo(uuidv4(), e.clientX - 125, e.clientY - 20, "New task", {
                id: "board",
                type: BoardObjects.BOARD,
              });
            }}
          >
            New To-Do
          </MenuItem>
        </MenuList>
      </Menu>
    );
  };
  //#endregion

  const handleTextChange = (e, id) => {
    updateContent(id, e.target.textContent);
  };

  //#region Drop behaviour
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      BoardObjects.NOTE,
      SidebarObjects.NOTE,
      SidebarObjects.COLUMN,
      BoardObjects.COLUMN,
      BoardObjects.TODO,
      SidebarObjects.TODO,
      BoardObjects.IMAGE,
      SidebarObjects.IMAGE,
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
        case BoardObjects.IMAGE:
          if (ref != null) {
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x,
              y: mouse?.y,
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
              x: mouse?.x,
              y: mouse?.y,
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
              x: mouse?.x,
              y: mouse?.y,
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
              x: mouse?.x,
              y: mouse?.y,
            };
            const parent = {
              id: "board",
              type: BoardObjects.BOARD,
            };
            addTodo(uuidv4(), relPos.x, relPos.y, "New Task", parent);
          }
          break;

        case SidebarObjects.IMAGE:
          if (ref != null) {
            let mouse = monitor.getSourceClientOffset();
            const boundingRect = ref.current.getBoundingClientRect();
            const relPos = {
              x: mouse?.x,
              y: mouse?.y,
            };
            const parent = {
              id: "board",
              type: BoardObjects.BOARD,
            };
            addImage(uuidv4(), relPos.x, relPos.y, parent);
          }
          break;
        default:
          return;
      }
    },
  }));

  drop(ref);

  //#endregion

  useEffect(() => {
    const keyDownHandler = (event) => {
      console.log(event.target);
      console.log("User pressed: ", event.key);
      if (event.key === "Delete") {
        event.preventDefault();
        deleteFocusedElement();
      }
      // if (event.key === 'Enter') {
      //   event.preventDefault();

      //   // 👇️ your logic here
      //   myFunction();
      // }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  //#region Render board
  return (
    <Box
      h="full"
      w={"full"}
      m={0}
      p={0}
      flex={1}
      ref={ref}
      id="board"
      bgColor={"gray.900"}
      onClick={(e) => {
        if (e.detail === 2) {
          handleDoubleClick(e);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        console.log("hi");
        handleRightClick(e);
      }}
      onKeyUp={(e) => {
        console.log(e.key);
      }}
    >
      <ContextMenu />
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
                updateSize={updateSize}
                updateContent={updateContent}
                setFocusedElement={setFocusedElement}
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
                sX={b.size.x}
                title={b.content}
                parent={{ id: "board", type: BoardObjects.BOARD }}
                children={getChildren(b.id)}
                addNote={addNote}
                addTodo={addTodo}
                addImage={addImage}
                updateSize={updateSize}
                updateTaskStatus={updateTaskStatus}
                updateParent={updateParent}
                updateContent={updateContent}
                updateDeadline={updateDeadline}
                updateSummary={updateSummary}
                updateImage={updateImage}
                setFocusedElement={setFocusedElement}
              />
            );

          case BoardObjects.TODO:
            return (
              <ToDo
                key={b.id}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                text={b.content}
                parent={{ id: "board", type: BoardObjects.BOARD }}
                deadline={b.deadline === null ? null : parseISO(b.deadline)}
                summary={b.summary}
                taskStatus={b.taskStatus}
                updateTaskStatus={updateTaskStatus}
                updateContent={updateContent}
                updateDeadline={updateDeadline}
                updateSummary={updateSummary}
              />
            );

          case BoardObjects.IMAGE:
            return (
              <Picture
                key={b.id}
                id={b.id}
                pX={b.pos.x}
                pY={b.pos.y}
                sX={b.size.x}
                sY={b.size.y}
                image={b.image}
                text={b.content}
                parent={{ id: "board", type: BoardObjects.BOARD }}
                updateImage={updateImage}
                updateContent={updateContent}
                updateSize={updateSize}
              />
            );
        }
      })}
    </Box>
  );
  //#endregion
};

export default Board;
