import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import DragLayerComponent from "./components/DragLayerComponent";
import React from "react";

function App() {
  return (
    <div id="container">
      <ChakraProvider>
        <DndProvider backend={HTML5Backend}>
          <Sidebar />
          <Board />
          <DragLayerComponent />
        </DndProvider>
      </ChakraProvider>
    </div>
  );
}

export default App;
