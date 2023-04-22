/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef } from "react";

import { BoardObjects } from "../enums/items";
import ResizeObserver from "rc-resize-observer";
import "../editor.scss";
import {
  Box,
  Editable,
  ListItem,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { AutoResizeEditableTextArea } from "./AutoResizeTextarea";
import CustomEditablePreview from "./CustomEditablePreview";
import {
  updateContent,
  updateSize,
  updateNoteParent,
  removeNote,
} from "../slices/noteSlice";
import { addBoardChild, removeBoardChild } from "../slices/boardSlice";
import { addColumnChild, removeColumnChild } from "../slices/columnSlice";
import { addDocument } from "../slices/docSlice";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { wrap } from "framer-motion";
import Board from "./Board";
import { EditorContent, useEditor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useClickAndHold } from "../hooks/useClickAndHold";
import { ContextMenuContext, useContextMenu } from "../hooks/useContextMenu";
import { useContext } from "react";

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
  openContextMenu,
  updateContent,
  updateSize,
  removeNote,
  addDocument,
  addBoardChild,
  removeBoardChild,
  addColumnChild,
  removeColumnChild,
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
      updateContent({ noteId: id, content: editor.getHTML() });
    },
    editable: false, // set to false by default then enable on single click
  });

  const handleClick = (event) => {
    if (event.button === 0) {
      if (!editor || !dragRef.current) {
        return;
      }
      editor.setEditable(true);
      editor.commands.focus();
      dragRef.current.draggable = false;
      dragRef.current.style.cursor = "text";
    }
  };

  useEffect(() => {
    if (!editor) return;
    let { from, to } = editor.state.selection;
    editor.commands.setContent(content, false, {
      preserveWhitespace: "full",
    });
    editor.commands.setTextSelection({ from, to });
  }, [content, editor]);

  const handleHold = (event) => {
    event.stopPropagation();
  };

  const [mouseDownHandler, mouseUpHandler] = useClickAndHold(
    handleClick,
    handleHold
  );

  const deleteNote = () => {
    console.log("WHAT?");
    switch (parent.type) {
      case BoardObjects.BOARD:
        removeBoardChild({ boardId: parent.id, childId: id });
        removeNote({ noteId: id });
        break;
      case BoardObjects.COLUMN:
        removeColumnChild({ columnId: parent.id, childId: id });
        removeNote({ noteId: id });
        break;
      default:
        break;
    }
  };

  const convertNote = () => {
    console.log("HIII");
    const newDocument = {
      id: id,
      type: BoardObjects.DOCUMENT,
      pX,
      pY,
      title: `${editor?.getText().slice(0, 10)}...`,
      content,
      expanded: false,
      parent,
    };
    switch (parent.type) {
      case BoardObjects.BOARD:
        removeBoardChild({ boardId: parent.id, childId: id });
        removeNote({ noteId: id });
        addDocument(newDocument);
        addBoardChild({
          boardId: parent.id,
          childId: id,
          childType: BoardObjects.DOCUMENT,
        });
        break;
      case BoardObjects.COLUMN:
        removeColumnChild({ columnId: parent.id, childId: id });
        removeNote({ noteId: id });
        addDocument(newDocument);
        addColumnChild({
          columnId: parent.id,
          childId: id,
          childType: BoardObjects.DOCUMENT,
        });
        break;
      default:
        break;
    }
  };

  const { setMenuItems, copyNodes } = useContext(ContextMenuContext);

  const copyNote = () => {
    const note = {
      // new Id will be assigned
      type: BoardObjects.NOTE,
      pX, // need position in case user uses keyboard shortcut
      pY,
      sX,
      sY,
      content,
      // parent does not have to be the same
    };
    copyNodes([note]);
  };

  const cutNote = () => {
    copyNote();
    deleteNote();
  };

  const updateContextMenu = () => {
    setMenuItems(() => {
      // Add to theme instead of this hacky solution
      return [
        <MenuItem onClick={cutNote}>Cut</MenuItem>,
        <MenuItem onClick={copyNote}>Copy</MenuItem>,
        <MenuItem onClick={deleteNote}>Delete</MenuItem>,
        <MenuDivider />,
        <MenuItem onClick={convertNote}>Convert to document</MenuItem>,
      ];
    });
  };

  return (
    <>
      <ResizeObserver
        onResize={({ width, height }) => {
          if (!editor?.isEditable) {
            updateSize({ noteId: id, sX: width / scale, sY: height / scale });
          }
        }}
      >
        <Box
          ref={dragRef}
          draggable={true}
          onDragStart={handleDragStart}
          onDrag={(event) => {
            handleDrag(event);
          }}
          onDragEnd={handleDragEnd}
          onMouseDown={mouseDownHandler}
          onMouseUp={mouseUpHandler}
          onBlur={() => {
            editor?.setEditable(false);
            dragRef.current.draggable = true;
            dragRef.current.style.cursor = "grab";
          }}
          zIndex={2}
          h={editor?.isEditable ? "unset" : sY + "px"}
          w={isInColumn ? "full" : sX + "px"}
          minH={"75px"}
          maxH={"1000px"}
          minW={"75px"}
          maxW={"1000px"}
          bg={useColorModeValue("gray.400", "gray.800")}
          outline="1px solid"
          outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
          cursor={"grab"}
          resize={isInColumn ? "vertical" : "both"}
          overflow={editor?.isEditable ? "none" : "auto"}
          rounded={"sm"}
          textAlign={"left"}
          color={useColorModeValue("black", "white")}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateContextMenu();
            openContextMenu(e);
          }}
        >
          <EditorContent
            style={{
              padding: 0,
              margin: 0,
              width: "100%",
              height: "fit-content",
              overflow: "none",
              border: "none",
              pointerEvents: editor?.isEditable ? "unset" : "none",
            }}
            editor={editor}
          />
        </Box>
      </ResizeObserver>
    </>
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
    {
      updateContent,
      updateSize,
      updateNoteParent,
      removeNote,
      addDocument,
      addBoardChild,
      removeBoardChild,
      addColumnChild,
      removeColumnChild,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Note);
