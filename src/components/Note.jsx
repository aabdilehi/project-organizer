/** @jsxImportSource @emotion/react */
import "../App.css";
import { useRef } from "react";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
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
import { updateContent } from "../utils/slices/nodeActions";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { debounce } from "lodash";
import { listItem } from "@tiptap/pm/schema-list";
import FloatingMenu from "./Modular/FloatingMenu.tsx";
import { MenuBar } from "./Modular/Editor.jsx";

const updateNoteContent = (dispatch, id, editor) => {
  dispatch(
    updateContent.action({
      id,
      type: BoardObjects.NOTE,
      content: editor.getHTML(),
    })
  );
  let { from, to } = editor.state.selection;
  editor.commands.setTextSelection({ from, to });
};

const debouncedUpdate = debounce(updateNoteContent, 250, { maxWait: 1000 });

const Note = ({ id, onContextMenu, offset, scale, ...props }) => {
  const nodeRef = useRef();

  const note = useSelector((state) => state.notes[id]);

  if (!note) return;
  const { pX, pY, sX, sY, content, parent } = note;

  const selected = useSelector((state) => state.selection.hasOwnProperty(id));
  const dispatch = useDispatch();

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, listItem.name] }),
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
    onUpdate: ({ editor }) => debouncedUpdate(dispatch, id, editor),
  });

  const handleClick = (event) => {
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

  return (
    <NodeWrapper
      ref={nodeRef}
      id={id}
      type={"note"}
      canPosition={!editor?.isEditable}
      canResize={true}
      pX={pX}
      pY={pY}
      sX={sX ?? 200}
      sY={sY}
      parentId={parent.id}
      parentType={parent.type}
      scale={scale}
      offset={offset}
      className={`${editor?.isEditable ? " editing" : ""}`}
      onContextMenu={onContextMenu}
    >
      <EditorContent
        draggable={false}
        style={{
          padding: 0,
          margin: 0,
          width: "100%",
          height: "100%",
          minHeight: sY + "px",
          overflow: "auto",
          border: "none",
        }}
        onWheel={(e) => {
          if(!e.ctrlKey) e.stopPropagation();
        }}
        editor={editor}
        // onMouseUp={(e) => e.preventDefault()}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key == "Escape") editor.setEditable(false);
        }}
      />
      {/* <FloatingMenu
        className="context-menu"
        open={editor?.isEditable}
        setOpen={() => {}}
        style={{
          position: "relative",
          transform: "translate(0%, calc(-100% + -5px))",         
          top: "-100%" 
        }}
      ><MenuBar editor={editor} /></FloatingMenu> */}
    </NodeWrapper>
  );
};

export default Note;
