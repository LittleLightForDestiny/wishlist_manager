import { Box, Button, CircularProgress } from "@material-ui/core";
import React, { useState } from "react";
import Wishlist, { WishlistBuild } from "../../../interfaces/wishlist.interface";
import WishlistMetadataForm from "../metadataForm";

export const ImporterMetadataForm = (props: {
    data?:{
        wishlist:Wishlist,
        builds:WishlistBuild[]
    },
    onSave: ()=>void
}) => {
    const [importing, setImporting] = useState<Boolean>(false);
    if(importing){
        return <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={200} p={4}>
            <CircularProgress></CircularProgress>
            <Box pt={2}>Working...</Box>
        </Box>
    }
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
                    setImporting(true);
                    props.onSave();
                }}
                component="span" >
                    Import
                </Button>
            </Box>
        </Box>
    </Box>);
};