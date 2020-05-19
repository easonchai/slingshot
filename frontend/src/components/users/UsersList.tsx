import React from 'react';
import { Button, CircularProgress, Grid } from '@material-ui/core';
import { Meeting } from '../../store/meetings/actions';
import { Loading } from '../../store/loading/actions';
import EtherService from '../../services/EtherService';

interface IProps {
  cachedMeeting: Meeting;
  userWallet: string;
  loading: Loading;

  dispatchHandleStartMeetingConfirmationLoading(status: boolean): void;
  dispatchHandleMarkAttendance(meetingAddress: string, userAddress: string): void;

  dispatchAddErrorNotification(message: String): void;
}

export class UsersList extends React.Component<IProps> {
  etherService: EtherService;

  constructor(props: any) {
    super(props);

    this.etherService = EtherService.getInstance();
    /**
     * TODO: Before every meaningful interaction with etherService,
     * validate that the meeting contract address is available.
     * Otherwise retrieve it from the known txHash (and persist in DB).
     */
  }

  handleAttendance = (event: any) => {
    this.etherService.markAttendance(
      this.props.cachedMeeting._id,
      this.props.userWallet,
      confirmation => this.props.dispatchHandleStartMeetingConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchHandleMarkAttendance(this.props.cachedMeeting._id, this.props.userWallet);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleAttendance: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleAttendance: ' + err);
      });
  }

  render() {
    return (
      <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            Participants
                </Grid>

          {
            // Simulate awaiting confirmation of RSVP cancellation (gray out + spinner)
            this.props.loading.rsvpCancellationConfirmation &&
            <Grid item key={this.props.userWallet} xs={12}>
              {this.props.userWallet}
              <CircularProgress />
            </Grid>
          }

          {
            this.props.cachedMeeting.rsvp
              .map((participantWallet) => {
                return (
                  <Grid item key={participantWallet} xs={12}>
                    {participantWallet}

                    {
                      this.props.loading.rsvpConfirmation &&
                      participantWallet === this.props.userWallet &&
                      <CircularProgress />
                    }

                    {
                      this.props.userWallet === this.props.cachedMeeting.data.organizerAddress &&
                      !this.props.cachedMeeting.attend.includes(participantWallet) &&
                      <Button disabled={false} onClick={this.handleAttendance} type="submit" variant="outlined" color="primary">
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
