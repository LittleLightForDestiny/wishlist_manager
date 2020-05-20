import { createStyles, makeStyles, Modal, Theme, Box, BoxProps } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modalContainer:{
            position: 'absolute',
            top:0,
            left:0,
            bottom:0,
            right:0,
            display:"flex",
            alignItems:"center",
            justifyContent:"center"
        },
        modalPaper: {
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[5],
            overflow: "hidden",
        },
    }),
);

export const DefaultModal = (props:BoxProps)=>{
    const classes = useStyles();
    return (<Modal open={true}>
        <Box className={classes.modalContainer}>
            <Box className={classes.modalPaper} {...props} >
                {props.children}
            </Box>
        </Box>
    </Modal>);
}
