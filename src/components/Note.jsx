/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef, useMemo } from "react";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { ListItem, MenuItem } from "@chakra-ui/react";
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
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updateContent,
} from "../utils/slices/nodeActions";
import { DocumentC } from "../utils/classes/classes";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";

const Note = ({
  id,
  pX,
  pY,
  sX,
  sY,
  columnWidth,
  content,
  parent,
  onContextMenu,
}) => {
  const dispatch = useDispatch();
  const selected = useSelector((state) => !!state.selection[id]);
  const dragging = useSelector((state) => !!state.drag[id]);
  const nodeRef = useRef();

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
    editable: false,
    onBlur: ({ editor }) => {
      editor.setEditable(false);
    },
    onUpdate: ({ editor }) => {
      dispatch(
        updateContent.action({
          id,
          type: BoardObjects.NOTE,
          content: editor.getHTML(),
        })
      );

      let { from, to } = editor.state.selection;
      editor.commands.setTextSelection({ from, to });
    },
  });

  const handleClick = (event) => {
    console.log("NOTE");
    if (event.button === 0) {
      if (!editor) {
        return;
      }

      // Set to edit mode
      if (!event.ctrlKey && !event.shiftKey && selected) {
        editor.setEditable(true);
        editor.commands.focus();
        return;
      }
    }
  };

  // Determines sizing and positioning based on whether in column or not
  let isInColumn = parent.type === BoardObjects.COLUMN;

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

  return (
    <NodeWrapper
      ref={nodeRef}
      id={id}
      type={"note"}
      canPosition={!editor?.isEditable}
      canResize={true}
      pX={pX}
      pY={pY}
      sX={sX}
      sY={sY}
      parent={parent}
      className={`${editor?.isEditable ? " editing" : ""}`}
      isInColumn={isInColumn}
      columnWidth={columnWidth}
      onContextMenu={onContextMenu}
    >
      <EditorContent
        draggable={false}
        style={{
          padding: 0,
          margin: 0,
          width: "100%",
          height: "fit-content",
          minHeight: sY + "px",
          overflow: "none",
          border: "none",
        }}
        editor={editor}
        onMouseUp={(e) => e.preventDefault()}
        onClick={handleClick}
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
