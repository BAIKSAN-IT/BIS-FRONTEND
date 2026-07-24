import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import App from "./App";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import store, { persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

// 운영환경 console 안찍히게
if (process.env.REACT_APP_DEVELOPMENT === "N") {
  console.log = () => {};
  // console.debug = () => {};
  // console.error = () => {};
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
