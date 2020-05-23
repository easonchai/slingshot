import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import { Loading } from '../../store/loading/actions';
import { UsersList } from '../../containers/users/UsersList';
import EtherService from '../../services/EtherService';
import HomeIcon from '@material-ui/icons/Home';
import { Button, CircularProgress, Container, Grid, CssBaseline, Typography, Box, Chip, CardMedia, Tooltip, Paper } from '@material-ui/core';
import Header from '../Header';
import { styled } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Footer from '../Footer'

const Center = styled(Box)({
  display: 'flex',
  height: '100%',
  width: '100%',
  position: 'fixed',
  alignItems: 'center',
  justifyContent: 'center',
})

const LoadingSpinner = styled(CircularProgress)({
  color: '#FF8E53'
})

const CardImage = styled(CardMedia)({
  paddingTop: '56.25%',
})

const CustButton = styled(Button)({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  minHeight: 38,
  maxHeight: 46,
  padding: '0 30px',
});

const HomeButton = styled(Button)({
  background: 'none',
  color: '#FF8E53',
  size: 10,
  marginBottom: 10,
})

const CustomChip = styled(Chip)({
  background: '#ff9800',
  color: 'white',
})

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

  isUserLoggedOut = () => {
    return this.props.user._id === '';
  }

  getStateTooltipText = () => {
    if (!this.props.user.rsvp.includes(this.props.cachedMeeting._id))
      return `Stake required: ${this.props.cachedMeeting.data.stake} ETH`;

    // if (this.state.loadingVideo)
    //   return 'Please wait until the video has been uploaded.';

    if (this.isUserLoggedOut())
      return 'Please login to MetaMask first.';
  }

  getRSVPButtonTooltipText = () => {
    return this.getStateTooltipText() || 'You have already registered for this event';
  }

  getUploadButtonTooltipText = () => {
    return this.getStateTooltipText() || 'This will start the upload right away and replace previous file.';
  }

  render() {
    const { cachedMeeting } = this.props;
    const { parent, child } = cachedMeeting.data;
    const imageUrl = 'https://siasky.net/' + cachedMeeting.data.images[0] || 'https://siasky.net/nAGUnU56g96yjdeMpjHnh37LXnIDGWw2pCyb4--wGdy1FQ';
    console.log(imageUrl)
    const started = cachedMeeting.data.isStarted
    const cancelled = cachedMeeting.data.isCancelled
    const ended = cachedMeeting.data.isEnded
    const status = started ? (ended ? "Ended" : "Started") : (cancelled ? "Cancelled" : "Active")

    return (
      <React.Fragment>
        <CssBaseline />
        <Header />
        {
          this.props.loading.cachedMeeting && cachedMeeting
            ? (
              <Center display='flex'>
                <LoadingSpinner size={80} />
              </Center>) :
            (
              <Grid container>
                <Grid item xs={12}><br /></Grid>
                <Grid item container xs={6}>
                  <Grid item xs={1} />
                  <Grid item xs={10}>
                    <Link to='/' style={{ textDecoration: "none" }}>
                      <HomeButton startIcon={<ArrowBackIcon />}>
                        Back to home
                    </HomeButton>
                    </Link>
                    <Typography variant="h3">
                      {cachedMeeting.data.name}
                    </Typography>
                    {
                      this.props.loading.meetingDeployment
                        ? (<span><LoadingSpinner size={16} /> <Typography style={{ fontWeight: "lighter", fontSize: 12, fontStyle: 'italic' }}>Please wait while the contract is being deployed</Typography></span>)
                        : (<div />)
                    }
                    <Typography component="div"> <br />
                      <Box fontSize="body2.fontSize">Event Starts: </Box>
                      <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                        {(new Date(cachedMeeting.data.startDateTime * 1000)).toString()}
                      </Box><br />
                      <Box fontSize="body2.fontSize">Event Ends: </Box>
                      <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                        {(new Date(cachedMeeting.data.endDateTime * 1000)).toString()}
                      </Box><br />
                    </Typography>
                    <CardImage
                      image={imageUrl}
                      title={cachedMeeting.data.name}
                    /><br />
                    <Typography component="div">
                      <Box fontSize="body2.fontSize">Location:</Box>
                      <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                        {cachedMeeting.data.location}
                      </Box>
                      <br />
                      <Box fontSize={24} fontWeight="medium">
                        Description:
                      </Box><br />
                      <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                        {cachedMeeting.data.description}
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={1} />
                </Grid>
                <Grid item container xs={6}>
                  <Grid item xs={10}>
                    <Typography component="div"><br />
                      <Box fontSize={18} fontWeight="medium">
                        Status: {<CustomChip
                          size="small"
                          label={status}
                          color="primary"
                          style={status === "Active" ? { opacity: 20 } :
                            status === "Started" ? { background: "green" } :
                              status === "Ended" ? { background: "orange" } : { background: "red" }}
                        />}
                      </Box><br />
                      {/* User actions */}
                      <Grid item container style={{ padding: 10, marginLeft: 15 }}>
                        <Grid item xs={3}>
                          <Tooltip title={this.getUploadButtonTooltipText()}>
                            <CustButton
                              size="small" onClick={this.handleRSVP}
                              disabled={this.props.user.rsvp.includes(cachedMeeting._id)}
                              style={this.props.user.rsvp.includes(cachedMeeting._id) ? { background: 'linear-gradient(45deg, #ff9eb4 30%, #ffb994 90%)' } :
                                { background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}>
                              {this.props.user.rsvp.includes(cachedMeeting._id) ? "RSVP'd" : "RSVP"}
                            </CustButton>
                          </Tooltip>
                        </Grid>
                        {this.props.user.rsvp.includes(cachedMeeting._id)
                          ? (<React.Fragment>
                            <Grid item xs={3}>
                              <CustButton size="small" onClick={this.handleCancelRSVP}>
                                Cancel
                            </CustButton>
                            </Grid>
                            {cachedMeeting.data.isEnded ?
                              (<Grid item xs={3}>
                                <CustButton size="small" onClick={this.handleWithdraw}>
                                  Withdraw
                                  </CustButton>
                              </Grid>)
                              : <div />
                            }
                          </React.Fragment>)
                          : (<div></div>)}
                      </Grid><br />
                      {/** Organizer Actions */}
                      <Paper style={{ padding: 10 }}>
                        <Grid container>
                          <Grid item xs={12}>
                            <Typography style={{ fontWeight: "lighter", fontSize: 16, marginTop: 10, marginLeft: 10 }}>
                              Hey organizer!
                          </Typography>
                            <Typography style={{ fontWeight: "lighter", fontSize: 16, padding: 10 }}>
                              Check out what you can do!
                          </Typography>
                          </Grid>
                          <Grid item xs={3} style={{ padding: 10 }}>
                            <CustButton onClick={this.handleStart}>Start Event</CustButton>
                          </Grid>
                          <Grid item xs={3} style={{ padding: 10 }}>
                            <CustButton onClick={this.handleEnd}>End Event</CustButton>
                          </Grid>
                          <Grid item xs={3} style={{ padding: 10 }}>
                            <CustButton onClick={this.handleCancelEvent}>Cancel Event</CustButton>
                          </Grid>
                          <Grid item xs={3} style={{ padding: 10 }}>
                            <Link style={{ textDecoration: 'none' }} to={'/meeting/create/' + this.props.id}>
                              <CustButton>New Event</CustButton>
                            </Link>
                          </Grid>
                        </Grid>
                      </Paper><br />
                      <Box fontSize="subtitle1.fontSize" fontWeight="fontWeightLight">
                        Participants Registered: {cachedMeeting.rsvp.length}/{cachedMeeting.data.maxParticipants}
                      </Box><br />
                    </Typography>
                    <UsersList />
                  </Grid>
                  <Grid item xs={1} />
                </Grid>
                <Footer />
              </Grid>
            )
        }

        {/* <div>
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
        </div> */}

      </React.Fragment>
    );
  }
}