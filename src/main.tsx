import { LoadScriptNext } from "@react-google-maps/api";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LoadScriptNext
        libraries={["places", "drawing"]}
        googleMapsApiKey={"AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ"}
      >
        <App />
      </LoadScriptNext>
    </BrowserRouter>
  </StrictMode>
);
