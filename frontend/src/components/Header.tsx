import React from 'react';
import ProfileBar from './ProfileBar';
import { NotificationList } from '../containers/notifications/NotificationList';
import { Grid } from '@material-ui/core';

export default function Header() {
    return (
        <Grid container>
            <ProfileBar />
            <NotificationList />
        </Grid>
    );
}
