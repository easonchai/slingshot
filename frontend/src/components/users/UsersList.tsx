import React from 'react';
import { Meeting } from '../../store/meetings/actions';
import { Loading } from '../../store/loading/actions';
import EtherService from '../../services/EtherService';
import { TabPanel } from '../panels/TabPanel';
import { AppBar, Button, Grid, Tab, Tabs, Typography, CircularProgress } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

const AttendanceButton = styled(Button)({
  backgroundColor: '#FE6B8B',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  minHeight: 38,
  maxHeight: 46,
  padding: '0 10px',
  fontSize: 12,
});

const LoadingSpinner = styled(CircularProgress)({
  color: '#FF8E53'
})

interface IProps {
  cachedMeeting: Meeting;
  userWallet: string;
  loading: Loading;

  dispatchHandleMarkAttendanceConfirmationLoading(status: boolean): void;
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
      confirmation => this.props.dispatchHandleMarkAttendanceConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchHandleMarkAttendance(this.props.cachedMeeting._id, participantWallet);
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

          <AppBar position="static" style={{ background: 'none', boxShadow: 'none', color: '#ff8140' }}>
            <Tabs value={this.state.tabIndex} onChange={this.handleTabSwitch} aria-label="simple tabs example">
              <Tab label="RSVP'D" value='rsvp' />
              <Tab label="CANCELLED" value='cancel' />
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
                      <Typography style={{ fontWeight: "normal", fontSize: 14, alignItems: 'center', justifyContent: 'center', }}>
                        {participantWallet}
                      </Typography><br />
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
                <Grid container>
                  <Grid item>
                    <LoadingSpinner size={16} style={{ marginTop: 5, marginRight: 5 }} />
                  </Grid>
                  <Grid item>
                    <Typography style={{ fontWeight: "normal", fontSize: 14, alignItems: 'center', justifyContent: 'center', }}>
                      {this.props.userWallet}
                    </Typography>
                  </Grid>
                </Grid>
                <br />
              </span>
            }

            {
              this.props.cachedMeeting.rsvp
                .map((participantWallet) => {
                  return (
                    <span key={participantWallet}>
                      <Grid container>
                        <Grid item>
                          {
                            this.props.loading.rsvpConfirmation &&
                            participantWallet === this.props.userWallet &&
                            <LoadingSpinner size={16} style={{ marginTop: 10, marginRight: 5 }} />
                          }
                        </Grid>
                        <Grid item>
                          <Typography style={{ fontWeight: "normal", fontSize: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginRight: 5 }}>
                            {participantWallet}
                          </Typography>
                        </Grid>
                        <Grid item>
                          {(this.props.cachedMeeting.data.isCancelled || this.props.cachedMeeting.data.isEnded) ||
                            this.props.userWallet === this.props.cachedMeeting.data.organizerAddress &&
                            !this.props.cachedMeeting.attend.includes(participantWallet) &&
                            !this.props.loading.rsvpConfirmation &&
                            <AttendanceButton disabled={false} onClick={this.handleAttendance} value={participantWallet} type="submit">
                              MARK ATTENDANCE
                            </AttendanceButton>
                          }
                        </Grid>
                      </Grid>
                      <br />
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
                      <Typography style={{ fontWeight: "normal", fontSize: 14, alignItems: 'center', justifyContent: 'center', }}>
                        {participantWallet}
                      </Typography><br />
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
                      <Typography style={{ fontWeight: "normal", fontSize: 14, alignItems: 'center', justifyContent: 'center', }}>
                        {participantWallet}
                      </Typography>
                      <br />
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
