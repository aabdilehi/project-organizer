/** @jsxImportSource @emotion/react */
import { useRef } from "react";
import { BoardObjects, SidebarObjects } from "../enums/items";
import ResizeObserver from "rc-resize-observer";
import { addNote, updateNoteParent } from "../slices/noteSlice";
import {
  updateColumnTitle,
  addColumnChild,
  removeColumnChild,
  updateColumnSize,
} from "../slices/columnSlice";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import Note from "./Note";
import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  Editable,
  EditableInput,
  useColorModeValue,
} from "@chakra-ui/react";
import CustomEditablePreview from "./CustomEditablePreview";
import { removeBoardChild } from "../slices/boardSlice";
import { addPicture, updatePictureParent } from "../slices/pictureSlice";
import { addTask, updateTaskParent } from "../slices/taskSlice";
import Picture from "./Picture";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { useColumnDrop } from "../hooks/useDrop";
import ToDo from "./ToDo";
import BoardIcon from "./BoardIcon";
import { AutoResizeEditableInput } from "./AutoResizeTextarea";
import Document from "./Document";

const Column = ({
  boardId,
  columnId,
  boardRef,
  pX,
  pY,
  offset,
  scale,
  sX,
  title,
  childRefs,
  parent,
  updateColumnTitle,
  updateColumnSize,
}) => {
  const dragRef = useRef(null);
  const columnRef = useRef(null);

  //#region Drag behaviour

  const item = {
    id: columnId,
    type: BoardObjects.COLUMN,
    parent: parent,
  };

  const { handleDragStart, handleDrag, handleDragEnd, animate } = useSmoothDrag(
    {
      boardId,
      boardRef,
      elementRef: dragRef,
      initialCoords: { x: pX, y: pY },
      shouldAnimate: true,
      shouldPosition: true,
      item,
      offset,
      scale,
    }
  );

  animate();

  //#endregion

  //#region Drop behaviour

  const { drop, allowDrop } = useColumnDrop({
    accept: [
      BoardObjects.NOTE,
      BoardObjects.TODO,
      BoardObjects.IMAGE,
      BoardObjects.BOARD,
      BoardObjects.DOCUMENT,
      SidebarObjects.NOTE,
      SidebarObjects.IMAGE,
      SidebarObjects.TODO,
      SidebarObjects.BOARD,
      SidebarObjects.DOCUMENT,
    ],
    boardId,
    columnId,
    boardRef,
    position: offset,
    scale,
  });

  //#endregion

  return (
    <ResizeObserver
      onResize={({ width, height }) => {
        updateColumnSize({ columnId, sX: width, sY: height });
      }}
    >
      <Card
        ref={dragRef}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDragOver={allowDrop}
        onDrop={drop}
        zIndex={1}
        w={sX + "px"}
        direction={{ base: "column" }}
        alignItems="center"
        color={"white"}
        p={1}
        minW="300px"
        maxW="1000px"
        minH="120px"
        resize="horizontal"
        overflow="hidden"
        rounded={"sm"}
        bgColor={useColorModeValue("gray.300", "gray.700")}
        outline="1px solid"
        outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
        cursor={"grab"}
      >
        <CardHeader p={1.5}>
          <Editable
            as="h2"
            fontSize="larger"
            fontWeight="800"
            color={useColorModeValue("black", "white")}
            value={title}
            textAlign="center"
            isPreviewFocusable={false}
          >
            <CustomEditablePreview
              color={useColorModeValue("black", "white")}
              fontSize="larger"
              fontWeight="800"
            />
            <AutoResizeEditableInput
              fontSize="larger"
              overflow={"hidden"}
              onChange={(e) =>
                updateColumnTitle({ columnId, title: e.target.value })
              }
            />
          </Editable>
        </CardHeader>
        <CardBody
          ref={columnRef}
          w="calc(100%)"
          alignItems="center"
          border="2px dashed"
          borderColor="gray.600"
          p={0}
          rounded="md"
        >
          <Stack direction="column" w="full">
            {childRefs.map(({ childId, childType }) => {
              switch (childType) {
                case BoardObjects.NOTE:
                  return (
                    <Note
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      columnRef={dragRef}
                      offset={offset}
                      scale={scale}
                    />
                  );
                case BoardObjects.IMAGE:
                  return (
                    <Picture
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                    />
                  );
                case BoardObjects.TODO:
                  return (
                    <ToDo
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                    />
                  );
                case BoardObjects.BOARD:
                  return (
                    <BoardIcon
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                    />
                  );
                case BoardObjects.DOCUMENT:
                  return (
                    <Document
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                    />
                  );
                default:
                  break;
              }
            })}
          </Stack>
        </CardBody>
      </Card>
    </ResizeObserver>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { columnId } = ownProps;
  const column = state.columns[columnId];
  return {
    title: column.title,
    childRefs: column.childRefs,
    pX: column.pX,
    pY: column.pY,
    sX: column.sX,
    sY: column.sY,
    parent: column.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      addNote,
      updateColumnTitle,
      updateColumnSize,
      addColumnChild,
      removeBoardChild,
      removeColumnChild,
      updateNoteParent,
      updatePictureParent,
      addPicture,
      addTask,
      updateTaskParent,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Column);
