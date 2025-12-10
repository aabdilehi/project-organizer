"use strict";
import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { nanoid } from "@reduxjs/toolkit";
import { DragSignature } from "../../utils/enums/items";
const previewKey = nanoid();
const editKey = nanoid();

function CustomEditablePreview({
  canEdit = true,
  as: As = "p",
  text = "Default",
  textStyle,
  onChange,
  onImmediateChange,
  changeOnSubmit = true,
  adjustSelf = false,
  width,
  style,
}: {
  canEdit?: boolean;
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "h5";
  text?: string;
  textStyle?: React.CSSProperties;
  changeOnSubmit?: boolean;
  adjustSelf?: boolean;
  onChange?: (value: string) => void;
  onImmediateChange?: (args?: any) => any;
  width?: number;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text || "");

  const editRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);

  // Handling caret position
  const caretRange = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const saveCaretPosition = () => {
    if (!editRef.current) return;

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (!range) return;
    const rangeStart = range.cloneRange();
    rangeStart.selectNodeContents(editRef.current);
    rangeStart.setEnd(range.startContainer, range.startOffset);
    const start = rangeStart.toString().length;

    caretRange.current = {
      start,
      end: start + range.toString().length,
    };
    return;
  };
  const restoreCaretPosition = () => {
    if (!editRef.current) return;
    const range = document.createRange();
    const selection = window.getSelection();

    const textNode = editRef.current.firstChild;
    if (!textNode) range.setStart(editRef.current, 0);
    else {
      range.setStart(textNode, caretRange.current.start);
      range.setEnd(textNode, caretRange.current.end);
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
  };
  const setCaretPositionFromMouse = (event: PointerEvent) => {
    if(!editRef.current) return;

    let sel = window.getSelection();
      let range: Range;
      let textNode;
      let offset;

      if (document.caretPositionFromPoint) { // Modern browsers
        range = document.createRange();
        let position = document.caretPositionFromPoint(event.clientX, event.clientY);


        if(!position) range.setStart(editRef.current, 0);
        else {
          textNode = position.offsetNode;
          offset = position.offset;
          range.setStart(textNode, offset);
        }
        range.collapse(true);
      } 
      else if (document.caretRangeFromPoint) { // Fallback for older browsers
        range = document.caretRangeFromPoint(event.clientX, event.clientY)!;
        textNode = range?.startContainer;
        offset = range?.startOffset;
      }
      else { // Neither works, just return;
        return;
      }

      caretRange.current = {
        start: range.toString().length,
        end: range.toString().length,
      }

      sel?.removeAllRanges();
      sel?.addRange(range);
  }

  const submitChanges = () => {
    if (value !== text) {
      if (onChange) {
        onChange(value);
      }
    }
    if (editing) {
      setEditing(false);
    }
  };

  if (!canEdit && editing) {
    setEditing(false);
  }

  const edit = (event: PointerEvent) => {
    if (canEdit && !editing) {
      setCaretPositionFromMouse(event);
      setEditing(true);
    }
  };

  // UPDATE SIZE ON LOAD -> COPY HEIGHT OF PREVIEW TEXT
  useEffect(() => {
    if (editing) {
      restoreCaretPosition();
      editRef.current?.focus();
    } else {
      submitChanges();
    }
  }, [editing, text]);

  useEffect(() => {
    setValue(text);
  }, [text]);

  useEffect(() => {
    restoreCaretPosition();
  }, [value]);
  const handleInput = (e: InputEvent) => {
    if (!e.target) return;
    saveCaretPosition();
    setValue((e.target as HTMLElement).textContent);
    if (!!onChange && !changeOnSubmit) {
      onChange(value);
    }
    if (onImmediateChange) {
      onImmediateChange();
    }
  };

  return (
    <div className="editable" style={{ width, ...style }} >
      <As
        onClick={edit}
        id={previewKey}
        key={previewKey}
        ref={previewRef as any}
        style={{
          display: editing ? "none" : undefined,
          width: "100%",
          margin: "0",
          outline: "2px solid transparent",
          border: "none",
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          overflow: "auto",
          overflowWrap: "anywhere",
          boxSizing: "border-box",
          ...textStyle,
        }}
      >
        {value}
      </As>
      <As
        id={editKey}
        key={editKey}
        ref={editRef as any}
        rows={1}
        value={value}
        disabled={!editing}
        // onClick={setCaretPositionFromMouse}
        onInput={handleInput}
        onBlur={submitChanges}
        onKeyDown={(e) => {
          switch (e.key) {
            case "Enter":
              e.preventDefault();
              submitChanges();
              return;
            case "Escape":
              setValue(text);
              setEditing(false);
              return;
            default:
              return;
          }
        }}
        style={{
          display: editing ? undefined : "none",
          width: "100%",
          margin: "0",
          outline: "2px solid transparent",
          border: "none",
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          overflow: "auto",
          overflowWrap: "anywhere",
          boxSizing: "border-box",
          ...textStyle,
        }}
        contentEditable={editing}
      >
        {value}
      </As>
    </div>
  );
}

export default CustomEditablePreview;
//#endregion
