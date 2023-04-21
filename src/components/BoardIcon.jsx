/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef, useContext } from "react";

import { BoardObjects, SidebarObjects } from "../enums/items";
import {
  Card,
  CardBody,
  Editable,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  useColorModeValue,
} from "@chakra-ui/react";
import { AutoResizeEditableInput } from "./AutoResizeTextarea";
import CustomEditablePreview from "./CustomEditablePreview";
import {
  removeBoard,
  removeBoardChild,
  updateTitle,
} from "../slices/boardSlice";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { StarIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useBoardDrop } from "../hooks/useDrop";
import { removeNote } from "../slices/noteSlice";
import { removeDocument } from "../slices/docSlice";
import { removeTask } from "../slices/taskSlice";
import { removePicture } from "../slices/pictureSlice";
import { ContextMenuContext, useContextMenu } from "../hooks/useContextMenu";
import { removeColumn, removeColumnChild } from "../slices/columnSlice";

const BoardIcon = ({
  id,
  boardId,
  boardRef,
  columnRef,
  childRefs,
  offset,
  scale,
  pX,
  pY,
  parent,
  openContextMenu,
  title,
  updateTitle,
  removeBoard,
  removeBoardChild,
  removeColumnChild,
  removeColumn,
  removeNote,
  removeDocument,
  removeTask,
  removePicture,
}) => {
  const dragRef = useRef(null);
  const navigate = useNavigate();

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);

  //#region Drag hook
  const item = {
    id: id,
    type: BoardObjects.BOARD,
    parent: parent,
  };

  const { handleDragStart, handleDrag, handleDragEnd, animate } = useSmoothDrag(
    {
      boardId,
      boardRef,
      elementRef: dragRef,
      initialCoords: { x: pX, y: pY },
      shouldAnimate: true,
      shouldPosition: !isInColumn,
      item,
      offset,
      scale,
    }
  );

  animate();

  //#endregion

  //#region Drop behaviour
  const { drop, allowDrop } = useBoardDrop({
    accept: [
      BoardObjects.BOARD,
      BoardObjects.NOTE,
      BoardObjects.COLUMN,
      BoardObjects.TODO,
      BoardObjects.IMAGE,
      BoardObjects.DOCUMENT,
      SidebarObjects.NOTE,
      SidebarObjects.COLUMN,
      SidebarObjects.IMAGE,
      SidebarObjects.TODO,
      SidebarObjects.BOARD,
      SidebarObjects.DOCUMENT,
    ],
    boardId: id,
    boardRef: boardRef,
    position: { x: 0, y: 0 },
  });
  //#endregion
  // Read parent prop and set isInColumn
  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
      console.log(isInColumn);
    }
  }, [parent]);

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

  const columns = useSelector((state) => state.columns);
  const deleteColumn = (boardId, colId) => {
    const column = columns[colId];
    column.childRefs.forEach(({ childId, childType }) => {
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

  const deleteBoard = () => {
    childRefs.forEach(({ childId, childType }) => {
      switch (childType) {
        case BoardObjects.BOARD:
          deleteBoardChildren(childId);
          removeBoardChild({ boardId: id, childId });
          removeBoard({ boardId: childId });
          break;
        case BoardObjects.COLUMN:
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
    removeBoardChild({ boardId: boardId, childId: id });
    removeBoard({ boardId: id });
  };

  const { setMenuItems, copyNodes } = useContext(ContextMenuContext);

  const copyBoard = () => {
    const board = {
      // new Id will be assigned
      type: BoardObjects.BOARD,
      pX, // need position in case user uses keyboard shortcut
      pY,
      title,
      childRefs: [],
      // parent does not have to be the same
    };
    copyNodes([board]);
  };

  const cutBoard = () => {
    copyBoard();
    deleteBoard();
  };

  const updateContextMenu = () => {
    setMenuItems([
      <MenuItem onClick={cutBoard}>Cut</MenuItem>,
      <MenuItem onClick={copyBoard}>Copy</MenuItem>,
      <MenuItem onClick={deleteBoard}>Delete</MenuItem>,
    ]);
  };

  return (
    <Card
      ref={dragRef}
      zIndex={2}
      p={isInColumn ? 1.5 : 0}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDrop={(event) => drop(event)}
      onDragOver={(event) => {
        allowDrop(event);
      }}
      direction={isInColumn ? "row" : "column"}
      alignItems={"center"}
      bgColor={
        isInColumn ? useColorModeValue("gray.400", "gray.800") : "transparent"
      }
      outline={isInColumn ? "1px solid" : "none"}
      outlineColor={
        isInColumn
          ? useColorModeValue("blackAlpha.500", "whiteAlpha.300")
          : "none"
      }
      border={"none"}
      rounded={"sm"}
      variant={"filled"}
      w={isInColumn ? "full" : undefined}
      minW={isInColumn ? "100%" : undefined}
    >
      <CardBody
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateContextMenu();
          openContextMenu(e);
        }}
        flex={isInColumn ? 0.12 : undefined}
        cursor={"grab"}
        onDoubleClick={() => {
          navigate(`/${id}`);
        }}
        h={"65px"}
        w={"65px"}
        bg={
          isInColumn
            ? useColorModeValue("gray.300", "gray.700")
            : useColorModeValue("gray.400", "gray.800")
        }
        outline="1px solid"
        outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
        rounded={"md"}
      >
        <StarIcon pointerEvents={"none"} w={"100%"} h={"100%"} />
      </CardBody>
      <Editable
        flex={isInColumn ? 1 : undefined}
        onChange={(value) => updateTitle({ boardId: id, title: value })}
        m={0}
        mt={isInColumn ? undefined : 1.5}
        p={0}
        h={"full"}
        width={isInColumn ? "100%" : "100px"}
        textAlign={"center"}
        wordBreak="break-word"
        placeholder="Board"
        isPreviewFocusable={false}
        value={title}
        color={useColorModeValue("black", "white")}
      >
        <CustomEditablePreview cursor={"text"} w={"83%"} m={0} p={0} />
        <AutoResizeEditableInput
          maxW={isInColumn ? undefined : "100px"}
          w={"unset"}
          m={0}
          p={0}
          textAlign={"center"}
          required={true}
        />
      </Editable>
    </Card>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const board = state.boards[id];
  console.log(board);
  return {
    pX: board.pX,
    pY: board.pY,
    title: board.title,
    parent: board.parent,
    childRefs: board.childRefs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      updateTitle,
      removeBoard,
      removeBoardChild,
      removeColumn,
      removeColumnChild,
      removeNote,
      removeDocument,
      removeTask,
      removePicture,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardIcon);
