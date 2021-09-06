
import { Box, Button, Container, Typography } from "@material-ui/core";
import { Link as RouterLink } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { getAllWishlists } from "../../services/wishlists.service";

export const Welcome = () => {
    const [wishlistsAvailable, setWishlistsAvailable] = useState(false);


    useEffect(() => {
        async function load() {
            let wishlists = await getAllWishlists();
            if ((wishlists?.length || 0) > 0) {
                setWishlistsAvailable(true);
            }
        }
        load();
    }, []);

    return (
        <Container maxWidth="xs">
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ height: "100vh" }}>
                <Button size="large" variant="contained" color="primary" fullWidth component={RouterLink} to="/wishlist/new">
                    <Typography>Create new wishlist</Typography>
                </Button>
                <Box mb={1}></Box>
                <Button size="large" variant="contained" color="primary" fullWidth component={RouterLink} to="/wishlist/import">
                    <Typography>Import wishlist</Typography>
                </Button>
                <Box mb={1}></Box>
                {
                    wishlistsAvailable ? <Button size="large" variant="contained" color="primary" fullWidth component={RouterLink} to="/wishlist/load">
                        <Typography>Load wishlist</Typography>
                    </Button> : <Box />
                }
            </Box>
        </Container>);
};