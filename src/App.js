import "./App.css";
import { ChakraProvider, Stack } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import React from "react";

function App() {
  return (
    <ChakraProvider>
      <DndProvider backend={HTML5Backend}>
        <Stack m={0} p={0} gap={0} direction="row" id="container">
          <Sidebar />
          <Board />
        </Stack>
      </DndProvider>
    </ChakraProvider>
  );
}

export default App;
