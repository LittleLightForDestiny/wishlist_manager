import { Box, Button, Container } from "@material-ui/core";
import { History } from "history";
import React from "react";
import Wishlist from "../../interfaces/wishlist.interface";
import WishlistMetadataForm from "./metadataForm";
import * as wishlistService from '../../services/wishlists.service';

export const NewWishlist = (props: { history: History }) => {
    var wishlist: Wishlist = {};

    const createClick = async () => {
        let result = await wishlistService.createWishlist(wishlist);
        props.history.replace(`/wishlist/e/${result.id}`);
    };
    return (
        <Container maxWidth="sm">
            <Box height="100vh" justifyContent="center" display="flex" flexDirection="column">
                <WishlistMetadataForm wishlist={wishlist}></WishlistMetadataForm>
                <Box display="flex" justifyContent="flex-end" width="100%">
                    <Button variant="contained" color="secondary" onClick={createClick}>Create</Button>
                </Box>
            </Box>
        </Container>);
};