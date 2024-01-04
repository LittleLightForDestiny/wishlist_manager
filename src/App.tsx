import { Box, CircularProgress, colors, createTheme, ThemeProvider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import 'simplebar/dist/simplebar.min.css';
import './App.scss';
import { loadManifest } from './services/manifest.service';
import { PackageIndex } from './views/package';
import { Welcome } from './views/welcome/welcome.view';
import WishlistsIndex from './views/wishlist';




const theme = createTheme({
  palette: {
    primary: {
      main: colors.blueGrey[500],
      light: colors.blueGrey[400],
      dark: colors.blueGrey[700]
    },
    secondary: {
      main: colors.lightBlue[300]
    },
    background:{
      default: '#0f1316',
      paper: colors.blueGrey[900],
    },
    mode: 'dark',
  },
  components:{
    MuiAppBar:{
      defaultProps:{
        enableColorOnDark:true,
      }
    },
    MuiTextField:{
      defaultProps:{
        color: 'secondary',
      }
    }
  }
});

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      await loadManifest();
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
          <Route path="/package" component={PackageIndex}></Route>
        </Router>
      }
    </ThemeProvider>
  );
}

export default App;