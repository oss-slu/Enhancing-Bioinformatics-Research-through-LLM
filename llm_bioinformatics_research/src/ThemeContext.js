import React, {createContext, useState, useMemo} from 'react';
import {createTheme, ThemeProvider} from '@mui/material/styles';

const ThemeContext = createContext();

export const ThemeContextProvider = ({children}) => {
    const [themeMode, setThemeMode] = useState('light');

    const toggleTheme = (mode) => {
        setThemeMode(mode);
    }

    const theme = useMemo(() => createTheme({
        palette: {
            mode: themeMode,
        },
    }), [themeMode]);

    return (
        <ThemeContext.Provider value={{themeMode, toggleTheme}}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );

    export default ThemeContext;