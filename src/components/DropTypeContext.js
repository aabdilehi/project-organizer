import React from "react";

// Create and export a context object
export const DropTypeContext = React.createContext({
  // Default dropType value
  dropType: null,
  // Dummy setter function
  setDropType: (dropType) => {},
});
