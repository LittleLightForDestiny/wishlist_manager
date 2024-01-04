import { Box, Button, ButtonGroupProps, colors, styled } from "@mui/material";
import React from "react";

const SeasonGrid = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
}))

const AllButton = styled(Button)(({ theme }) => ({
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.blueGrey[400],
    backgroundColor: 'primary.dark',
    color: 'white',
}))

const RoundButtonContainer = styled(Box)(({ theme }) => ({
    aspectRatio: 1,
    width: "16.6%",
    padding: 2
}))

const RoundButton = styled(Button)(({ theme }) => ({
    minWidth:0,
    aspectRatio: 1,
    fontSize: "22px",
    borderRadius: "50%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color:'white',
    borderColor: colors.blueGrey[400],
}))

export interface SeasonSelectorProps extends ButtonGroupProps {
    seasons?: Set<number>;
    selectedSeason: number;
    onSelectSeason: (type: number) => void;
}

export const SeasonSelector = (props: SeasonSelectorProps) => {
    const buildMainButton = (season: number, label: string) => {
        const selected = props.selectedSeason === season;
        return (
            <AllButton
                variant= {selected ? "contained" : 'outlined'}
                onClick={() => props.onSelectSeason(season)}>
                {label ?? season}
            </AllButton >);
    }
    const buildSeasonButton = (season: number, label?: string) => {
        const selected = props.selectedSeason === season;
        return <RoundButtonContainer key={`season-${season}`}>
            <RoundButton
                variant={selected ? 'contained' : 'outlined'}
                onClick={() => props.onSelectSeason(season)}>
                {label ?? season}
            </RoundButton>
        </RoundButtonContainer>;
    }
    let {
        seasons,
    } = props;
    return (
        <Box p={2} mb={1}
        sx= {{
            backgroundColor: colors.blueGrey[800],
            borderRadius: 2,
        }}>
            <Box pb={1} fontSize="16px">Season</Box>
            {buildMainButton(-1, "All")}
            <Box p={1}></Box>
            <SeasonGrid>
                {seasons ? [...seasons].sort((a, b) => a - b).map((type) => buildSeasonButton(type)) : null}
            </SeasonGrid>
        </Box>
    );
}