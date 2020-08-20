import React from 'react';
import { Meeting } from '../../store/meetings/actions';
import { Loading } from '../../store/loading/actions';
import EtherService from '../../services/EtherService';
import { TabPanel } from '../panels/TabPanel';
import { AppBar, Button, Grid, Tab, Tabs, Tooltip, Typography, CircularProgress, Chip, Box } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import BeenhereIcon from '@material-ui/icons/Beenhere';
import CancelIcon from '@material-ui/icons/Cancel';
import EventSeatIcon from '@material-ui/icons/EventSeat';
import { History } from 'history';

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
  history: History;
  cachedMeeting: Meeting;
  userWallet: string;
  loading: Loading;

  dispatchHandleMarkAttendanceConfirmationLoading(status: boolean): void;
  dispatchHandleMarkAttendance(meetingAddress: string, userAddress: string): void;

  dispatchAddErrorNotification(message: String): void;
}

interface IState {
  tabIndex: string;
  participants: Array<any>;
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

    this.state = { tabIndex: 'all', participants: [] };
  }

  componentDidMount() {
    this.props.cachedMeeting.withdraw.map(p => {
      this.etherService.findENSDomain(p, (domain: string) => this.setState({ participants: [...this.state.participants, { address: p, ens: domain, status: 'WITHDRAWN' }] }))
      return null;
    });

    this.props.cachedMeeting.attend.map(p => {
      this.etherService.findENSDomain(p, (domain: string) => { this.setState({ participants: [...this.state.participants, { address: p, ens: domain, status: 'ATTENDED' }] }) })
      return null;
    });

    this.props.cachedMeeting.rsvp.map(p => {
      this.etherService.findENSDomain(p, (domain: string) => this.setState({ participants: [...this.state.participants, { address: p, ens: domain, status: `RSVP'D` }] }))
      return null;
    });

    this.props.cachedMeeting.cancel.map(p => {
      this.etherService.findENSDomain(p, (domain: string) => this.setState({ participants: [...this.state.participants, { address: p, ens: domain, status: 'CANCELLED' }] }))
      return null;
    });
  }

  handleAttendance = (event: any) => {
    const participantWallet = event.currentTarget.value;
    this.props.dispatchHandleMarkAttendance(this.props.cachedMeeting._id, participantWallet);
    this.props.history.go(0);
  };

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

  isUserOrganizer = () => {
    return this.props.userWallet === this.props.cachedMeeting.data.organizerAddress;
  }

  render() {
    const participants = this.state.participants;

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
              this.props.loading.rsvpCancellationConfirmation || this.props.loading.rsvpConfirmation ?
                <Grid container>
                  <Grid item>
                    <LoadingSpinner size={16} style={{ marginTop: 5, marginRight: 5 }} />
                  </Grid>
                  <Typography style={{ fontWeight: "lighter", fontSize: 12, fontStyle: 'italic' }}>Please wait while the transaction is being mined</Typography>
                </Grid>
                :
                participants
                  .map(p => {
                    return (
                      <span key={p.address}>
                        <Grid container xs={12} style={{ marginBottom: 15 }}>
                          {
                            this.isUserOrganizer() &&
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
                          <Grid item style={{ paddingLeft: 15, marginTop: 5 }}>
                            <Typography component="div">
                              {p.ens ?
                                <Box fontSize={16} fontWeight="fontWeightLight">
                                  {p.ens}
                                </Box>
                                :
                                <Box fontSize={this.isUserOrganizer() ? 14 : 16} fontWeight="fontWeightLight">
                                  {p.address}
                                </Box>
                              }
                            </Typography>
                          </Grid>

                        </Grid>
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
