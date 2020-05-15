import { Box, CircularProgress } from "@material-ui/core";
import Axios from "axios";
import React, { useEffect } from "react";
import { MediaType, WishlistData, WishlistType } from "./import_form";
import {Wishlist, WishlistBuild} from '../../../interfaces/wishlist.interface';
import { importLittleLight } from "../../../utils/importers/littlelight.importer";

export type OnImportFinish = (data:{
    wishlist:Wishlist,
    builds:WishlistBuild[]
})=>void;

export const WishlistImporter = (props: {
    data?:WishlistData,
     onFinish:OnImportFinish
}) => {
    const importSource = ()=>{
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

    useEffect(()=>{
        async function load():Promise<any>{
            switch(props.data?.media){
                case MediaType.Link:
                    let res = await Axios.get(props.data.data as string);
                    return res.data;
            }
            return null;
        }
        async function importWishlist(data:any){
            switch(props.data?.type){
                case WishlistType.LittleLight:
                    return importLittleLight(data);
            }
            return null;
        }

        async function loadAndImport(){
            let content = await load();
            let imported = await importWishlist(content);
            if(imported){
                props.onFinish(imported);
            }
        }

        loadAndImport();
    }, [props]);
    return (
        <Box>
            <Box p={2} display="flex" flexDirection="column" alignItems="center">
                <Box textAlign="center" overflow="hidden" textOverflow="ellipsis">importing from {importSource()}</Box>
                <Box p={3}>
                <CircularProgress></CircularProgress>
                </Box>
            </Box>
        </Box>);
};