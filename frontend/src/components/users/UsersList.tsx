import React from 'react';
import { Meeting } from '../../store/meetings/actions';
import { Loading } from '../../store/loading/actions';
import EtherService from '../../services/EtherService';
import { TabPanel } from '../panels/TabPanel';
import { AppBar, Button, Container, Grid, Tab, Tabs, Tooltip, Typography, CircularProgress, Chip } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import BeenhereIcon from '@material-ui/icons/Beenhere';
import CancelIcon from '@material-ui/icons/Cancel';
import EventSeatIcon from '@material-ui/icons/EventSeat';

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

    this.state = { tabIndex: 'all' };
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
        // Code 4001 reflects MetaMask's rejection by user.
        // Hence we don't display it as an error.
        if (reason?.code !== 4001) {
          this.props.dispatchAddErrorNotification('There was an error marking an attendee: ' + reason);
          console.error(reason);
        }
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('There was an error marking an attendee: ' + err);
        console.error(err);
      });
  }

  handleTabSwitch = (event: React.ChangeEvent<{}>, newValue: string) => {
    this.setState({ tabIndex: newValue });
  };

  getMarkAttendanceButtonTooltipText = (participantWallet: string) => {
    if (this.props.loading.rsvpConfirmation)
      return `Please hold on until the RSVP transaction confirms.`;

    if (this.props.cachedMeeting.attend.includes(participantWallet))
      return `Already marked as attendee.`;

    if (!this.props.cachedMeeting.data.isStarted)
      return `You can't mark attendees before the start of the event.`;

    if (this.props.cachedMeeting.data.isEnded)
      return `You can't mark attendees after the end of the event.`;

    return '';
  }

  isMarkAttendanceButtonDisabled = (participantWallet: string) => {
    return this.props.loading.rsvpConfirmation
      || this.props.cachedMeeting.attend.includes(participantWallet)
      || !this.props.cachedMeeting.data.isStarted
      || this.props.cachedMeeting.data.isEnded
  }

  componentDidMount() {

  }

  render() {
    const participants = [
      ...this.props.cachedMeeting.withdraw.map(p => {
        return { address: p, status: 'WITHDRAWN' };
      }),
      ...this.props.cachedMeeting.attend.map(p => {
        return { address: p, status: 'ATTENDED' };
      }),
      ...this.props.cachedMeeting.rsvp.map(p => {
        return { address: p, status: `RSVP'D` };
      }),
      ...this.props.cachedMeeting.cancel.map(p => {
        return { address: p, status: 'CANCELLED' };
      })
    ];


    return (
      <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
        <Grid container spacing={2}>

          <AppBar position="static" style={{ background: 'none', boxShadow: 'none', color: '#ff8140' }}>
            <Tabs value={this.state.tabIndex} onChange={this.handleTabSwitch} aria-label="simple tabs example">
              <Tab label="Participants" value='all' />
            </Tabs>
          </AppBar>

          {
            // TODO: render the view of individual tab content in a separate component.
          }

          <TabPanel value={this.state.tabIndex} index={'all'}>
            {
              participants
                .map(p => {
                  return (
                    <span key={p.address}>
                      <Grid container xs={12} style={{ marginBottom: 15 }}>
                        {
                          this.props.userWallet === this.props.cachedMeeting.data.organizerAddress &&
                          <Grid item>
                            <Tooltip title={this.getMarkAttendanceButtonTooltipText(p.address)}>
                              <span>
                                <AttendanceButton
                                  disabled={this.isMarkAttendanceButtonDisabled(p.address)}
                                  onClick={this.handleAttendance}
                                  value={p.address}
                                  type="submit">
                                  MARK ATTENDANCE
                                  </AttendanceButton>
                              </span>
                            </Tooltip>
                          </Grid>
                        }
                        <Grid item style={{ paddingLeft: 15, marginTop: 5 }}>
                          <Chip
                            size="small"
                            label={p.status}
                            color="primary"
                            style={p.status === "RSVP'D" ? { background: '#2094f3' } :
                              p.status === "ATTENDED" ? { background: "#4cae4f" } :
                                p.status === "WITHDRAWN" ? { background: "#ff9900" } : { background: "#f44034" }}
                            icon={p.status === "RSVP'D" ? <EventSeatIcon /> :
                              p.status === "ATTENDED" ? <BeenhereIcon /> :
                                p.status === "WITHDRAWN" ? <CheckCircleIcon /> : <CancelIcon />}
                          />

                        </Grid>
                        <Grid item xs={6} style={{ paddingLeft: 15, marginTop: 5 }}>
                          {p.address}
                        </Grid>

                      </Grid>
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
                        {
                          this.props.userWallet === this.props.cachedMeeting.data.organizerAddress &&
                          <Grid item>
                            <Tooltip title={this.getMarkAttendanceButtonTooltipText(participantWallet)}>
                              <span>
                                <AttendanceButton
                                  disabled={this.isMarkAttendanceButtonDisabled(participantWallet)}
                                  onClick={this.handleAttendance}
                                  value={participantWallet}
                                  type="submit">
                                  MARK ATTENDANCE
                                  </AttendanceButton>
                              </span>
                            </Tooltip>
                          </Grid>
                        }
                      </Grid>
                      <br />
                    </span>
                  );
                })
            }
          </TabPanel>


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
