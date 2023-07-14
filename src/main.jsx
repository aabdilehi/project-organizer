import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import "./index.css";
import { store, persistor } from "./store.jsx";
import { ContextMenuProvider } from "./utils/hooks/useContextMenu";

import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <React.StrictMode>
        <Router>
          <ContextMenuProvider>
            <App />
          </ContextMenuProvider>
        </Router>
      </React.StrictMode>
    </PersistGate>
  </Provider>
);
