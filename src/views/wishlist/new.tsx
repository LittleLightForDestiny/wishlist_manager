import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Box, Button, Container, createStyles, IconButton, makeStyles, Paper, Theme, Toolbar, Typography } from "@material-ui/core";
import React from "react";
import { RouteChildrenProps } from "react-router-dom";
import Wishlist from "../../interfaces/wishlist.interface";
import {createWishlist} from '../../services/wishlists.service';
import WishlistMetadataForm from "./metadataForm";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        root: {
            display: 'flex',
            minHeight: '100vh',
            flexDirection: "column",
            justifyContent: "center",
            padding: theme.spacing(0),
        },
    }),
);

export const NewWishlist = ({ history }: RouteChildrenProps) => {
    const classes = useStyles();

    var wishlist: Wishlist = {};

    const goToMain = () => {
        history.push("/");
    }

    const createClick = async () => {
        let result = await createWishlist(wishlist);
        history.replace(`/wishlist/e/${result.id}`);
    };
    return (
        <Container maxWidth="sm">

            <Box className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={goToMain}>
                            <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                        </IconButton>
                        <Typography>Create Wishlist</Typography>
                    </Toolbar>
                </AppBar>
                <Paper>
                    <Box p={2}>
                        <WishlistMetadataForm wishlist={wishlist} onChange={(w) => { wishlist = w }}></WishlistMetadataForm>
                        <Box display="flex" justifyContent="flex-end" width="100%" pt={2}>
                            <Button variant="contained" color="primary" onClick={createClick}>Create</Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>);
};