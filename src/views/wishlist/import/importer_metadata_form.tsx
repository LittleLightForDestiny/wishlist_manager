import { Box, Button } from "@material-ui/core";
import React from "react";
import Wishlist, { WishlistBuild } from "../../../interfaces/wishlist.interface";
import WishlistMetadataForm from "../metadataForm";

export const ImporterMetadataForm = (props: {
    data?:{
        wishlist:Wishlist,
        builds:WishlistBuild[]
    },
    onSave: ()=>void
}) => {
    return (
        <Box>
            <Box p={2}>
            <Box>
                <WishlistMetadataForm wishlist={props.data?.wishlist} onChange={(w)=>{props.data!.wishlist = w;}}></WishlistMetadataForm>
            </Box>
            <Box p={1}>
                {props.data?.builds.length} builds found.
            </Box>
            <Box display="flex" justifyContent="flex-end">
                <Button 
                variant="contained" 
                color="primary" 
                onClick={()=>{
                    props.onSave();
                }}
                component="span" >
                    Import
                </Button>
            </Box>
        </Box>
    </Box>);
};