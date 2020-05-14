import { Box, Button, Container, Card, CardActionArea, Typography, CardActions, makeStyles, Theme, createStyles } from "@material-ui/core";

import React, { useState } from "react";
import Wishlist from "../../interfaces/wishlist.interface";
import * as wishlistService from '../../services/wishlists.service';
import { RouteChildrenProps } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display:'flex',
            minHeight:'100vh',
            flexDirection:"column",
            justifyContent:"center",
            padding:theme.spacing(2),
        },
        card: {
            display: 'flex',
            marginBottom: theme.spacing(1),
        },
        content:{
            padding:theme.spacing(2)
        }
    }),
);

export const LoadWishlist = ({ history }:RouteChildrenProps) => {
    const classes = useStyles();
    const [wishlists, setWishlists] = useState<Wishlist[]>();
    async function load() {
        let w = await wishlistService.getAllWishlists();
        setWishlists(w);
    }

    if (!wishlists) {
        load();
        return <Box></Box>;
    }


    const openWishlist = (w:Wishlist)=>{
        history.replace("/wishlist/e/" + w.id);
    }

    const deleteWishlist = (w:Wishlist)=>{
        wishlistService.deleteWishlist(w);
        setWishlists(wishlists.filter((wi)=>wi.id !== w.id));
        
    }

    return (
        <Container maxWidth="sm">
            <Box className={classes.root}>
                {wishlists.map((w) =>
                    <Card key={w.id} className={classes.card}>
                        <CardActionArea className={classes.content} onClick={()=>openWishlist(w)}>
                            <Typography gutterBottom variant="h5" component="h2">
                                {w.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {w.description}
                            </Typography>
                        </CardActionArea>
                        <CardActions>
                            <Button size="small" variant="contained" color="primary" onClick={()=>deleteWishlist(w)}>
                                Delete
                            </Button>
                        </CardActions>
                    </Card>
                )}
            </Box>
        </Container>);
};