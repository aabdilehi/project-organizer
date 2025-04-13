import "./App.css";
import { Box, ChakraProvider, Stack } from "@chakra-ui/react";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import Board from "./components/Board";
import theme from "./config/theme";
import DarkModeIconButton from "./components/Modular/DarkModeIconButton";
import HelpIconButton from "./components/Modular/HelpIconButton";
import { Route, Routes } from "react-router-dom";
import { createContext } from "react";
import { useCallback } from "react";
import {
  TbMoonFilled as MoonIcon,
  TbSunFilled as SunIcon,
} from "react-icons/tb";
import { Modal } from "./components/Modular/Modal";

function App() {
  // const [currentBoard, setCurrentBoard] = useState(null);
  // const boardData = useMemo(
  //   () => ({ currentBoard, setCurrentBoard }),
  //   [currentBoard, setCurrentBoard]
  // );

  // I know this is not great but I need an easy way to access AND set the value
  // Since it is state, it would have re-rendered anyway if I changed it so who cares (?)

  const [isDarkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const toggleDarkMode = () => {
    const document = window.document.documentElement;
    if (!document) return;
    if (document.classList.contains("dark") || isDarkMode) {
      document.classList.remove("dark");
      document.classList.add("light");
    } else {
      document.classList.add("dark");
      document.classList.remove("light");
    }
    setDarkMode(document.classList.contains("dark"));
    return;
  };

  // const [open, setOpen] = useState(true);

  useEffect(() => {
    const disableCtrlZoom = (e) => e.ctrlKey && e.preventDefault();
    const pointermoveHandler = (e) => console.log("pointerMove", e);

    window.addEventListener("wheel", disableCtrlZoom, { passive: false });
    window.addEventListener("pointermove", pointermoveHandler);
    return () => {
      window.removeEventListener("wheel", disableCtrlZoom);
      window.removeEventListener("pointermove", pointermoveHandler);
    };
  }, []);

  return (
    <>
      <div
        style={{ position: "absolute", zIndex: 99, right: "12px", top: "12px" }}
      >
        <button onClick={toggleDarkMode}>
          {isDarkMode ? <MoonIcon /> : <SunIcon />}
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
