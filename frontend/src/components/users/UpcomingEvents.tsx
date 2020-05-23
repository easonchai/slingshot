import React from 'react';
import { Paper, Container, Typography, Box, Link } from '@material-ui/core';

export default function UpcomingEvents() {
    return (
        <Link href="https://hackmoney-project.ew.r.appspot.com/meeting/">
            <Paper>
                <Container>
                    <Typography component="div">
                        <Box fontSize={14} fontWeight="normal" lineHeight={3}>
                            Supposed to be events here
                        </Box>
                    </Typography>
                </Container>
            </Paper>
        </Link>
    )
}