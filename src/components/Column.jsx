/** @jsxImportSource @emotion/react */
import { useContext, useRef } from "react";
import { BoardObjects, SidebarObjects } from "../enums/items";
import { v4 as uuidv4 } from "uuid";
import ResizeObserver from "rc-resize-observer";
import { addNote, updateNoteParent, removeNote } from "../slices/noteSlice";
import {
  updateColumnTitle,
  addColumnChild,
  removeColumnChild,
  updateColumnSize,
  removeColumn,
} from "../slices/columnSlice";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";

import Note from "./Note";
import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  Editable,
  EditableInput,
  useColorModeValue,
  Portal,
  MenuList,
  MenuItem,
  Menu,
} from "@chakra-ui/react";
import CustomEditablePreview from "./CustomEditablePreview";
import { removeBoard, removeBoardChild } from "../slices/boardSlice";
import {
  addPicture,
  removePicture,
  updatePictureParent,
} from "../slices/pictureSlice";
import { addTask, removeTask, updateTaskParent } from "../slices/taskSlice";
import Picture from "./Picture";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { useColumnDrop } from "../hooks/useDrop";
import ToDo from "./ToDo";
import BoardIcon from "./BoardIcon";
import { AutoResizeEditableInput } from "./AutoResizeTextarea";
import Document from "./Document";
import { ContextMenuContext, useContextMenu } from "../hooks/useContextMenu";
import { addBoard } from "../slices/boardSlice";
import { addDocument, removeDocument } from "../slices/docSlice";

