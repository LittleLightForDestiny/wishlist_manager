
import { Box, Button, Container, Typography } from "@material-ui/core";
import {Link as RouterLink} from 'react-router-dom';
import React from "react";

export const Welcome = () => {
    return (
        <Container maxWidth="xs">
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ height: "100vh" }}>
                <Button size="large" variant="contained" color="secondary" fullWidth component={RouterLink} to="/wishlist/new">
                    <Typography>Create new wishlist</Typography>
                </Button>
                <Box mb={1}></Box>
                <Button size="large" variant="contained" color="secondary" fullWidth component={RouterLink} to="/wishlist/import">
                    <Typography>Import wishlist</Typography>
                </Button>
                <Box mb={1}></Box>
                <Button size="large" variant="contained" color="secondary" fullWidth component={RouterLink} to="/wishlist/load">
                    <Typography>Load wishlist</Typography>
                </Button>
            </Box>
        </Container>);
};