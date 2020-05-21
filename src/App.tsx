import { createMuiTheme, ThemeProvider, colors, Box, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Welcome } from './views/welcome/welcome.view';
import WishlistsIndex from './views/wishlist';

import 'simplebar/dist/simplebar.min.css';
import './App.scss';
import { loadInventoryItemList, loadCollectibles } from './services/data.service';



const theme = createMuiTheme({
  palette: {
    primary: colors.blueGrey,
    secondary: colors.lightBlue,
    type: "dark",
  },
});

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    async function load(){
      await loadCollectibles();
      await loadInventoryItemList();
      setLoading(false);
    }
    load();
  }, []);
  return (
    <ThemeProvider theme={theme}>
      {loading ? 
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width="100vw" height="100vh">
        <CircularProgress></CircularProgress>
        <Box p={3} color="#FFFFFF">
          Loading game data ...
        </Box>
      </Box>
      :
      <Router>
        <Route exact path="/" component={Welcome}></Route>
        <Route path="/wishlist" component={WishlistsIndex}></Route>
      </Router>
      }
    </ThemeProvider>
  );
}

export default App;