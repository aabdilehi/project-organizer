import React, { useState } from "react";
import { useRef } from "react";
import ReactDOM from "react-dom";

// let rulerElement: HTMLDivElement | undefined;

// function lazyGetRuler() {
//   if (rulerElement) return rulerElement;

//   rulerElement = document.createElement("div");
//   rulerElement.style.position = "absolute";
//   rulerElement.style.visibility = "hidden";
//   rulerElement.style.pointerEvents = "none";
//   rulerElement.style.whiteSpace = "pre";

//   document.body.appendChild(rulerElement);

//   return rulerElement;
// }

const rulerStyle : React.CSSProperties = {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
}

function useRuler() {

  const [style, setStyle] = useState<React.CSSProperties>({});
  const [content, setContent] = useState<string>("");

  const ruler = document.querySelector("#ruler") ? null : ReactDOM.createPortal(<span id="ruler" style={{...style ,...rulerStyle}}>{content}</span>, document.body)

  return { ruler, setStyle, setContent };
}

export default useRuler;
