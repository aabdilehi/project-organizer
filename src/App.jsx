import "./App.css";
import { Box, ChakraProvider, Stack } from "@chakra-ui/react";
import React, { useContext, useMemo, useState } from "react";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import theme from "./config/theme";
import DarkModeIconButton from "./components/DarkModeIconButton";
import HelpIconButton from "./components/HelpIconButton";
import { Route, Routes } from "react-router-dom";
import { createContext } from "react";
import { useCallback } from "react";

export const SelectedNodeContext = createContext(undefined);

function App() {
  // const [currentBoard, setCurrentBoard] = useState(null);
  // const boardData = useMemo(
  //   () => ({ currentBoard, setCurrentBoard }),
  //   [currentBoard, setCurrentBoard]
  // );

  // I know this is not great but I need an easy way to access AND set the value
  // Since it is state, it would have re-rendered anyway if I changed it so who cares (?)
  const [selectedNode, setSelectedNode] = useState([]);

  const handleSelectNode = useCallback(
    (e, value) => {
      if (e.ctrlKey) {
        if (!value) {
          return;
        }
        if (!selectedNode.includes(value)) {
          setSelectedNode((prev) => {
            const a = [...prev];
            a.push(value);
            return a;
          });
          console.log(selectedNode);
        } else {
          setSelectedNode((prev) => {
            const a = [...prev];
            const i = a.indexOf(value);
            a.splice(i, 1);
            return a;
          });
          console.log(selectedNode);
        }
      } else {
        if (!value) {
          setSelectedNode([]);
        } else {
          setSelectedNode([value]);
        }
      }
    },
    [selectedNode, setSelectedNode]
  );

  const contextValue = useMemo(
    () => ({
      selectedNode,
      handleSelectNode,
    }),
    [selectedNode, setSelectedNode, handleSelectNode]
  );

  return (
    <SelectedNodeContext.Provider value={contextValue}>
      <ChakraProvider theme={theme}>
        <Box position="absolute" top={2} right={2} zIndex={"popover"}>
          <DarkModeIconButton m={1} />
          <HelpIconButton m={1} />
        </Box>
        <Routes>
          <Route path="/*">
            <Route
              index
              element={
                <Stack
                  w={"full"}
                  m={0}
                  p={0}
                  gap={0}
                  direction="row"
                  id="container"
                >
                  <Sidebar />
                  <Board></Board>
                </Stack>
              }
            />

            <Route
              path=":id"
              element={
                <Stack
                  w={"full"}
                  m={0}
                  p={0}
                  gap={0}
                  direction="row"
                  id="container"
                >
                  <Sidebar />
                  <Board></Board>
                </Stack>
              }
            />
          </Route>
        </Routes>
      </ChakraProvider>
    </SelectedNodeContext.Provider>
  );
}

export default App;
