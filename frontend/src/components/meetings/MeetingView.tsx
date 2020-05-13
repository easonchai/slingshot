import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/types';
import HomeIcon from '@material-ui/icons/Home';
import { Button, Container, Grid, TextField } from '@material-ui/core';

export interface IProps {
  meeting: Meeting | undefined;
}

export class MeetingView extends React.Component<IProps> {
  render() {
    return (
      <div>
        <Link to='/'>
          <HomeIcon fontSize="large" color="primary" />
        </Link>

        { 
          typeof this.props.meeting === 'undefined'
            ? ('Something went wrong retrieving the correct Meeting. Please try again.')
            : (
              <Container maxWidth={ false }>
                <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={ 2 }>
                  <Grid container spacing={ 2 }>
                    <Grid item xs={ 12 }>
                      <TextField disabled id="meetingName" label={ this.props.meeting.name } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled type="number" id="stakeAmount" label="Stake Amount (ETH)" defaultValue={ this.props.meeting.stake } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled type="number" id="maxParticipants" label="Max participants" defaultValue={ this.props.meeting.maxParticipants } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="startTime" label="Start time" defaultValue={ new Date(this.props.meeting.startDateTime * 1000) } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="endTime" label="End time" defaultValue={ new Date(this.props.meeting.endDateTime * 1000) } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="location" label="Location" defaultValue={ this.props.meeting.location } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="description" label="Description" defaultValue={ this.props.meeting.description } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="organizer" label="Organizer" defaultValue={ this.props.meeting.organizerAddress } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="deployerContractAddress" label="Deployer Contract Address" defaultValue={ this.props.meeting.deployerContractAddress } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <Button disabled={ true } type="submit" variant="outlined" color="primary">
                        RSVP
                      </Button>
                      <Button disabled={ true } type="submit" variant="outlined" color="primary">
                        START
                      </Button>
                      <Button disabled={ true } type="submit" variant="outlined" color="primary">
                        END
                      </Button>
                      <Button disabled={ true } type="submit" variant="outlined" color="primary">
                        WITHDRAW
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Container>
            )
        }
      </div>
    );
  }
}