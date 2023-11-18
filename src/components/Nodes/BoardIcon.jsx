/** @jsxImportSource @emotion/react */

import "../../App.css";
import { useState, useEffect, useRef, useContext } from "react";

import { BoardObjects, SidebarObjects } from "../../utils/enums/items";
import {
  Card,
  CardBody,
  Editable,
  MenuItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { AutoResizeEditableInput } from "../Other/AutoResizeTextarea";
import CustomEditablePreview from "../Other/CustomEditablePreview";
// import {
//   removeBoard,
//   removeBoardChild,
//   updateTitle,
// } from "../utils/slices/boardSlice";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { StarIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useBoardDrop } from "../../utils/hooks/useDrop";
import { ContextMenuContext } from "../../utils/hooks/useContextMenu";
import { SelectedNodeContext } from "../../App";
import {
  removeChild,
  removeNode,
  updateTitle,
} from "../../utils/slices/nodeActions";

const BoardIcon = ({
  id,
  boardRef,
  pX,
  pY,
  parent,
  openContextMenu,
  title,
  childRefs,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  animate,
}) => {
  const dragRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);

  //#region Drag hook
  const item = {
    id: id,
    type: BoardObjects.BOARD,
    parent: parent,
  };

  if (!!animate) animate();

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
    }
  }, [parent]);

  const boards = useSelector((state) => state.boards);
  const deleteBoardChildren = (id) => {
    const board = boards[id];
    board?.childRefs.forEach(({ childId, childType }) => {
      switch (childType) {
        case BoardObjects.BOARD:
          deleteBoardChildren(childId);
          dispatch(
            removeChild.action({ id, type: BoardObjects.BOARD, cId: childId })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
          break;
        case BoardObjects.COLUMN:
        case BoardObjects.NOTE:
        case BoardObjects.DOCUMENT:
        case BoardObjects.TODO:
        case BoardObjects.IMAGE:
          dispatch(
            removeChild.action({ id, type: BoardObjects.BOARD, cId: childId })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
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
          dispatch(
            removeChild.action({
              id: colId,
              type: BoardObjects.COLUMN,
              cId: childId,
            })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
          break;
        case BoardObjects.NOTE:
        case BoardObjects.DOCUMENT:
        case BoardObjects.TODO:
        case BoardObjects.IMAGE:
          dispatch(
            removeChild.action({
              id: colId,
              type: BoardObjects.COLUMN,
              cId: childId,
            })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
          break;
        default:
          break;
      }
    });

    dispatch(
      removeChild.action({ id: boardId, type: BoardObjects.BOARD, cId: colId })
    );
    dispatch(removeNode.action({ id: colId, type: BoardObjects.COLUMN }));
  };

  const deleteBoard = () => {
    // childRefs.forEach(({ childId, childType }) => {
    //   switch (childType) {
    //     case BoardObjects.BOARD:
    //       deleteBoardChildren(childId);
    //       removeBoardChild({ boardId: id, childId });
    //       removeBoard({ boardId: childId });
    //       break;
    //     case BoardObjects.COLUMN:
    //       deleteColumn(id, childId);
    //       break;
    //     case BoardObjects.NOTE:
    //       removeBoardChild({ boardId: id, childId });
    //       removeNote({ noteId: childId });
    //       break;
    //     case BoardObjects.DOCUMENT:
    //       removeBoardChild({ boardId: id, childId });
    //       removeDocument({ documentId: childId });
    //       break;
    //     case BoardObjects.TODO:
    //       removeBoardChild({ boardId: id, childId });
    //       removeTask({ taskId: childId });
    //       break;
    //     case BoardObjects.IMAGE:
    //       removeBoardChild({ boardId: id, childId });
    //       removePicture({ pictureId: childId });
    //       break;
    //     default:
    //       break;
    //   }
    // });
    // removeBoardChild({ boardId: boardId, childId: id });
    // removeBoard({ boardId: id });
  };

  const { setMenuItems, setMenuProps, copyNodes } =
    useContext(ContextMenuContext);

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
    setMenuProps({
      canCopy: true,
      canCut: true,
      canDelete: true,
      delete: deleteBoard,
    });
  };
  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  return (
    <Card
      ref={dragRef}
      position={isInColumn ? "relative" : "absolute"}
      transform={
        isInColumn ? "translate(0px, 0px)" : `translate(${pX}px, ${pY}px)`
      }
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
      onMouseDown={(e) => {
        e.stopPropagation();
        handleSelectNode(e, {
          id, // new Id will be assigned
          type: BoardObjects.BOARD,
          pX, // need position in case user uses keyboard shortcut
          pY,
          ref: dragRef,
          title,
          childRefs,
          parent,
          // parent does not have to be the same
        });
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
        outline={!!selectedNode[id] ? "3px solid" : "1px solid"}
        outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
        rounded={"md"}
      >
        <StarIcon pointerEvents={"none"} w={"100%"} h={"100%"} />
      </CardBody>
      <Editable
        flex={isInColumn ? 1 : undefined}
        onChange={(value) =>
          dispatch(
            updateTitle.action({ id, type: BoardObjects.BOARD, title: value })
          )
        }
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
  return {
    pX: board.pX,
    pY: board.pY,
    title: board.title,
    parent: board.parent,
    childRefs: board.childRefs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardIcon);
