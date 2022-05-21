import React from "react";
import {Route, Routes} from "react-router-dom";
import {NoMatch} from "./navigation/NoMatch";
import {Layout} from "./navigation/Layout";
import {TransactionView} from "./transaction/view/TransactionView";
import "./App.css";

export default function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="transaction">
                        <Route path=":transactionContractAddress" element={<TransactionView />} />
                    </Route>
                    <Route path="*" element={<NoMatch />} />
                </Route>
            </Routes>
        </div>
    );
}
