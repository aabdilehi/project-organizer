import logo from "./logo.svg";
import "./App.css";

import { useState, useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import { DropTypeContext } from "./components/DropTypeContext";
import DragLayerComponent from "./components/DragLayerComponent";
import React from "react";

const DropTypeProvider = ({ children }) => {
  // Define a state variable to store the type of the dropped item
  const [dropType, setDropType] = useState(null);

  // Provide the state value and setter function to the context object
  return (
    <DropTypeContext.Provider value={{ dropType, setDropType }}>
      {children}
    </DropTypeContext.Provider>
  );
};

function App() {
  return (
    <div id="container">
      <DropTypeProvider>
        <DndProvider backend={HTML5Backend}>
          <Sidebar />
          <Board />
          <DragLayerComponent />
        </DndProvider>
      </DropTypeProvider>
    </div>
  );
}

export default App;
