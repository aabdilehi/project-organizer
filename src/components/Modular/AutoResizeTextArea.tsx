import React, { forwardRef, useEffect, useState } from "react";
import { useRef } from "react";


export default forwardRef(function ResizeableTextArea({onChange, ...props} : {onChange?: React.ChangeEventHandler<HTMLTextAreaElement>}, ref: React.ForwardedRef<HTMLTextAreaElement>) {




    return <textarea rows={1} wrap="hard" onChange={(e) => {
        if(onChange) {onChange(e);}
    }} ref={ref} style={{wordBreak: "break-all"}} {...props}>{props.children}</textarea>
})
