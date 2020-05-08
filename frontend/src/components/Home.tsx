import React from 'react';
import { EventList } from './../containers/EventList';
import Grid from '@material-ui/core/Grid';

interface IProps {
}

export class Home extends React.Component<IProps> {
  render() {
    return (
      <Grid container className="events-list" spacing={4}>
        <EventList isEnded={false} />
        <EventList isEnded={true} />
      </Grid>
    );
  }
}
