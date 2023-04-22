/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef } from "react";

import { BoardObjects } from "../enums/items";
import ResizeObserver from "rc-resize-observer";
import { Box, Editable, ListItem, useColorModeValue } from "@chakra-ui/react";
import { AutoResizeEditableTextArea } from "./AutoResizeTextarea";
import CustomEditablePreview from "./CustomEditablePreview";
import {
  updateContent,
  updateSize,
  updateNoteParent,
} from "../slices/noteSlice";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { wrap } from "framer-motion";
import Board from "./Board";
import { useEditor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

const Note = ({
  id,
  boardId,
  boardRef,
  offset,
  scale,
  pX,
  pY,
  sX,
  sY,
  content,
  parent,
}) => {
  const dragRef = useRef(null);

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);

  // Drag hook
  const item = {
    id: id,
    type: BoardObjects.NOTE,
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

  // Read parent prop and set isInColumn
  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
      console.log(isInColumn);
    }
  }, [parent]);

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: undefined,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      updateContent({ documentId: id, content: editor.getHTML() });
    },
  });

  return (
    <ResizeObserver
      onResize={({ width, height }) =>
        updateSize({ noteId: id, sX: width / scale, sY: height / scale })
      }
    >
      <Editable
        ref={dragRef}
        draggable={true}
        onDragStart={handleDragStart}
        onDrag={(event) => {
          handleDrag(event);
        }}
        onDragEnd={handleDragEnd}
        minW="75px"
        minH="100px"
        maxW="1000px"
        maxH="1000px"
        zIndex={2}
        w={isInColumn ? "full" : sX + "px"}
        h={sY + "px"}
        bg={useColorModeValue("gray.400", "gray.800")}
        outline="1px solid"
        outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
        cursor={"grab"}
        resize={isInColumn ? "vertical" : "both"}
        overflow="auto"
        rounded={"sm"}
        textAlign={"left"}
        isPreviewFocusable={false}
        value={"temp value but should be content"}
        onChange={(value) => {
          //updateText({ noteId: id, text: value });
        }}
        color={useColorModeValue("black", "white")}
      >
        <CustomEditablePreview
          color={useColorModeValue("black", "white")}
          tabIndex={-100}
          whiteSpace={"pre-wrap"}
          w="full"
          h={"full"}
          p={2.5}
        />
        <AutoResizeEditableTextArea
          p={2.5}
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
    content: note.content,
    parent: note.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { updateContent, updateSize, updateNoteParent },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Note);
