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
  const [selectedNode, setSelectedNode] = useState({});
  const [selectedNodeRefs, setSelectedNodeRefs] = useState({});

  const handleSelectNode = useCallback(
    (e, value) => {
      if (!value) {
        setSelectedNode({});
        setSelectedNodeRefs({});
        return;
      }

      // separate refs from rest of node info
      const { ref, ...node } = value;

      if (ref.current === null) return;

      if (e.ctrlKey) {
        if (!selectedNode[node.id]) {
          setSelectedNode((prev) => {
            const a = { ...prev };
            a[node.id] = node;
            return a;
          });
          setSelectedNodeRefs((prev) => {
            const a = { ...prev };
            a[node.id] = ref;
            return a;
          });
        } else {
          setSelectedNode((prev) => {
            const a = { ...prev };
            delete a[node.id];
            return a;
          });
          setSelectedNodeRefs((prev) => {
            const a = { ...prev };
            delete a[node.id];
            return a;
          });
        }
      } else if (e.shiftKey) {
        if (!selectedNode[node.id]) {
          setSelectedNode((prev) => {
            const a = { ...prev };
            a[node.id] = node;
            return a;
          });
          setSelectedNodeRefs((prev) => {
            const a = { ...prev };
            a[node.id] = ref;
            return a;
          });
        }
      } else {
        const { ref, ...node } = value;
        setSelectedNode({ [node.id]: node });
        setSelectedNodeRefs({ [node.id]: ref });
      }
    },
    [selectedNode, setSelectedNode, selectedNodeRefs, setSelectedNodeRefs]
  );

  const contextValue = useMemo(
    () => ({
      selectedNode,
      selectedNodeRefs,
      handleSelectNode,
    }),
    [
      selectedNode,
      setSelectedNode,
      selectedNodeRefs,
      setSelectedNodeRefs,
      handleSelectNode,
    ]
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
