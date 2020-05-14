import { Box, BoxProps, createStyles, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sectionHeader: {
            backgroundColor: theme.palette.primary.dark,
            padding: theme.spacing(1),
            marginBottom: theme.spacing(1),
            borderRadius: theme.shape.borderRadius,

        }
    }),
);

export const SectionHeader = (props: BoxProps) => {
    const classes = useStyles();
    return (
        <Box className={classes.sectionHeader} {...props}>
            {props.children}
        </Box>);
}