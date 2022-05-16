import React from 'react';
import ReactDOM from 'react-dom/client';

import { Provider } from 'react-redux';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';

import store from './store';
import App from './App';
import reportWebVitals from './reportWebVitals';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const darkTheme = createTheme({
    palette: {
        mode: 'dark'
    }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={darkTheme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <CssBaseline enableColorScheme />
                    <App />
                </LocalizationProvider>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
