/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef } from "react";

import { BoardObjects } from "../utils/enums/items";
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
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
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
import { useClickAndHold } from "../utils/hooks/useClickAndHold";
import {
  ContextMenuContext,
  useContextMenu,
} from "../utils/hooks/useContextMenu";
import { useContext } from "react";
import { SelectedNodeContext } from "../App";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updateContent,
  updateSize,
} from "../utils/slices/nodeActions";
import { DocumentC } from "../utils/classes/classes";

const Note = ({
  id,
  scale,
  pX,
  pY,
  sX,
  sY,
  content,
  parent,
  openContextMenu,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  animate,
}) => {
  const dragRef = useRef(null);
  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);
  const dispatch = useDispatch();
  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);

  // Drag hook
  const item = {
    id: id,
    type: BoardObjects.NOTE,
    parent: parent,
  };

  if (!!animate) animate();

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
      dispatch(
        updateContent.action({
          id,
          type: BoardObjects.NOTE,
          content: editor.getHTML(),
        })
      );
    },
    editable: false, // set to false by default then enable on single click
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (event.button === 0) {
      if (!editor || !dragRef.current) {
        return;
      }

      if (!event.ctrlKey && !!selectedNode[id]) {
        editor.setEditable(true);
        editor.commands.focus();
        dragRef.current.draggable = false;
        dragRef.current.style.cursor = "text";
        return;
      }
      // else {
      //   handleSelectNode(event, {
      //     id, // new Id will be assigned
      //     type: BoardObjects.NOTE,
      //     pX, // need position in case user uses keyboard shortcut
      //     pY,
      //     sX,
      //     sY,
      //     content,
      //     parent,
      //   });
      //   return;
      // }
    }
  };
  useEffect(() => {
    const handleClickk = (e) => {
      handleSelectNode(e, {
        id, // new Id will be assigned
        type: BoardObjects.NOTE,
        pX, // need position in case user uses keyboard shortcut
        pY,
        sX,
        sY,
        ref: dragRef,
        content,
        parent,
      });
    };
    dragRef.current?.addEventListener("mousedown", handleClickk);
    return () => {
      dragRef.current?.removeEventListener("mousedown", handleClickk);
    };
  }, []);

  useEffect(() => {
    if (!selectedNode[id]) {
      editor?.setEditable(false);
      dragRef.current.draggable = true;
      dragRef.current.style.cursor = "grab";
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!editor) return;
    let { from, to } = editor.state.selection;
    editor.commands.setContent(content, false, {
      preserveWhitespace: "full",
    });
    editor.commands.setTextSelection({ from, to });
  }, [content, editor]);

  const handleHold = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const [mouseDownHandler, mouseUpHandler] = useClickAndHold(
    handleClick,
    handleHold
  );

  const deleteNote = () => {
    dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
    dispatch(removeNode.action({ id, type: BoardObjects.NOTE }));
  };

  const convertNote = () => {
    const { ...newDocument } = new DocumentC({
      id,
      pX,
      pY,
      title: `${editor?.getText().slice(0, 10)}...`,
      content,
      parent,
    });

    dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
    dispatch(removeNode.action({ id, type: BoardObjects.NOTE }));
    dispatch(addNode.action(newDocument));
    dispatch(
      addChild.action({
        id: parent.id,
        type: parent.type,
        cId: id,
        cType: BoardObjects.DOCUMENT,
      })
    );
  };

  const { setMenuItems, setMenuProps, copyNodes } =
    useContext(ContextMenuContext);

  const copyNote = () => {
    const note = {
      // new Id will be assigned
      type: BoardObjects.NOTE,
      pX, // need position in case user uses keyboard shortcut
      pY,
      sX,
      sY,
      content,
      parent, // parent is needed now in case the parent is also in the copied nodes
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
      return [<MenuItem onClick={convertNote}>Convert to document</MenuItem>];
    });
    setMenuProps(() => {
      return {
        canCopy: true,
        canCut: true,
        canDelete: true,
        delete: deleteNote,
      };
    });
  };

  return (
    <>
      <ResizeObserver
        onResize={({ width, height }) => {
          if (!editor?.isEditable) {
            dispatch(
              updateSize.action({
                id,
                type: BoardObjects.NOTE,
                sX: width / scale,
                sY: height / scale,
              })
            );
          }
        }}
      >
        <Box
          ref={dragRef}
          draggable={true}
          position={isInColumn ? "relative" : "absolute"}
          transform={
            isInColumn ? "translate(0px, 0px)" : `translate(${pX}px, ${pY}px)`
          }
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
          outline={!!selectedNode[id] ? "3px solid" : "1px solid"}
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
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Note);
