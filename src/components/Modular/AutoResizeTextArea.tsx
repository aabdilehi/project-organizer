import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useRef } from "react";

export default forwardRef(function ResizeableTextArea(
  { onChange, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  ref: React.ForwardedRef<HTMLTextAreaElement>
) {
  const textRef = useRef();
  useImperativeHandle(ref, () => textRef.current!, []);
  const [value, setValue] = useState(props.defaultValue ?? props.value ?? "");
  const updateSize = () => {
    if (!textRef.current) return;
    textRef.current.style.height = "1px";
    textRef.current.style.height = `${textRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    updateSize();
  }, [value]);

  return (
    <textarea
      rows={1}
      className="resizable"
      wrap="hard"
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }
        setValue(e.target.value);
      }}
      ref={textRef}
      style={{ wordBreak: "break-all", ...props.style }}
      {...props}
    >
      {props.children}
    </textarea>
  );
});