const Column = ({
  id,
  boardId,
  boardRef,
  pX,
  pY,
  offset,
  scale,
  sX,
  sY,
  title,
  childRefs,
  parent,
  openContextMenu,
  updateColumnTitle,
  updateColumnSize,
  removeColumn,
  addColumnChild,
  removeBoardChild,
  removeColumnChild,
  addNote,
  removeNote,
  addDocument,
  removeDocument,
  addPicture,
  removePicture,
  addTask,
  removeTask,
  addBoard,
  removeBoard,
}) => {
  const dragRef = useRef(null);
  const columnRef = useRef(null);

  //#region Drag behaviour

  const item = {
    id,
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
    columnId: id,
    boardRef,
    position: offset,
    scale,
  });

  //#endregion

  //#region Context Menu
  const boards = useSelector((state) => state.boards);
  const deleteBoardChildren = (id) => {
    const board = boards[id];
    board?.childRefs.forEach(({ childId, childType }) => {
      switch (childType) {
        case BoardObjects.BOARD:
          deleteBoardChildren(childId);
          removeBoardChild({ boardId: id, childId });
          removeBoard({ boardId: childId });
          break;
        case BoardObjects.COLUMN:
          removeBoardChild({ boardId: id, childId });
          deleteColumn(id, childId);
          break;
        case BoardObjects.NOTE:
          removeBoardChild({ boardId: id, childId });
          removeNote({ noteId: childId });
          break;
        case BoardObjects.DOCUMENT:
          removeBoardChild({ boardId: id, childId });
          removeDocument({ documentId: childId });
          break;
        case BoardObjects.TODO:
          removeBoardChild({ boardId: id, childId });
          removeTask({ taskId: childId });
          break;
        case BoardObjects.IMAGE:
          removeBoardChild({ boardId: id, childId });
          removePicture({ pictureId: childId });
          break;
        default:
          break;
      }
    });
  };

  const deleteColumn = (boardId, colId) => {
    childRefs.forEach(({ childId, childType }) => {
      switch (childType) {
        case BoardObjects.BOARD:
          deleteBoardChildren(childId);
          removeColumnChild({ columnId: colId, childId });
          removeBoard({ boardId: childId });
          break;
        case BoardObjects.NOTE:
          removeColumnChild({ columnId: colId, childId });
          removeNote({ noteId: childId });
          break;
        case BoardObjects.DOCUMENT:
          removeColumnChild({ columnId: colId, childId });
          removeDocument({ documentId: childId });
          break;
        case BoardObjects.TODO:
          removeColumnChild({ columnId: colId, childId });
          removeTask({ taskId: childId });
          break;
        case BoardObjects.IMAGE:
          removeColumnChild({ columnId: colId, childId });
          removePicture({ pictureId: childId });
          break;
        default:
          break;
      }
    });
    removeBoardChild({ boardId, childId: colId });
    removeColumn({ columnId: colId });
  };

  const { setMenuItems, copiedNodes, copyNodes } =
    useContext(ContextMenuContext);

  const copyColumn = () => {
    const column = {
      // new Id will be assigned
      type: BoardObjects.COLUMN,
      pX, // need position in case user uses keyboard shortcut
      pY,
      sX,
      sY,
      title,
      // parent does not have to be the same
    };
    copyNodes([column]);
  };

  const cutColumn = () => {
    copyColumn();
    deleteColumn(boardId, id);
  };

  const pasteNodes = () => {
    copiedNodes.forEach((node) => {
      switch (node.type) {
        case BoardObjects.NOTE:
          const copiedNote = {
            ...node,
            id: uuidv4(),
            pX: 0,
            pY: 0,
            parent: { id: id, type: BoardObjects.COLUMN },
          };
          addNote(copiedNote);
          addColumnChild({
            columnId: id,
            childId: copiedNote.id,
            childType: copiedNote.type,
          });
          break;
        case BoardObjects.DOCUMENT:
          const copiedDocument = {
            ...node,
            id: uuidv4(),
            pX: 0,
            pY: 0,
            parent: { id: id, type: BoardObjects.COLUMN },
          };
          addDocument(copiedDocument);
          addColumnChild({
            columnId: id,
            childId: copiedDocument.id,
            childType: copiedDocument.type,
          });
          break;
        case BoardObjects.IMAGE:
          const newPicture = {
            ...node,
            id: uuidv4(),
            pX: 0,
            pY: 0,
            parent: { id: id, type: BoardObjects.COLUMN },
          };
          addPicture(newPicture);
          addColumnChild({
            columnId: id,
            childId: newPicture.id,
            childType: newPicture.type,
          });
          break;
        case BoardObjects.TODO:
          const copiedTask = {
            ...node,
            id: uuidv4(),
            pX: 0,
            pY: 0,
            parent: { id: id, type: BoardObjects.COLUMN },
          };
          addTask(copiedTask);
          addColumnChild({
            columnId: id,
            childId: copiedTask.id,
            childType: copiedTask.type,
          });
          break;
        case BoardObjects.BOARD:
          const copiedBoard = {
            ...node,
            id: uuidv4(),
            pX: 0,
            pY: 0,
            parent: { id: id, type: BoardObjects.COLUMN },
            childRefs: [],
          };
          addBoard(copiedBoard);
          addColumnChild({
            columnId: id,
            childId: copiedBoard.id,
            childType: copiedBoard.type,
          });
          break;
        default:
          break;
      }
    });
  };

  const updateContextMenu = () => {
    setMenuItems([
      <MenuItem onClick={pasteNodes}>Paste</MenuItem>,
      <MenuItem onClick={cutColumn}>Cut</MenuItem>,
      <MenuItem onClick={copyColumn}>Copy</MenuItem>,
      <MenuItem onClick={() => deleteColumn(boardId, id)}>Delete</MenuItem>,
    ]);
  };

  //#endregion

  return (
    <ResizeObserver
      onResize={({ width, height }) => {
        updateColumnSize({ columnId: id, sX: width, sY: height });
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
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateContextMenu();
          openContextMenu(e);
        }}
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
                updateColumnTitle({ columnId: id, title: e.target.value })
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
                      openContextMenu={openContextMenu}
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
                      openContextMenu={openContextMenu}
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
                      openContextMenu={openContextMenu}
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
                      openContextMenu={openContextMenu}
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
                      openContextMenu={openContextMenu}
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
  const { id } = ownProps;
  const column = state.columns[id];
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
      removeNote,
      updateNoteParent,
      updateColumnTitle,
      updateColumnSize,
      removeColumn,
      addColumnChild,
      removeBoardChild,
      removeColumnChild,
      addPicture,
      updatePictureParent,
      removePicture,
      addTask,
      removeTask,
      updateTaskParent,
      addDocument,
      addBoard,
      removeDocument,
      removeBoard,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Column);
