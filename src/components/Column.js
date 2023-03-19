/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { BoardObjects, SidebarObjects } from "../enums/items";
import ResizeObserver from "rc-resize-observer";

import { v4 as uuidv4 } from "uuid";

import Note from "./Note";
import ToDo from "./ToDo";
import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  Editable,
  EditableInput,
} from "@chakra-ui/react";
import CustomEditablePreview from "./CustomEditablePreview";
import Picture from "./Picture";

const Column = ({
  id,
  pX,
  pY,
  sX,
  title,
  onTextChange,
  parent,
  children,
  addNote,
  addTodo,
  addImage,
  updateSize,
  updateTaskStatus,
  updateContent,
  updateParent,
  updateDeadline,
  updateSummary,
  updateImage,
  setFocusedElement,
}) => {
  const ref = useRef(null);
  const columnRef = useRef(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      BoardObjects.NOTE,
      SidebarObjects.NOTE,
      BoardObjects.TODO,
      SidebarObjects.TODO,
      BoardObjects.IMAGE,
      SidebarObjects.IMAGE,
    ],
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    drop: (item, monitor) => {
      switch (item.type) {
        case BoardObjects.NOTE:
        case BoardObjects.TODO:
        case BoardObjects.IMAGE:
          if (item.parent.id !== id) {
            if (monitor.isOver({ shallow: true })) {
              const newParent = {
                id: id,
                type: BoardObjects.COLUMN,
              };
              updateParent(item.id, -1, -1, newParent, false);
            }
          }
          console.log("Updated parent");
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
        case SidebarObjects.IMAGE:
          if (monitor.isOver({ shallow: true })) {
            const parent = {
              id: id,
              type: BoardObjects.COLUMN,
            };
            addImage(uuidv4(), 0, 0, parent);
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
    <ResizeObserver
      ref={ref}
      onResize={({ width, height }) => {
        updateSize(id, width, height);
      }}
    >
      <Card
        tabIndex={1}
        onFocus={() => setFocusedElement(id)}
        position="absolute"
        left={pX + "px"}
        top={pY + "px"}
        w={sX}
        direction={{ base: "column" }}
        pb="10px"
        alignItems="center"
        minW="300px"
        minH="120px"
        resize="horizontal"
        bg="gray.700"
        overflow="auto"
      >
        <CardHeader p={1.5}>
          <Editable
            as="h2"
            fontSize="lg"
            fontWeight="semibold"
            value={title}
            textAlign="center"
            isPreviewFocusable={false}
          >
            <CustomEditablePreview fontSize="larger" fontWeight="semibold" />
            <EditableInput
              onChange={(e) => updateContent(id, e.target.value)}
            ></EditableInput>
          </Editable>
        </CardHeader>
        <CardBody
          ref={columnRef}
          w="calc(100% - 18px)"
          alignItems="center"
          border="2px dashed"
          borderColor="gray.600"
          p={0}
          rounded="md"
        >
          <Stack direction="column" w="full">
            {children.map((b, index) => {
              switch (b.type) {
                case BoardObjects.NOTE:
                  return (
                    <Note
                      key={b.id}
                      id={b.id}
                      pX={b.pos.x}
                      pY={b.pos.y}
                      sX={b.size.x}
                      sY={b.size.y}
                      text={b.content}
                      parent={{ id: id, type: BoardObjects.COLUMN }}
                      updateSize={updateSize}
                      updateContent={updateContent}
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
                      parent={{ id: id, type: BoardObjects.COLUMN }}
                      deadline={b.deadline}
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
                      parent={{ id: id, type: BoardObjects.COLUMN }}
                      updateImage={updateImage}
                      updateContent={updateContent}
                      updateSize={updateSize}
                    />
                  );
                default:
              }
            })}
          </Stack>
        </CardBody>
      </Card>
    </ResizeObserver>
  );
};

export default Column;
