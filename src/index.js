import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App';
//import registerServiceWorker from './registerServiceWorker';

import AppProvider from './context/AppProvider';


ReactDOM.render(
    <BrowserRouter>
        <AppProvider>
            <App />
        </AppProvider>
    </BrowserRouter>,

    document.getElementById("root"),
);

//registerServiceWorker();
