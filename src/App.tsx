import React from 'react';
import logo from './logo.svg';
import './App.css';
import { SelectWeapon } from './views/select_weapon/select_weapon.view';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#33425e"
    },
    secondary: {
      main: "#33425e"
    },
    type: "dark",
  },
});

function App() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <SelectWeapon></SelectWeapon>
      </ThemeProvider>
    </div>
  );
}

export default App;