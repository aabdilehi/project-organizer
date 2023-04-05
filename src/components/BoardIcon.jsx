/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef } from "react";

import { BoardObjects } from "../enums/items";
import { Card, CardBody, Editable, useColorModeValue } from "@chakra-ui/react";
import { AutoResizeEditableInput } from "./AutoResizeTextarea";
import CustomEditablePreview from "./CustomEditablePreview";
import { updateTitle } from "../slices/boardSlice";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { StarIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const BoardIcon = ({
  id,
  boardId,
  boardRef,
  columnRef,
  offset,
  scale,
  pX,
  pY,
  parent,
  title,
  updateTitle,
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

  // Read parent prop and set isInColumn
  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
      console.log(isInColumn);
    }
  }, [parent]);

  return (
    <Card
      ref={dragRef}
      zIndex={2}
      p={isInColumn ? 1.5 : 0}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
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
        <StarIcon w={"100%"} h={"100%"} />
      </CardBody>
      <Editable
        flex={isInColumn ? 1 : undefined}
        onChange={(value) => updateTitle({ boardId: id, title: value })}
        m={0}
        mt={isInColumn ? undefined : 1.5}
        p={0}
        h={"30px"}
        width={isInColumn ? "auto" : "100px"}
        textAlign={"center"}
        wordBreak="break-word"
        placeholder="Board"
        isPreviewFocusable={false}
        value={title}
        color={useColorModeValue("black", "white")}
      >
        <CustomEditablePreview cursor={"text"} m={0} p={0} />
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ updateTitle }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardIcon);
