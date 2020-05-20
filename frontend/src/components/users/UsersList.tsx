import React from 'react';
import { Meeting } from '../../store/meetings/actions';
import { Loading } from '../../store/loading/actions';
import EtherService from '../../services/EtherService';
import { TabPanel } from '../panels/TabPanel';
import { AppBar, Button, Grid, Tab, Tabs } from '@material-ui/core';

interface IProps {
  cachedMeeting: Meeting;
  userWallet: string;
  loading: Loading;

  dispatchHandleStartMeetingConfirmationLoading(status: boolean): void;
  dispatchHandleMarkAttendance(meetingAddress: string, userAddress: string): void;

  dispatchAddErrorNotification(message: String): void;
}

interface IState {
  tabIndex: string;
}

export class UsersList extends React.Component<IProps, IState> {
  etherService: EtherService;

  constructor(props: any) {
    super(props);

    this.etherService = EtherService.getInstance();
    /**
     * TODO: Before every meaningful interaction with etherService,
     * validate that the meeting contract address is available.
     * Otherwise retrieve it from the known txHash (and persist in DB).
     */

    this.state = { tabIndex: 'rsvp' };
  }

  handleAttendance = (event: any) => {
    const participantWallet = event.currentTarget.value;

    this.etherService.markAttendance(
      this.props.cachedMeeting._id,
      participantWallet,
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

  handleTabSwitch = (event: React.ChangeEvent<{}>, newValue: string) => {
    this.setState({ tabIndex: newValue });
  };

  render() {
    return (
      <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            Participants
          </Grid>

          <AppBar position="static">
            <Tabs value={this.state.tabIndex} onChange={this.handleTabSwitch} aria-label="simple tabs example">
              <Tab label="CANCELLED" value='cancel' />
              <Tab label="RSVPED" value='rsvp' />
              <Tab label="ATTENDED" value='attend' />
              <Tab label="WITHDRAWN" value='withdraw' />
            </Tabs>
          </AppBar>

          {
            // TODO: render the view of individual tab content in a separate component.
          }

          <TabPanel value={this.state.tabIndex} index={'cancel'}>
            {
              this.props.cachedMeeting.cancel
                .map((participantWallet) => {
                  return (
                    <span key={participantWallet}>
                      {participantWallet}
                    </span>
                  );
                })
            }
          </TabPanel>

          <TabPanel value={this.state.tabIndex} index={'rsvp'}>
            {
              // Simulate awaiting confirmation of RSVP cancellation (gray out + spinner)
              // TODO: switch tabindex to 'cancel' upon confirmation
              this.props.loading.rsvpCancellationConfirmation &&
              <span key={this.props.userWallet}>
                Cancelling ... {this.props.userWallet}
              </span>
            }

            {
              this.props.cachedMeeting.rsvp
                .map((participantWallet) => {
                  return (
                    <span key={participantWallet}>
                      {
                        this.props.loading.rsvpConfirmation &&
                        participantWallet === this.props.userWallet &&
                        'RSVPing ... '
                      }

                      {participantWallet}

                      {
                        this.props.userWallet === this.props.cachedMeeting.data.organizerAddress &&
                        !this.props.cachedMeeting.attend.includes(participantWallet) &&
                        !this.props.loading.rsvpConfirmation &&
                        <Button disabled={false} onClick={this.handleAttendance} value={participantWallet} type="submit" variant="outlined" color="primary">
                          MARK ATTENDANCE
                        </Button>
                      }
                    </span>
                  );
                })
            }
          </TabPanel>

          <TabPanel value={this.state.tabIndex} index={'attend'}>
            {
              this.props.cachedMeeting.attend
                .map((participantWallet) => {
                  return (
                    <span key={participantWallet}>
                      {participantWallet}
                    </span>
                  );
                })
            }
          </TabPanel>

          <TabPanel value={this.state.tabIndex} index={'withdraw'}>
            {
              this.props.cachedMeeting.withdraw
                .map((participantWallet) => {
                  return (
                    <span key={participantWallet}>
                      {participantWallet}
                    </span>
                  );
                })
            }
          </TabPanel>

        </Grid>
      </Grid>
    );
  }
}
