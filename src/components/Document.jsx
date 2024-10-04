/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent, useEditor } from "@tiptap/react";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import { updateContent, updateTitle } from "../utils/slices/nodeActions.ts";
import { Modal } from "./Modular/Modal";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { TbFileText } from "react-icons/tb";
import { MenuBar } from "./Modular/Editor.jsx";

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};

const Document = ({
  id,
  pX,
  pY,
  title,
  content,
  parent,
  columnWidth,
  onContextMenu,
  onDragStart,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const nodeRef = useRef();

  const selected = useSelector((state) => !!state.selection[id]);

  // Determines sizing and positioning based on whether in column or not
  let isInColumn = parent.type === BoardObjects.COLUMN;

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name] }),
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
          type: BoardObjects.DOCUMENT,
          content: editor.getHTML(),
        })
      );
    },
  });

  // Update text and maintain cursor position on re-render
  useEffect(() => {
    if (!editor) return;
    let { from, to } = editor.state.selection;
    editor.commands.setContent(content, false, {
      preserveWhitespace: "full",
    });
    editor.commands.setTextSelection({ from, to });
  }, [content, editor]);

  return (
    <>
      <NodeWrapper
        ref={nodeRef}
        id={id}
        type={BoardObjects.DOCUMENT}
        canPosition={true}
        canResize={false}
        pX={pX}
        pY={pY}
        parent={parent}
        isInColumn={isInColumn}
        columnWidth={columnWidth}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
      >
        <div className="icon-wrapper" onDoubleClick={() => setOpen(true)}>
          <TbFileText pointerEvents={"none"} />
        </div>
        <CustomEditablePreview
          as={"p"}
          canEdit={true}
          text={title}
          textStyle={previewStyle}
          onChange={(value) =>
            dispatch(
              updateTitle.action({
                id,
                type: BoardObjects.DOCUMENT,
                title: value,
              })
            )
          }
        />
      </NodeWrapper>
      <Modal
        open={open}
        setOpen={(boolean) => setOpen(boolean)}
        modalStyle={{ padding: "55px 0", boxSizing: "border-box" }}
      >
        <MenuBar editor={editor} />
        <EditorContent
          style={{
            height: "100%",
            padding: 0,
            margin: 0,
            border: "none",
            outline: "none",
          }}
          editor={editor}
        />
      </Modal>
    </>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const document = state.documents[id];
  return {
    pX: document.pX,
    pY: document.pY,
    title: document.title,
    content: document.content,
    parent: document.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Document);
