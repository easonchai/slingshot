import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import { Loading } from '../../store/loading/actions';
import { UsersList } from '../../containers/users/UsersList';
import { NotificationList } from '../../containers/notifications/NotificationList';
import EtherService from '../../services/EtherService';
import HomeIcon from '@material-ui/icons/Home';
import { Button, CircularProgress, Container, Grid } from '@material-ui/core';
import Header from '../Header'

export interface IProps {
  id: String;
  user: User;
  cachedMeeting: Meeting;
  loading: Loading;

  dispatchGetCachedMeetingById(id: String): void;

  dispatchUpdateUserEthereumAddress(userAddress: String): void;

  dispatchUpdateRSVP(meetingAddress: String, userAddress: String): Array<User>;
  dispatchUpdateRsvpCancellation(meetingAddress: String, userAddress: String): void;

  dispatchUpdateRsvpConfirmationLoading(status: Boolean): void;
  dispatchUpdateRsvpCancellationConfirmationLoading(status: Boolean): void;

  dispatchUpdateHandleStartMeetingConfirmationLoading(status: Boolean): void;
  dispatchUpdateHandleStartMeeting(meetingAddress: String): void;
  dispatchUpdateHandleEndMeeting(meetingAddress: string): void;
  dispatchUpdateHandleEndMeetingConfirmationLoading(status: boolean): void;
  dispatchUpdateHandleCancelMeeting(meetingAddress: string): void;
  dispatchUpdateHandleCancelMeetingConfirmationLoading(status: boolean): void;

  dispatchAddErrorNotification(message: String): void;
}

interface IState {
  id: String;
}

export class MeetingView extends React.Component<IProps, IState> {
  etherService: EtherService;

  constructor(props: any) {
    super(props);

    this.etherService = EtherService.getInstance();
    /**
      * TODO: Before every meaningful interaction with etherService,
      * validate that the meeting contract address is available.
      * Otherwise retrieve it from the known txHash (and persist in DB).
      */

    this.state = {
      id: this.props.id
    };
  }

  componentDidMount() {
    this.props.dispatchGetCachedMeetingById(this.props.id);
  }

  componentDidUpdate() {
    if (this.state.id !== this.props.id) {
      this.props.dispatchGetCachedMeetingById(this.props.id);
      this.setState({ id: this.props.id });
    }
  }

  callbackFn = (result: any) => {
    console.log("cb fn ", result);
  }

