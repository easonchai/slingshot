import React from 'react';
import { Button, CircularProgress, Grid } from '@material-ui/core';
import { Meeting } from '../../store/meetings/actions';
import { Loading } from '../../store/loading/actions';

interface IProps {
    cachedMeeting: Meeting,
    userWallet: string,
    loading: Loading
}

export class UsersList extends React.Component<IProps> {
  render() {
    return (
        <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={ 2 }>
            <Grid container spacing={ 2 }>
                <Grid item xs={ 12 }>
                    Participants
                </Grid>

                {
                    // Simulate awaiting confirmation of RSVP cancellation (gray out + spinner)
                    this.props.loading.rsvpCancellationConfirmation &&
                            <Grid item key={ this.props.userWallet } xs={ 12 }>
                                { this.props.userWallet }
                                <CircularProgress />
                            </Grid>
                }

                {
                    this.props.cachedMeeting.rsvp
                        .map((participantWallet) => {
                            return (
                                <Grid item key={ participantWallet } xs={ 12 }>
                                    { participantWallet }

                                    {
                                        this.props.loading.rsvpConfirmation &&
                                            participantWallet === this.props.userWallet &&
                                                <CircularProgress />
                                    }

                                    {
                                        this.props.userWallet === this.props.cachedMeeting.data.organizerAddress &&
                                            <Button disabled={ false } type="submit" variant="outlined" color="primary">
                                                MARK ATTENDANCE
                                            </Button>
                                    }
                                </Grid> 
                            );
                        })
                }
            </Grid>
        </Grid>
    );
  }
}
