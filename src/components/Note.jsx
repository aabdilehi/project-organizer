/** @jsxImportSource @emotion/react */
import "../App.css";
import { useRef } from "react";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { ListItem } from "@chakra-ui/react";
import { connect } from "react-redux";
import { EditorContent, useEditor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { updateContent } from "../utils/slices/nodeActions";
import NodeWrapper from "./Modular/NodeWrapper.tsx";

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
  ...props
}) => {
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
      props.updateContent(editor);
      let { from, to } = editor.state.selection;
      editor.commands.setTextSelection({ from, to });
    },
  });

  const handleClick = (event) => {
    if (event.button === 0) {
      if (!editor) {
        return;
      }

      console.log("EDIT");
      // Set to edit mode
      if (!event.ctrlKey && !event.shiftKey && props.selected) {
        editor.setEditable(true);
        editor.commands.focus();
        return;
      }
    }
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
      isInColumn={props.isInColumn}
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
    sX: note.sX ?? 200,
    sY: note.sY,
    content: note.content,
    parent: note.parent,
    selected: state.selection.hasOwnProperty(id),
    // SET TRANSFORM ORIGIN OF BOARD TO MOUSE POSITION
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateContent: (editor) => {
      dispatch(
        updateContent.action({
          id: ownProps.id,
          type: BoardObjects.NOTE,
          content: editor.getHTML(),
        })
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Note);
