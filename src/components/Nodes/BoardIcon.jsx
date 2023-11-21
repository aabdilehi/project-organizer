/** @jsxImportSource @emotion/react */

import "../../App.css";
import { useState, useEffect } from "react";

import { BoardObjects, SidebarObjects } from "../../utils/enums/items";
import { CardBody, Editable, useColorModeValue } from "@chakra-ui/react";
import { AutoResizeEditableInput } from "../Other/AutoResizeTextarea";
import CustomEditablePreview from "../Other/CustomEditablePreview";
// import {
//   removeBoard,
//   removeBoardChild,
//   updateTitle,
// } from "../utils/slices/boardSlice";
import { bindActionCreators } from "redux";
import { connect, useDispatch } from "react-redux";
import { StarIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useBoardDrop } from "../../utils/hooks/useDrop";
import { updateTitle } from "../../utils/slices/nodeActions";
import NodeWrapper from "./NodeWrapper";

const BoardIcon = ({
  id,
  boardRef,
  pX,
  pY,
  parentId,
  parentType,
  openContextMenu,
  title,
  animate,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);
  useEffect(() => {
    if (parentType !== undefined) {
      setIsInColumn(parentType === BoardObjects.COLUMN);
    }
  }, [parentId, parentType]);

  return (
    <NodeWrapper
      nodeId={id}
      nodeType={BoardObjects.BOARD}
      canPosition={true}
      animate={animate}
      canResize={false}
      pX={pX}
      pY={pY}
      parentId={parentId}
      parentType={parentType}
      onDragOver={allowDrop}
      onDrop={drop}
      openContextMenu={openContextMenu}
      isInColumn={isInColumn}
      clickCallback={() => {}}
      holdCallback={() => {}}
      style={{
        background: "none",
        outline: "none",
        zIndex: "2",
        padding: isInColumn ? 1.5 : 0,
        alignItems: "center",
        width: isInColumn ? "full" : undefined,
        minWidth: isInColumn ? "100%" : undefined,
      }}
      direction={isInColumn ? "row" : "column"}
      position={isInColumn ? "relative" : "absolute"}
      transform={
        isInColumn ? "translate(0px, 0px)" : `translate(${pX}px, ${pY}px)`
      }
      rounded={"sm"}
      variant={"filled"}
      menuProps={{
        canCopy: true,
        canCut: true,
        canDelete: true,
      }}
      menuItems={[]}
    >
      <CardBody
        draggable
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
    </NodeWrapper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const board = state.boards[id];
  return {
    pX: board.pX,
    pY: board.pY,
    title: board.title,
    childRefs: board.childRefs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardIcon);
