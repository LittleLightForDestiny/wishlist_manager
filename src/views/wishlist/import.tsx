import { AppBar, Box, Container, createStyles, makeStyles, Paper, Theme, Toolbar } from "@material-ui/core";
import React, { useState } from "react";
import { RouteChildrenProps } from "react-router-dom";
import Wishlist, { WishlistBuild } from "../../interfaces/wishlist.interface";
import { saveBuild } from "../../services/wishlistBuild.service";
import { createWishlist } from "../../services/wishlists.service";
import { OnImportFinish, WishlistImporter } from "./import/importer";
import { ImporterMetadataForm } from "./import/importer_metadata_form";
import { ImportWishlistForm, MediaType, OnWishlistImport, WishlistData as WishlistFormData, WishlistType } from "./import/import_form";



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        noPadding: {
            padding: 0,
            margin: 0,
        },
        root: {
            display: 'flex',
            minHeight: '100vh',
            flexDirection: "column",
            justifyContent: "center",
            padding: theme.spacing(0),
        },
        card: {
            display: 'flex',
            marginBottom: theme.spacing(1),
        },
        content: {
            padding: theme.spacing(2)
        }
    }),
);

enum Phase {
    importForm = "import-form",
    importing = "importing",
    metadataForm = "metadataForm"
}

export const ImportWishlist = ({ history }: RouteChildrenProps) => {
    const classes = useStyles();
    const [phase, setPhase] = useState<Phase>(Phase.importForm);
    const [formData, setFormData] = useState<WishlistFormData>();

    const [importedData, setImportedData] = useState<{
        wishlist: Wishlist,
        builds: WishlistBuild[]
    }>();

    const importFile: OnWishlistImport = (data) => {
        setFormData(data);
        setPhase(Phase.importing);
    }

    const importFinish: OnImportFinish = (data) => {
        setImportedData(data);
        setPhase(Phase.metadataForm);
    };

    const onSave = async ()=>{
        let w = await createWishlist(importedData?.wishlist!);
        for(let i in importedData?.builds){
            let build = importedData?.builds[parseInt(i)];
            await saveBuild({
                wishlistId:w.id,
                ...build});
        }
        history.push(`/wishlist/e/${w.id}`);
    }

    return (
        <Container maxWidth="sm">
            <Box className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        Import Wishlist
                    </Toolbar>
                </AppBar>
                <Paper>
                    <Box p={2}>
                        {() => {
                            switch (phase) {
                                case Phase.importForm:
                                    return <ImportWishlistForm onImport={importFile}></ImportWishlistForm>;
                                case Phase.importing:
                                    return <WishlistImporter onFinish={importFinish} data={formData}></WishlistImporter>
                                case Phase.metadataForm:
                                    return <ImporterMetadataForm data={importedData} onSave={onSave}></ImporterMetadataForm>
                            }
                        }}
                    </Box>
                </Paper>
            </Box>
        </Container >);
};