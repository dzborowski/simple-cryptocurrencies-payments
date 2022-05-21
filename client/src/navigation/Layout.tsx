import {Link, Outlet} from "react-router-dom";
import React from "react";

export function Layout() {
    return (
        <div>
            <Outlet />
        </div>
    );
}
