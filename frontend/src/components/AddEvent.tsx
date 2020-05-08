import React from 'react';
import { History } from 'history';
import { Event } from '../store/events/actions';
import { Button, Container, Grid, TextField } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

interface IProps {
  history: History,
  events: Array<Event>;
  dispatchAddEvent(event: Event): void;
}

export class AddEvent extends React.Component<IProps> {
  state: any;

  constructor(props: any) {
    super(props);
    this.state = {
      date: null,
      time: null,
    };
  }

  handleSubmit = (event: any) => {
    event.preventDefault();

    this.props.dispatchAddEvent({
      name: event.target.eventName.value,
      stake: event.target.stakeAmount.value,
      maxParticipants: event.target.maxParticipants.value,
      startDate: this.state.date,
      startTime: this.state.time,
      location: event.target.location.value,
      description: event.target.description.value,
      isEnded: false,
      address: "0x0...0"
    });

    this.props.history.push('/');
  }

  handleDateChange = (d: any) => {
    this.setState({ date: d });
  };

  handleTimeChange = (t: any) => {
    this.setState({ time: t });
  };

  render() {
    return (
      <Container maxWidth={false}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          spacing={2}
        >
          <form onSubmit={this.handleSubmit} className='add-event-form'>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField required id="eventName" label="Event Name" />
              </Grid>

              <Grid item xs={12}>
                <TextField type="number" id="stakeAmount" label="Stake Amount (ETH)" defaultValue={0.05} />
              </Grid>

              <Grid item xs={12}>
                <TextField type="number" id="maxParticipants" label="Max participants" defaultValue={100} />
              </Grid>

              <Grid item xs={12}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={12}>
                  <KeyboardDatePicker
                    required={true}
                    margin="normal"
                    id="startDate"
                    label="Start Date"
                    format="MM/dd/yyyy"
                    value={this.state.date}
                    onChange={this.handleDateChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <KeyboardTimePicker
                    required={true}
                    margin="normal"
                    id="startTime"
                    label="Start Time"
                    value={this.state.time}
                    onChange={this.handleTimeChange}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              </Grid>

              <Grid item xs={12}>
                <TextField required id="location" label="Location" />
              </Grid>

              <Grid item xs={12}>
                <TextField id="description" label="Description" />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="outlined" color="primary">
                  Add new Event
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Container>
    );
  }
}
