import { createMuiTheme, ThemeProvider, colors } from '@material-ui/core';
import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Welcome } from './views/welcome/welcome.view';
import WishlistsIndex from './views/wishlist';

import 'simplebar/dist/simplebar.min.css';
import './App.scss';



const theme = createMuiTheme({
  palette: {
    primary: colors.blueGrey,
    secondary: colors.lightBlue,
    type: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Route exact path="/" component={Welcome}></Route>
        <Route path="/wishlist" component={WishlistsIndex}></Route>
      </Router>
    </ThemeProvider>
  );
}

export default App;