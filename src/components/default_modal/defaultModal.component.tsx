import { Box, BoxProps, Modal, Theme } from "@mui/material";
import React from "react";

const useStyles = {
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    modalPaper: {
        backgroundColor: 'background.default',
        boxShadow: (theme:Theme)=>theme.shadows[5],
        overflow: "hidden",
    },
}

export const DefaultModal = (props: BoxProps) => {
    const classes = useStyles;
    return (<Modal open={true}>
        <Box sx={classes.modalContainer}>
            <Box sx={classes.modalPaper} {...props} >
                {props.children}
            </Box>
        </Box>
    </Modal>);
}