  handleRSVP = (event: any) => {
    this.etherService.rsvp(
      this.props.cachedMeeting._id,
      this.props.cachedMeeting.data.stake,
      confirmation => this.props.dispatchUpdateRsvpConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchUpdateRSVP(this.props.cachedMeeting._id, this.props.user._id);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleRSVP: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleRSVP: ' + err);
      });
  }

  handleGetChange = (event: any) => {
    this.etherService.getChange(
      this.props.cachedMeeting._id,
      this.callbackFn
    )
      .then((res: any) => {
        console.log("success get change ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleGetChange: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleGetChange: ' + err);
      });
  }

  handleCancelEvent = (event: any) => {
    this.etherService.eventCancel(
      this.props.cachedMeeting._id,
      confirmation => this.props.dispatchUpdateHandleCancelMeetingConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchUpdateHandleCancelMeeting(this.props.cachedMeeting._id);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleCancelEvent: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleCancelEvent: ' + err);
      });
  }

  handleCancelRSVP = (event: any) => {
    this.etherService.guyCancel(
      this.props.cachedMeeting._id,
      confirmation => this.props.dispatchUpdateRsvpCancellationConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchUpdateRsvpCancellation(this.props.cachedMeeting._id, this.props.user._id);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleCancelRSVP: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleCancelRSVP: ' + err);
      });
  }

  handleStart = (event: any) => {
    this.etherService.startEvent(
      this.props.cachedMeeting._id,
      confirmation => this.props.dispatchUpdateHandleStartMeetingConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchUpdateHandleStartMeeting(this.props.cachedMeeting._id);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleStart: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleStart: ' + err);
      });
  }

  handleEnd = (event: any) => {
    this.etherService.endEvent(
      this.props.cachedMeeting._id,
      confirmation => { console.log(confirmation); this.props.dispatchUpdateHandleEndMeetingConfirmationLoading(false) }
    )
      .then((res: any) => {
        this.props.dispatchUpdateHandleEndMeeting(this.props.cachedMeeting._id);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleEnd: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleEnd: ' + err);
      });
  }

  handleWithdraw = (event: any) => {
    this.etherService.withdraw(
      this.props.cachedMeeting._id,
      this.callbackFn
    )
      .then((res: any) => {
        console.log("success withdraw ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleWithdraw: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleWithdraw: ' + err);
      });
  }

  render() {
    const { cachedMeeting } = this.props;
    const { parent, child } = cachedMeeting.data;

    return (
      <div>
        <Header />
        {
          this.props.loading.cachedMeeting && cachedMeeting
            ? (
              <CircularProgress />
            )
            : (
              <div>
                <div>Name: {cachedMeeting.data.name}</div>
                <div>Is cancelled: {String(cachedMeeting.data.isCancelled)}</div>
                <div>Is started: {String(cachedMeeting.data.isStarted)}</div>
                <div>Is ended: {String(cachedMeeting.data.isEnded)}</div>
                <div>Stake: {cachedMeeting.data.stake}</div>
                <div>Max participants: {cachedMeeting.data.maxParticipants}</div>
                <div>Start time: {new Date(cachedMeeting.data.startDateTime * 1000).toUTCString()}</div>
                <div>End time: {new Date(cachedMeeting.data.endDateTime * 1000).toUTCString()}</div>
                <div>Location: {cachedMeeting.data.location}</div>
                <div>Description: {cachedMeeting.data.description}</div>
                <div>Organizer address: {cachedMeeting.data.organizerAddress}</div>

                {
                  this.props.loading.meetingDeployment
                    ? (
                      <div>Meeting tx: { cachedMeeting._id} <CircularProgress /></div>
                    )
                    : (
                      // display contract address
                      <div>Meeting contract: { cachedMeeting._id}</div>
                    )
                }

                <div>Deployer contract: {cachedMeeting.data.deployerContractAddress}</div>

                <Container maxWidth={false}>
                  <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
                    <Grid container spacing={2}>
                      {
                        // TODO: organize buttons per role (organizer / participant) and per state (active / finished meeting).
                      }

                      <Grid item xs={12}>
                        <Link to='/'>
                          <Button>
                            <HomeIcon fontSize="large" color="primary" />
                          </Button>
                        </Link>
                        <Button disabled={false} onClick={this.handleRSVP} variant="outlined" color="primary">
                          RSVP
                          </Button>
                        <Button disabled={false} onClick={this.handleCancelRSVP} variant="outlined" color="primary">
                          CANCEL RSVP
                          </Button>
                        <Button disabled={false} onClick={this.handleGetChange} variant="outlined" color="primary">
                          GET CHANGE
                          </Button>
                        <Button disabled={false} onClick={this.handleWithdraw} variant="outlined" color="primary">
                          WITHDRAW PAYOUT
                          </Button>
                      </Grid>


                      <Grid item xs={12}>
                        <Button disabled={false} onClick={this.handleCancelEvent} variant="outlined" color="primary">
                          CANCEL EVENT
                          </Button>
                        <Button disabled={false} onClick={this.handleStart} variant="outlined" color="primary">
                          START EVENT
                          </Button>
                        <Button disabled={false} onClick={this.handleEnd} variant="outlined" color="primary">
                          END EVENT
                          </Button>
                        <Link style={{ textDecoration: 'none' }} to={'/meeting/create/' + this.props.id}>
                          <Button disabled={false} variant="outlined" color="primary">
                            NEW MEETING
                          </Button>
                        </Link>
                      </Grid>

                      <Grid item xs={12}>
                        <Link style={{ textDecoration: 'none' }} to={'/meeting/' + parent}>
                          <Button disabled={parent === ''} variant="outlined" color="primary">
                            PREVIOUS MEETING
                          </Button>
                        </Link>
                        <Link style={{ textDecoration: 'none' }} to={'/meeting/' + child}>
                          <Button disabled={child === ''} variant="outlined" color="primary">
                            NEXT MEETING
                          </Button>
                        </Link>
                      </Grid>
                    </Grid>
                  </Grid>

                  <UsersList />
                </Container>
              </div>
            )
        }
      </div>
    );
  }
}