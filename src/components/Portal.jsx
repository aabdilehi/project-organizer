import React from "react";
import { forwardRef } from "react";

export default forwardRef((props, ref) => {
  return <div ref={ref}></div>;
});
