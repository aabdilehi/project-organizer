/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent, useEditor } from "@tiptap/react";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useNavigate } from "react-router-dom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import _ from "lodash";

class Debouncer {
  start;
  func;
  wait;
  maxWait;
  lastInvoked;
  timeout;

  constructor(func = (any) => {}, wait = 100, maxWait = -1) {
    this.func = func;
    this.wait = wait;
    this.maxWait = maxWait;
    const now = new Date();
    this.start = now;
    this.lastInvoked = now;
  }

  debounce(args) {
    const now = new Date();
    this.start = this.start;
    this.lastInvoked = this.lastInvoked;

    console.log(now.getTime() - this.start.getTime());
    while (true) {
      if (now.getTime() - this.lastInvoked.getTime() <= this.wait) {
        continue;
      } else {
        break;
      }
    }
    console.log("DOING IT");
    this.start = now;
    const argsArray = Array.isArray(args) ? args : [args];
    this.func(...argsArray);
    this.lastInvoked = now;
  }

  debounce2(args) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const argsArray = Array.isArray(args) ? args : [args];
      this.func(...argsArray);
    }, this.wait);
  }
}

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};

const Document = ({ id, columnWidth, onContextMenu }) => {
  const dispatch = useDispatch();
  const { pX, pY, title, content, parent } = useSelector(
    (state) => state.documents[id]
  );

  const uC = useMemo(
    () =>
      new Debouncer((editor) => {
        console.log("THIS IS WHERE IT DEBOUNCES THE STATE CHANGE");
        dispatch(
          updateContent.action({
            id,
            type: BoardObjects.DOCUMENT,
            content: editor.getHTML(),
          })
        );
      }, 1000),
    []
  );

  const uB = useMemo(
    () =>
      new Debouncer(() => {
        console.log("THIS IS WHERE IT UPDATES USING STATE");
        if (editor) {
          if (editor.getHTML() !== content) {
            let { from, to } = editor.state.selection;
            console.log(`From: ${from}\nTo: ${to}`);
            editor.commands.setContent(content, false, {
              preserveWhitespace: "full",
            });
            editor.commands.setTextSelection({ from, to });
          }
        }
      }, 1000),
    [content]
  );
  const selection = useRef(null);

  const [open, setOpen] = useState(false);
  const nodeRef = useRef();

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
      console.log("THIS IS WHERE IT DEBOUNCES THE STATE CHANGE");
      dispatch(
        updateContent.action({
          id,
          type: BoardObjects.DOCUMENT,
          content: editor.getHTML(),
        })
      );
    },
  });

  uB.debounce();

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
export default Document;
