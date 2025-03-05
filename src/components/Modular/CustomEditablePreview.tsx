"use strict";
import React, {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { v4 as uuidv4 } from "uuid";

// function CustomEditablePreview({canEdit = true, as: As = 'p', text = "Default", textStyle, onChange, ...props} : {canEdit?: boolean, as?: React.ElementType, text?: string, textStyle?: React.CSSProperties, onChange?: (value: string) => void}) {
//    const [editing, setEditing] = useState(false);
//    const [value, setValue] = useState(text);
//    const textRef = useRef();

//    if(editing) {
//     console.log("AAAA");

//     const checkTarget = (e) => {
//         if(textRef.current && (textRef.current !== e.target || !textRef.current.contains(e.target)) && editing) {
//             setEditing(false);
//         }
//     }
//     window.addEventListener("click", checkTarget);
//    }

//    if(!canEdit) {
//     setEditing(false);
//    }

//    const edit = () => {
//     if(canEdit && !editing) {
//         setEditing(true);
//     }
//    }

//    if(textRef.current) {
//     const caretPos = textRef.current.selectionStart;
//     const sel = document.getSelection();
//     const currentRange = sel?.getRangeAt(0);

//    textRef.current.textContent = "value";

//    if(currentRange) {
//     sel?.removeAllRanges();
//     sel?.addRange(currentRange);}

//  }

//    const handleChange = (e) => {
//     if(value !== e.target.textContent) {setValue(e.target.textContent);}
//     if(!!onChange) {
//         onChange(value);
//     }
//    }

//    return (<span ref={textRef} onInput={handleChange} onPaste={handleChange} onClick={edit} contentEditable={editing} style={{gridArea: "1 / 1 / 2 / 2", color: "red", width: "100%", whiteSpace: "pre-wrap", ...textStyle }}>{value}</span>);
// }

// export default CustomEditablePreview;

//#region Trying for a more 'proper' solution
import ResizeableTextArea from "./AutoResizeTextArea";

const textParentKey = uuidv4();
const textAreaKey = uuidv4();

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
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const textAreaWidth = useRef<number>();
  const previewRef = useRef<typeof As>();

  const submitChanges = () => {
    if (value !== text) {
      console.log("YOOOOO");
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

  const edit = () => {
    if (canEdit && !editing) {
      setEditing(true);
    }
  };

  // UPDATE SIZE ON LOAD -> COPY HEIGHT OF PREVIEW TEXT
  useLayoutEffect(() => {
    if (editing) {
      // wanted to put this in the edit function but needed to ensure that this runs AFTER dom is loaded post state change
      updateTextAreaSize();
      textAreaRef.current.focus();
    } else {
      textAreaWidth;
      submitChanges();
    }
  }, [editing]);

  useEffect(() => {
    setValue(text);
  }, [text]);

  // UPDATE SIZE ON CHANGE -> USE TEXT AREA SCROLL HEIGHT
  // UPDATE SIZE ON RESIZE -> MANUAL UPDATE FUNCTION PASSED UP TO PARENT
  const updateTextAreaSize = () => {
    if (!textAreaRef.current || !previewRef.current) return;
    // "Reset" text area height then fit to content

    textAreaRef.current.style.height = "1px";
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;

    // Set parent to same size as there is weird extra spacing otherwise
    textAreaRef.current.parentNode.style.height =
      textAreaRef.current.style.height;
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    if (!!onChange && !changeOnSubmit) {
      onChange(value);
    }
    if (onImmediateChange) {
      onImmediateChange();
    }
    updateTextAreaSize();
  };

  return (
    <div className="editable" style={{ width, ...style }}>
      <As
        onClick={edit}
        ref={previewRef}
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
        id={textParentKey}
        key={textParentKey}
        style={{
          display: editing ? undefined : "none",
          width: "100%",
          overflow: "hidden",
          margin: "0",
          padding: "0",
          border: "none",
          outline: "2px solid blue",
          whiteSpace: "pre-wrap",
          pointerEvents: editing ? "all" : "none",
          boxSizing: "border-box",
          ...textStyle,
        }}
      >
        <textarea
          id={textAreaKey}
          key={textAreaKey}
          ref={textAreaRef}
          rows={1}
          cols={String(
            adjustSelf
              ? Math.max(
                  10,
                  Math.ceil(
                    textAreaRef?.current?.value.length +
                      2 +
                      Math.ceil(
                        (textAreaRef?.current?.value.match(/[mw]/g) || [])
                          .length / 3
                      )
                  )
                )
              : undefined
          )}
          value={value}
          wrap="hard"
          disabled={!editing}
          onChange={handleChange}
          onMouseUp={(e) => e.preventDefault}
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
            height: "100%",
            width: "100%",
            overflow: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            textAlign: "inherit",
            whiteSpace: "inherit",
            margin: "inherit",
            padding: "0",
            boxSizing: "inherit",
            outline: "none",
            border: "none",
            appearance: "none",
            display: editing ? undefined : "none",
            resize: "none",
            backgroundColor: "inherit",
            color: "inherit",
          }}
        />
      </As>
    </div>
  );
}

export default CustomEditablePreview;
//#endregion
