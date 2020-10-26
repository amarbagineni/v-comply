/**
 * Place that brings together the routing of the application
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Router from "./pages/Router";
import "./styles/index.scss";

ReactDOM.render(
    <BrowserRouter>
        <div>
            <Router/>
        </div>
    </BrowserRouter>,
    document.getElementById("root"),
);
