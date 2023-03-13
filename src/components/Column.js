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
  EditablePreview,
} from "@chakra-ui/react";
import CustomEditablePreview from "./CustomEditablePreview";

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
  updateSize,
  updateTaskStatus,
  updateContent,
  updateParent,
  updateDeadline,
  updateSummary,
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
    <ResizeObserver
      ref={ref}
      onResize={({ width, height }) => {
        updateSize(id, width, height);
      }}
    >
      <Card
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
