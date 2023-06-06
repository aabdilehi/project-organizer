import { Box, ChakraProvider, Stack } from "@chakra-ui/react";
import React from "react";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import theme from "./config/theme";
import DarkModeIconButton from "./components/DarkModeIconButton";
import HelpIconButton from "./components/HelpIconButton";
import { ContextMenuProvider } from "./utils/hooks/useContextMenu";

function App() {
  return (
    <ContextMenuProvider>
      <ChakraProvider theme={theme}>
        <Box position="absolute" top={2} right={2} zIndex={"popover"}>
          <DarkModeIconButton m={1} />
          <HelpIconButton m={1} />
        </Box>

        <Stack w={"full"} m={0} p={0} gap={0} direction="row" id="container">
          <Sidebar />
          <Board></Board>
        </Stack>
      </ChakraProvider>
    </ContextMenuProvider>
  );
}

export default App;
