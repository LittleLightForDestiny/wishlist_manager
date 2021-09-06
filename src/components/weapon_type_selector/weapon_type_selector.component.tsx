import { alpha, Box, Button, ButtonGroup, ButtonGroupProps, createStyles, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        typeButton: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: alpha(theme.palette.common.white, .23),
            backgroundColor: theme.palette.primary.dark
        },
        selectedButton: {
            pointerEvents: "none",
            backgroundColor: theme.palette.primary.main
        },
        boxBackground: {
            backgroundColor: alpha(theme.palette.common.black, .23),
            borderRadius: "8px",
        },
    }),
);

export interface WeaponTypeSelectorProps extends ButtonGroupProps {
    weaponTypes?: Set<string>;
    selectedType?: string;
    onSelectType: (type?: string) => void;
}

export const WeaponTypeSelector = (props: WeaponTypeSelectorProps) => {
    const classes = useStyles();
    const buildWeaponTypeButton = (type?: string, label?: string) => {
        const selected = props.selectedType === type;
        let buttonClasses = [classes.typeButton];
        if (selected) buttonClasses.push(classes.selectedButton);
        return <Button key={type}
            className={buttonClasses.join(" ")}
            variant={selected ? "contained" : "outlined"}
            color={selected ? "primary" : undefined}
            onClick={() => props.onSelectType(type)}>
            {label ?? type}
        </Button>;
    }
    let {
        weaponTypes,
        selectedType,
        onSelectType,
        ...buttonProps } = props;
    return <Box p={2} mb={1} className={classes.boxBackground}>
        <Box p={1} fontSize="16px">Weapon Types</Box>
        <ButtonGroup orientation="vertical" {...buttonProps} >
            {buildWeaponTypeButton(undefined, "All")}
            {weaponTypes ? [...weaponTypes].map((type) => buildWeaponTypeButton(type)) : null}
        </ButtonGroup>
    </Box>
}