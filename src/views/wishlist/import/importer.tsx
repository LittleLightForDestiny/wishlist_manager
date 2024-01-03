import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { Wishlist, WishlistBuild } from '../../../interfaces/wishlist.interface';
import { MediaType, WishlistData } from "./import_form";

export type OnImportFinish = (data:{
    wishlist:Wishlist,
    builds:WishlistBuild[]
})=>void;

export const WishlistImporter = (props: {
    data?:WishlistData,
     onFinish:OnImportFinish
}) => {
    const getImportSource = ()=>{
        if(props.data?.media === MediaType.Upload){
            let file:File = props.data.data as File;
            return file.name;
        }else{
            let url:string = props.data?.data as string;
            let firstslashindex = url.indexOf("/", 10);
            let lastslashindex = url.lastIndexOf("/");
            return url.substring(0, firstslashindex + 1) + "..." + url.substring(lastslashindex);
        }
    }

    let importSource = getImportSource();
    
    return (
        <Box>
            <Box p={2} display="flex" flexDirection="column" alignItems="center">
                <Box textAlign="center" overflow="hidden" textOverflow="ellipsis">importing from {importSource}</Box>
                <Box p={3}>
                <CircularProgress></CircularProgress>
                </Box>
            </Box>
        </Box>);
};