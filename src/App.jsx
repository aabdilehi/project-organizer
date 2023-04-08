import "./App.css";
import { Box, ChakraProvider, Stack } from "@chakra-ui/react";
import React from "react";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import theme from "./config/theme";
import DarkModeIconButton from "./components/DarkModeIconButton";
import HelpIconButton from "./components/HelpIconButton";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
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
  );
}

export default App;
