import React, { forwardRef, useEffect, useState } from "react";
import { useRef } from "react";

export default forwardRef(function ResizeableTextArea(
  { onChange, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  ref: React.ForwardedRef<HTMLTextAreaElement>
) {
  const [value, setValue] = useState(props.defaultValue ?? props.value ?? "");
  const updateSize = () => {
    if (!ref.current) return;
    ref.current.style.height = "1px";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  };

  useEffect(() => {
    updateSize();
  }, [value]);

  return (
    <textarea
      rows={1}
      wrap="hard"
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }
        setValue(e.target.value);
      }}
      ref={ref}
      style={{ wordBreak: "break-all", ...props.style }}
      {...props}
    >
      {props.children}
    </textarea>
  );
});
