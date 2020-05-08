import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../store/events/actions';
import HomeIcon from '@material-ui/icons/Home';
import { Button, Container, Grid, TextField } from '@material-ui/core';

export interface IProps {
  event: Event;
}

export class ViewEvent extends React.Component<IProps> {
  render() {
    return (
      <div>
        <Link to='/'>
          <HomeIcon fontSize="large" color="primary" />
        </Link>

        <Container maxWidth={false}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            spacing={2}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField disabled id="eventName" label={this.props.event.name} />
              </Grid>

              <Grid item xs={12}>
                <TextField disabled type="number" id="stakeAmount" label="Stake Amount (ETH)" defaultValue={this.props.event.stake} />
              </Grid>

              <Grid item xs={12}>
                <TextField disabled type="number" id="maxParticipants" label="Max participants" defaultValue={this.props.event.maxParticipants} />
              </Grid>

              <Grid item xs={12}>

              </Grid>

              <Grid item xs={12}>
                <TextField disabled required id="location" label="Location" defaultValue={this.props.event.location} />
              </Grid>

              <Grid item xs={12}>
                <TextField disabled id="description" label="Description" defaultValue={this.props.event.description} />
              </Grid>

              <Grid item xs={12}>
                <Button disabled={true} type="submit" variant="outlined" color="primary">
                  RSVP
                </Button>
                <Button disabled={true} type="submit" variant="outlined" color="primary">
                  START
                </Button>
                <Button disabled={true} type="submit" variant="outlined" color="primary">
                  END
                </Button>
                <Button disabled={true} type="submit" variant="outlined" color="primary">
                  WITHDRAW
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </div>
    );
  }
}