import "./App.css";
import { Box, ChakraProvider, Stack } from "@chakra-ui/react";
import React, { useContext, useMemo, useState } from "react";
import Board from "./components/Board";
import Sidebar from "./components/Sidebar";
import theme from "./config/theme";
import DarkModeIconButton from "./components/Modular/DarkModeIconButton";
import HelpIconButton from "./components/Modular/HelpIconButton";
import { Route, Routes } from "react-router-dom";
import { createContext } from "react";
import { useCallback } from "react";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { Modal } from "./components/Modular/Modal";

function App() {
  // const [currentBoard, setCurrentBoard] = useState(null);
  // const boardData = useMemo(
  //   () => ({ currentBoard, setCurrentBoard }),
  //   [currentBoard, setCurrentBoard]
  // );

  // I know this is not great but I need an easy way to access AND set the value
  // Since it is state, it would have re-rendered anyway if I changed it so who cares (?)
  const isDarkMode = window.document.documentElement.classList.contains("dark");
  const toggleDarkMode = () => {
    const document = window.document.documentElement;
    if (!document) return;
    document.classList.toggle("dark");
    return;
  };

  // const [open, setOpen] = useState(true);

  return (
    <>
      <div
        style={{ position: "absolute", zIndex: 99, right: "12px", top: "12px" }}
      >
        <button onClick={toggleDarkMode}>
          {isDarkMode ? <IconMoonFilled /> : <IconSunFilled />}
        </button>
      </div>
      {/* <Modal open={open} setOpen={(boolean) => setOpen(boolean)}>
        <p>Swag</p>
      </Modal> */}
      <Routes>
        <Route path="/*">
          <Route
            index
            element={
              <div
                style={{ display: "flex", flexDirection: "row", width: "100%" }}
                id="container"
              >
                <Sidebar />
                <Board />
              </div>
            }
          />

          <Route
            path=":id"
            element={
              <div
                style={{ display: "flex", flexDirection: "row", width: "100%" }}
                id="container"
              >
                <Sidebar />
                <Board />
              </div>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
