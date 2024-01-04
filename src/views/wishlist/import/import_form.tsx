import { Box, Button, Card, FormControlLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import isUrl from "is-url";
import React, { useState } from "react";

export enum WishlistType {
    LittleLight = "little_light",
    DIM = "dim",
    CSV = "csv",
    XLS = "xls",
}
export enum MediaType {
    Upload = "upload",
    Link = "link"
}

export type WishlistData = { type?: WishlistType, media?: MediaType, data?: File | string };

export type OnWishlistImport = (data: WishlistData) => void;

export const ImportWishlistForm = (props: {
    data?: WishlistData,
    onImport: OnWishlistImport
}) => {
    const [wishlistType, setWishlistType] = useState<WishlistType | null>(props.data?.type ?? null);
    const [mediaType, setMediaType] = useState<MediaType | null>(props.data?.media ?? null);
    const [wishlistURL, setWishlistURL] = useState<string>(typeof (props.data?.data) === "string" ? props.data?.data : "");
    const [wishlistFile, setWishlistFile] = useState<File>();

    const getMediaField = () => {
        switch (mediaType) {
            case MediaType.Link:
                return <Box py={1} pt={2}>
                    <TextField id="url" label="wishlist URL" variant="outlined" fullWidth value={wishlistURL} onChange={(e) => setWishlistURL(e.target.value)} />
                </Box>;

            case MediaType.Upload:
                return <Box py={1} pt={2}>
                    <Card variant="outlined" >
                        <Box p={.5}>
                            <input
                                accept="application/json"
                                style={{ display: "none" }}
                                id="contained-button-file"
                                multiple
                                type="file"
                                onChange={(event) => {
                                    let file = event.target.files?.item(0);
                                    if (file) {
                                        setWishlistFile(file);
                                    }
                                }}
                            />
                            <label htmlFor="contained-button-file">
                                <Button variant="contained" color="primary" component="span">
                                    Upload
                                </Button>
                            </label>
                            <Box display="inline" pl={1}>{wishlistFile?.name}</Box>
                        </Box>
                    </Card>
                </Box>;
        }
        return <Box></Box>;
    };

    const importButtonEnabled = () => {
        if (!wishlistType) return false;
        if (!mediaType) return false;

        switch (mediaType) {
            case MediaType.Link:
                return isUrl(wishlistURL || "");

            case MediaType.Upload:
                return !!wishlistFile;
        }
        return false;
    }

    const getData = () => {
        switch (mediaType) {
            case MediaType.Link:
                return wishlistURL;

            case MediaType.Upload:
                return wishlistFile;
        }
        return null;
    }

    return (
        <Box>
            <Box p={2}>
                <Box m={1} mb={.5} mt={0}>
                    <Typography>Wishlist Type</Typography>
                </Box>
                <Card variant="outlined">
                    <RadioGroup aria-label="wishlist type" name="wishlist type"
                        value={wishlistType}
                        style={{ display: "flex", flexDirection: "row", padding: "8px 16px" }}
                        onChange={(_, value) => setWishlistType(value as any)}>
                        <FormControlLabel value={WishlistType.LittleLight} control={<Radio />} label="Little Light" />
                        <FormControlLabel disabled value={WishlistType.DIM} control={<Radio />} label="DIM" />
                    </RadioGroup>
                </Card>
                <Box m={1} mb={.5}>
                    <Typography>Media Type</Typography>
                </Box>
                <Card variant="outlined">
                    <RadioGroup aria-label="media type" name="media type"
                        value={mediaType}
                        style={{ display: "flex", flexDirection: "row", padding: "8px 16px" }}
                        onChange={(_, value) => setMediaType(value as any)}>
                        <FormControlLabel value={MediaType.Upload} control={<Radio />} label="Upload" />
                        <FormControlLabel value={MediaType.Link} control={<Radio />} label="Link" />
                    </RadioGroup>
                </Card>
                {getMediaField()}
            </Box>
            <Box pt={0} p={2} display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        let data = getData();
                        if (!wishlistType || !mediaType || !data) return;
                        props.onImport({
                            type: wishlistType,
                            media: mediaType,
                            data: data
                        });
                    }
                    }
                    component="span"
                    disabled={!importButtonEnabled()}>
                    Import
                </Button>
            </Box>
        </Box>);
};