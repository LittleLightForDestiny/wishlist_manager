import { Box, BoxProps, Theme } from "@mui/material";
import React from "react";

const useStyles = {
        sectionHeader: {
            backgroundColor: 'primary.dark',
            padding: 1,
            marginBottom: 1,
            borderRadius: (theme:Theme) => theme.shape.borderRadius,

        }
    }

export const SectionHeader = (props: BoxProps) => {
    const classes = useStyles;
    return (
        <Box sx={classes.sectionHeader} {...props}>
            {props.children}
        </Box>);
}