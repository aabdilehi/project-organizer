import "./App.css";
import React, { useEffect } from "react";
import Board from "./components/Board";
import { Route, Routes } from "react-router-dom";

function App() {
  // const [currentBoard, setCurrentBoard] = useState(null);
  // const boardData = useMemo(
  //   () => ({ currentBoard, setCurrentBoard }),
  //   [currentBoard, setCurrentBoard]
  // );

  // I know this is not great but I need an easy way to access AND set the value
  // Since it is state, it would have re-rendered anyway if I changed it so who cares (?)

  // const [open, setOpen] = useState(true);

  useEffect(() => {
    const disableCtrlZoom = (e) => e.ctrlKey && e.preventDefault();

    const rootElement = document.querySelector < HTMLDivElement > "#root";

    window.addEventListener("wheel", disableCtrlZoom, { passive: false });
    return () => {
      window.removeEventListener("wheel", disableCtrlZoom);
    };
  }, []);


  return (
    <>
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
