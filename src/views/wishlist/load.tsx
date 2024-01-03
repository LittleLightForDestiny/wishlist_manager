import { AppBar, Box, Button, Card, CardActionArea, CardActions, Container, IconButton, Paper, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { RouteChildrenProps } from "react-router-dom";
import Wishlist from "../../interfaces/wishlist.interface";
import * as wishlistService from '../../services/wishlists.service';

const useStyles = {
        root: {
            display: 'flex',
            flexDirection: "column",
            justifyContent: "center",
            marginLeft:-2,
            marginRight:-2,
            // minHeight: '100vh',
        },
        menuButton: {
            marginRight: 2,
        },
        card: {
            display: 'flex',
            justifyContent:"space-between",
            marginBottom: 1,
        },
        cardActionArea:{
            flexShrink:1,
            overflow:"hidden",
            textOverflow:"ellipsis"
        },
        content: {
            padding: 1,
            paddingBottom: 0,
            background: 'background.default',
        }
    }

export const LoadWishlist = ({ history }: RouteChildrenProps) => {
    const [wishlists, setWishlists] = useState<Wishlist[]>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles;
    async function load() {
        let w = await wishlistService.getAllWishlists();
        setWishlists(w);
    }

    if (!wishlists) {
        load();
        return <Box></Box>;
    }


    const openWishlist = (w: Wishlist) => {
        history.replace("/wishlist/e/" + w.id);
    }

    const deleteWishlist = (w: Wishlist) => {
        wishlistService.deleteWishlist(w);
        setWishlists(wishlists.filter((wi) => wi.id !== w.id));
    }

    const goToMain = () => {
        history.push("/");
    }

    return (
        <Container maxWidth="sm">
            <Box sx={classes.root} minHeight={isMobile ? "auto" : "100vh"}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={goToMain}>
                            <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                        </IconButton>
                        <Typography>
                            Load Wishlist
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Paper sx={classes.content}>
                    {wishlists.length === 0 ?
                        <Box p={3} textAlign="center">
                            No wishlists to load
                    </Box>
                        :
                        wishlists.map((w) =>
                            <Card key={w.id} sx={classes.card} >
                                <CardActionArea onClick={() => openWishlist(w)} sx={classes.cardActionArea}>
                                    <Box p={2} flexGrow="0" flexShrink="1" overflow="hidden">
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {w.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" component="p">
                                            {w.description}
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                                <CardActions>
                                    <Button size="small" variant="contained" color="primary" onClick={() => deleteWishlist(w)}>
                                        Delete
                            </Button>
                                </CardActions>
                            </Card>
                        )}
                </Paper>
            </Box>
        </Container>);
};
