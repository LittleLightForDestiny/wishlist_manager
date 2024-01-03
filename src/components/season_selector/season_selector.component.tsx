import { alpha, Box, Button, ButtonBase, ButtonGroupProps, Theme } from "@mui/material";
import React from "react";

const useStyles = {
        boxBackground: {
            backgroundColor: (theme:Theme) => alpha(theme.palette.common.black, .23),
            borderRadius: "8px",
        },
        seasonGrid: {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
        },
        buttonContainer: {
            aspectRatio: "1",
            width: "16.6%",
            padding: "4px",
        },
        seasonButton: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: (theme:Theme) => alpha(theme.palette.common.white, .23),
            backgroundColor: 'primary.dark'
        },
        roundButton: {
            fontSize: "22px",
            borderRadius: "50%",
            height: "100%",
        },
        selectedButton: {
            pointerEvents: "none",
            backgroundColor: 'primary.main'
        },
        alignCenter: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }
    }

export interface SeasonSelectorProps extends ButtonGroupProps {
    seasons?: Set<number>;
    selectedSeason: number;
    onSelectSeason: (type: number) => void;
}

export const SeasonSelector = (props: SeasonSelectorProps) => {
    const classes = useStyles;
    const buildMainButton = (season: number, label: string) => {
        const selected = props.selectedSeason === season;
        let buttonClasses:any[] = [classes.seasonButton];
        if (selected) buttonClasses.push(classes.selectedButton);
        return (
            <Button
                sx={buttonClasses}
                onClick={() => props.onSelectSeason(season)}>
                {label ?? season}
            </Button >);
    }
    const buildSeasonButton = (season: number, label?: string) => {
        const selected = props.selectedSeason === season;
        let buttonClasses:any[] = [classes.seasonButton, classes.roundButton];
        if (selected) buttonClasses.push(classes.selectedButton);
        return <Box key={`season-${season}`} sx={classes.buttonContainer}>
            <ButtonBase
                className={buttonClasses.join(" ")}
                onClick={() => props.onSelectSeason(season)}>
                {label ?? season}
            </ButtonBase>
        </Box>;
    }
    let {
        seasons,
    } = props;
    return (
        <Box p={2} mb={1} sx={classes.boxBackground}>
            <Box p={1} fontSize="16px">Season</Box>
            {buildMainButton(-1, "All")}
            <Box p={1}></Box>
            <Box sx={classes.seasonGrid}>
                {seasons ? [...seasons].sort((a,b)=>a-b).map((type) => buildSeasonButton(type)) : null}
            </Box>
        </Box>
    );
}