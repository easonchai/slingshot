import React from 'react';
import { Typography, Container, Divider } from '@material-ui/core';

export default function footer() {
    return (
        <Container>
            <Divider style={{ marginTop: 100 }} />
            <Typography variant="subtitle1" align="center" color="textSecondary" component="p" style={{ padding: 30 }} >
                Slingshot 2020
            </Typography>
        </Container>
    )
}