/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef } from "react";
import { useDrag, useDragDropManager } from "react-dnd";

import { BoardObjects } from "../enums/items";
import ResizeObserver from "rc-resize-observer";
import { Box, Editable } from "@chakra-ui/react";
import { AutoResizeEditableTextArea } from "./AutoResizeTextarea";
import CustomEditablePreview from "./CustomEditablePreview";
import { updateText, updateSize } from "../slices/noteSlice";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { wrap } from "framer-motion";

const Note = ({
  id,
  boardRef,
  pX,
  pY,
  sX,
  sY,
  text,
  parent,
  updateSize,
  updateText,
}) => {
  const dragRef = useRef(null);
  const wrapperRef = useRef(null);

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);

  // Drag hook
  const item = {
    id: id,
    type: BoardObjects.NOTE,
    parent: parent,
  };
  const { handleDragStart, handleDrag, handleDragEnd, animate } = useSmoothDrag(
    boardRef,
    dragRef,
    { x: pX, y: pY },
    true,
    item
  );

  animate();

  return (
    <ResizeObserver onResize={}>
      <Editable
        ref={dragRef}
        draggable={true}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        tabIndex={100}
        position={isInColumn ? "relative" : "absolute"}
        minW="75px"
        minH="100px"
        w={isInColumn ? "full" : sX + "px"}
        h={sY + "px"}
        bg="gray.800"
        border="1px solid"
        resize={isInColumn ? "vertical" : "both"}
        overflow="auto"
        borderColor="inherit"
        color={"white"}
        rounded="md"
        style={{
          minWidth: isInColumn ? "100%" : undefined,
        }}
        isPreviewFocusable={false}
        value={text}
        onChange={(value) => {
          updateText({ noteId: id, text: value });
        }}
      >
        <CustomEditablePreview
          color={"white"}
          tabIndex={-100}
          whiteSpace={"pre-wrap"}
          w="full"
          h={"full"}
          p={2}
        />
        <AutoResizeEditableTextArea
          p={2}
          m={0}
          mb={-2}
          minH={"full"}
          maxH={"full"}
          h={"full"}
          w="full"
        />
      </Editable>
    </ResizeObserver>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const note = state.notes[id];
  return {
    pX: note.pX,
    pY: note.pY,
    sX: note.sX,
    sY: note.sY,
    text: note.text,
    parent: note.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ updateText, updateSize }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Note);
