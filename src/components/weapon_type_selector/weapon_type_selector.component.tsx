import { Box, Button, ButtonGroup, ButtonGroupProps, styled, colors } from "@mui/material";
import React from "react";

const WeaponTypeButton = styled(Button)(({ theme }) => ({
    color: 'white',
    borderColor: colors.blueGrey[400],
}));

const WeaponTypeButtonContainer = styled(ButtonGroup)(({theme}) => ({
    backgroundColor: colors.blueGrey[700],
}));


export interface WeaponTypeSelectorProps extends ButtonGroupProps {
    weaponTypes?: Set<string>;
    selectedType?: string;
    onSelectType: (type?: string) => void;
}

export const WeaponTypeSelector = (props: WeaponTypeSelectorProps) => {
    const buildWeaponTypeButton = (type?: string, label?: string) => {
        const selected = props.selectedType === type;
        return <WeaponTypeButton key={type}
            variant={selected ? "contained" : "outlined"}
            color={selected ? "primary" : undefined}
            onClick={() => props.onSelectType(type)}>
            {label ?? type}
        </WeaponTypeButton>;
    }
    let {
        weaponTypes,
        selectedType,
        onSelectType,
        ...buttonProps } = props;
    return <Box p={2} mb={1} sx={{
        backgroundColor: colors.blueGrey[800],
        borderRadius: 2,
    }}>
        <Box pb={1} fontSize="16px">Weapon Types</Box>
        <WeaponTypeButtonContainer orientation="vertical" {...buttonProps} >
            {buildWeaponTypeButton(undefined, "All")}
            {weaponTypes ? [...weaponTypes].map((type) => buildWeaponTypeButton(type)) : null}
        </WeaponTypeButtonContainer>
    </Box>
}