import { createStyles, makeStyles, Modal, Theme, Box, BoxProps } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modalPaper: {
            position: 'absolute',
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[5],
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            overflow: "hidden",
        },
    }),
);

export const DefaultModal = (props:BoxProps)=>{
    const classes = useStyles();
    return (<Modal open={true}>
        <Box className={classes.modalPaper} {...props} >
            {props.children}
        </Box>
    </Modal>);
}
