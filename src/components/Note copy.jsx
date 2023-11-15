/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent, useEditor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
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
import NodeWrapper from "./NodeWrapper";

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
}) => {
  const selectedNodes = useSelector((state) => state.selection);
  const dispatch = useDispatch();

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
      if (!editor) {
        return;
      }

      // Set to edit mode
      if (!event.ctrlKey && !!selectedNodes[id]) {
        editor.setEditable(true);
        editor.commands.focus();
        return;
      }
    }
  };

  useEffect(() => {
    if (!selectedNodes[id]) {
      editor?.setEditable(false);
    }
  }, [selectedNodes]);

  // Update text and maintain cursor position on re-render
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

  // Determines sizing and positioning based on whether in column or not
  const [isInColumn, setIsInColumn] = useState(false);
  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
    }
  }, [parent]);

  return (
    <NodeWrapper
      nodeId={id}
      nodeType={BoardObjects.NOTE}
      canPosition={!editor?.isEditable}
      canResize={true}
      pX={pX}
      pY={pY}
      openContextMenu={openContextMenu}
      isInColumn={isInColumn}
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
      clickCallback={handleClick}
      holdCallback={handleHold}
      onBlur={() => {
        editor?.setEditable(false);
      }}
      zIndex={2}
      h={editor?.isEditable ? "unset" : sY + "px"}
      w={isInColumn ? "full" : sX + "px"}
      minH={"75px"}
      maxH={"1000px"}
      minW={"75px"}
      maxW={"1000px"}
      cursor={"grab"}
      resize={isInColumn ? "vertical" : "both"}
      overflow={editor?.isEditable ? "none" : "auto"}
      rounded={"sm"}
      textAlign={"left"}
      menuProps={{
        canCopy: true,
        canCut: true,
        canDelete: true,
        delete: deleteNote,
      }}
      menuItems={[
        <MenuItem onClick={convertNote}>Convert to document</MenuItem>,
      ]}
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
    </NodeWrapper>
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
