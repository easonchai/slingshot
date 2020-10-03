import React from 'react';
import { Link } from 'react-router-dom';
import { Proposal, User, Meeting, Loading } from '../../store/interfaces';
import { UsersList } from '../../containers/users/UsersList';
import EtherService from '../../services/EtherService';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Button, CircularProgress, Grid, CssBaseline, Typography, Box, Chip, CardMedia, Tooltip, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@material-ui/core';
import Header from '../Header';
import { styled } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FeedbackForm from '../FeedbackForm';
import Reviews from '../Reviews';
import Footer from '../Footer';
import { MediaDisplay } from '../MediaDisplay';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { History } from 'history';
import ViewProposal from '../panels/ViewProposal';

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

const CustButton = styled(Button)({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  minHeight: 46,
  maxHeight: 46,
  minWidth: 126,
  padding: '0 10px',
});

const HomeButton = styled(Button)({
  background: 'none',
  color: '#FF8E53',
  size: 10,
  marginBottom: 10,
})

const CustomChip = styled(Chip)({
  background: '#fcba03',
  color: 'white',
})

export interface IProps {
  history: History;
  id: String;
  user: User;
  cachedMeeting: Meeting;
  meetings: Meeting[];
  loading: Loading;

  dispatchGetAllMeetings(): void;
  dispatchGetCachedMeetingById(id: String): void;

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
  dispatchUpdateWithdraw(meetingAddress: string, userAddress: string): void;
  dispatchPauseMeeting(meetingAddress: String): void;
  dispatchAddMeetingProposal(meetingAddress: string, userAddress: string, proposal: Proposal): void;
  dispatchVoteMeetingProposal(meetingAddress: string, userAddress: string, proposal: Proposal): void;
  dispatchExecuteMeetingProposal(meetingAddress: string, userAddress: string, proposal: Proposal): void;
  dispatchAddErrorNotification(message: String): void;
}

interface IState {
  id: String;
  viewPanelOpen: boolean;
  createPanelOpen: boolean;
  proposalPanelOpen: boolean;
  isViewing: boolean;
  newAdmin: string;
  oldAdmin: string;
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
      id: this.props.id,
      viewPanelOpen: false,
      createPanelOpen: false,
      proposalPanelOpen: false,
      isViewing: true,
      newAdmin: '',
      oldAdmin: '',
    };
  }

  componentDidMount() {
    this.props.dispatchGetAllMeetings();
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
    if (this.props.cachedMeeting._id.length > 44) {
      this.props.dispatchAddErrorNotification('Failed to retrieve contract address! Please go back to home and create a new event!');
    } else {
      this.etherService.rsvp(
        this.props.cachedMeeting._id,
        this.props.cachedMeeting.data.stake,
        confirmation => this.props.dispatchUpdateRsvpConfirmationLoading(false)
      )
        .then((res: any) => {
          this.props.dispatchUpdateRSVP(this.props.cachedMeeting._id, this.props.user._id);
          this.props.history.go(0);
        }, (reason: any) => {
          // Code 4001 reflects MetaMask's rejection by user.
          // Hence we don't display it as an error.
          if (reason?.code !== 4001) {
            this.props.dispatchAddErrorNotification('Failed to RSVP: ' + reason);
            console.error(reason);
          }
        })
        .catch((err: any) => {
          this.props.dispatchAddErrorNotification('Failed to RSVP.');
          console.error(err);
        });
    }
  }

  handleGetChange = (event: any) => {
    this.etherService.getChange(
      this.props.cachedMeeting._id,
      this.callbackFn
    )
      .then((res: any) => {
        console.log("success get change ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
        this.props.dispatchUpdateWithdraw(this.props.cachedMeeting._id, this.props.user._id);
        this.props.history.go(0);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleGetChange: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleGetChange: ' + err);
      });
  }

  handleCancelEvent = (event: any) => {
    if (this.props.cachedMeeting._id.length > 44) {
      this.props.dispatchAddErrorNotification('Failed to retrieve contract address! Please go back to home and create a new event!');
    } else {
      this.etherService.eventCancel(
        this.props.cachedMeeting._id,
        confirmation => this.props.dispatchUpdateHandleCancelMeetingConfirmationLoading(false)
      )
        .then((res: any) => {
          this.props.dispatchUpdateHandleCancelMeeting(this.props.cachedMeeting._id);
        }, (reason: any) => {
          // Code 4001 reflects MetaMask's rejection by user.
          // Hence we don't display it as an error.
          if (reason?.code !== 4001) {
            this.props.dispatchAddErrorNotification("There was an error cancelling this event: " + reason);
            console.error(reason);
          }
        })
        .catch((err: any) => {
          this.props.dispatchAddErrorNotification('There was an error cancelling this event: ' + err);
          console.error(err);
        });
    }
  }

  handleCancelRSVP = (event: any) => {
    this.etherService.guyCancel(
      this.props.cachedMeeting._id,
      confirmation => this.props.dispatchUpdateRsvpCancellationConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchUpdateRsvpCancellation(this.props.cachedMeeting._id, this.props.user._id);
        this.props.history.go(0);
      }, (reason: any) => {
        // Code 4001 reflects MetaMask's rejection by user.
        // Hence we don't display it as an error.
        if (reason?.code !== 4001) {
          this.props.dispatchAddErrorNotification(`There was an error cancelling RSVP to this event: ` + reason);
          console.error(reason);
        }
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification(`There was an error cancelling RSVP to this event: ` + err);
        console.error(err);
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
        // Code 4001 reflects MetaMask's rejection by user.
        // Hence we don't display it as an error.
        if (reason?.code !== 4001) {
          this.props.dispatchAddErrorNotification('There was an error starting this event: ' + reason);
          console.error(reason);
        }
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('There was an error starting this event: ' + err);
        console.error(err);
      });
  }

  handleEnd = (event: any) => {
    this.etherService.endEvent(
      this.props.cachedMeeting._id,
      this.props.cachedMeeting.data.attend.slice(),
      confirmation => { console.log(confirmation); this.props.dispatchUpdateHandleEndMeetingConfirmationLoading(false) }
    )
      .then((res: any) => {
        this.props.dispatchUpdateHandleEndMeeting(this.props.cachedMeeting._id);
      }, (reason: any) => {
        // Code 4001 reflects MetaMask's rejection by user.
        // Hence we don't display it as an error.
        if (reason?.code !== 4001) {
          this.props.dispatchAddErrorNotification('There was an error ending this event: ' + reason);
          console.error(reason);
        }
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('There was an error ending this event: ' + err);
        console.error(err);
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
        this.props.dispatchUpdateWithdraw(this.props.cachedMeeting._id, this.props.user._id);
        this.props.history.go(0);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleWithdraw: ' + reason);
        console.log("withdraw: ", reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleWithdraw: ' + err);
        console.log("withdraw: ", err);
      });
  }

  handleCreateProposal = (event: any) => {
    let tempNewArr: string[] = [];
    let tempOldArr: string[] = [];

    let splitNew = this.state.newAdmin.split(",");
    if (!this.state.oldAdmin) {
      tempOldArr = ["0x0000000000000000000000000000000000000000"]
    } else {
      let splitOld = this.state.oldAdmin.split(",");
      splitOld.map((unprocessedData: string) => tempOldArr.push(unprocessedData.trim()));
    }

    splitNew.map((unprocessedData: string) => tempNewArr.push(unprocessedData.trim()));

    this.etherService.proposeAdminChange(
      this.props.cachedMeeting.data.clubAddress,
      this.props.cachedMeeting._id,
      tempNewArr,
      tempOldArr,
      this.callbackFn
    )
      .then((res: any) => {
        let proposalId = 1;

        if (this.props.cachedMeeting.proposals) {
          proposalId = this.props.cachedMeeting.proposals.length + 1;
        }

        let proposal = {
          created: (new Date()).getTime(),
          id: {
            clubAddress: "",
            meetingAddress: this.props.cachedMeeting._id,
            index: proposalId
          },
          newAdmin: tempNewArr,
          oldAdmin: tempOldArr,
          votes: [],
          state: "Active",
        }
        // TODO: add loading animation while we wait for callback / TX to be mined
        this.props.dispatchAddMeetingProposal(this.props.cachedMeeting._id, this.props.user._id, proposal);
        this.handleCreateProposalPane();
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleCreateProposal: ' + reason);
        console.log("proposal: ", reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleCreateProposal: ' + err);
        console.log("proposal: ", err);
      });
  }

  handleProposalDataChange = (event: any) => {
    if (event.target.id === "new_address") {
      this.setState({
        ...this.state,
        newAdmin: event.target.value
      })
    } else {
      this.setState({
        ...this.state,
        oldAdmin: event.target.value
      })
    }
  }

  isUserLoggedOut = () => {
    return this.props.user._id === '';
  }

  getStateTooltipText = () => {
    if (!this.props.user.data.rsvp.includes(this.props.cachedMeeting._id))
      return `Stake required: ${this.props.cachedMeeting.data.stake} ETH`;

    if (this.isUserLoggedOut())
      return 'Please login to MetaMask first.';
  }

  getRSVPButtonTooltipText = () => {
    return this.getStateTooltipText() || 'You have already registered for this event';
  }

  getStartEventButtonTooltipText = () => {
    if (this.props.cachedMeeting.data.isStarted)
      return `The event was already started.`;

    if (this.props.cachedMeeting.data.isEnded)
      return `You can't start an ended event .`;

    if (this.props.cachedMeeting.data.isCancelled)
      return `You can't start a cancelled event.`;

    if ((new Date()) < new Date(this.props.cachedMeeting.data.startDateTime * 1000))
      return `You can't start an event before its official Start time.`;

    if (new Date() > new Date(this.props.cachedMeeting.data.endDateTime * 1000))
      return `You can't start an event after its official End time.`;

    if (this.props.cachedMeeting.data.rsvp.length >= 1)
      return 'Ready to start?';

    return `You can't start an event with no participants!`;
  }

  getEndEventButtonTooltipText = () => {
    if (this.props.cachedMeeting.data.isEnded)
      return `The event was already ended.`;

    if (!this.props.cachedMeeting.data.isStarted)
      return `You can't end an event that hasn't started yet.`;

    if (this.props.cachedMeeting.data.isCancelled)
      return `You can't end a cancelled event.`;

    if (this.props.cachedMeeting.data.attend.length === 0)
      return `You can't end an event without attendees.`;

    if (new Date() < new Date(this.props.cachedMeeting.data.endDateTime * 1000))
      return `You can't end an event before its official End time.`;

    if (this.props.cachedMeeting.data.rsvp.length > 0)
      return `Ready to end? Don't forget to mark all attendees first!`;

    return `Ready to end?`;
  }

  getCancelEventButtonTooltipText = () => {
    if (this.props.cachedMeeting.data.isCancelled)
      return `The event was already cancelled.`;

    if (this.props.cachedMeeting.data.isEnded)
      return `You can't cancel an ended event.`;

    if (this.props.cachedMeeting.data.isStarted)
      return `You can't cancel a started event.`;

    return `Good luck next time!`;
  }

  getCancelRsvpButtonTooltipText = () => {
    if (this.props.cachedMeeting.data.isEnded)
      return `Cannot cancel RSVP of the ended event.`;

    if (this.props.cachedMeeting.data.isCancelled)
      return `Cannot cancel RSVP of the cancelled event.`;

    if (this.props.cachedMeeting.data.isStarted)
      return `Cannot cancel RSVP of the started event.`;

    if (this.props.user.data.cancel.includes(this.props.cachedMeeting._id))
      return `You've already cancelled your RSVP.`;

    return `Sorry to see you go!`;
  }

  getWithdrawButtonTooltipText = () => {
    if (this.props.user.data.withdraw.includes(this.props.cachedMeeting._id))
      return `You have already withdrawn.`;

    if (!this.props.cachedMeeting.data.isCancelled && !this.props.cachedMeeting.data.isEnded)
      return `You can only withdraw from cancelled or ended events.`;

    if (this.props.cachedMeeting.data.isEnded && !this.props.cachedMeeting.data.parent)
      return `You cannot withdraw from the very first (ended) event in the series.`;

    return `You've earned it!`;
  }

  handleViewProposalPane = (state: boolean) => {
    this.setState(prevState => ({
      ...this.state,
      isViewing: state,
      viewPanelOpen: !prevState.viewPanelOpen,
    }))
  }

  handleCreateProposalPane = () => {
    this.setState(prevState => ({
      ...this.state,
      proposalPanelOpen: !prevState.proposalPanelOpen,
    }))
  }

  handlePauseMeeting = () => {
    const today = new Date();
    const pauseUntil = Math.floor((today.getTime() / 1000) + 601200);

    this.etherService.pause(
      this.props.cachedMeeting.data.clubAddress,
      this.props.cachedMeeting._id,
      pauseUntil,
      this.callbackFn
    )
      .then((res: any) => {
        console.log("success pause ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
        this.props.dispatchPauseMeeting(this.props.cachedMeeting._id);
        // this.props.history.go(0);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handlePauseMeeting: ' + reason);
        console.log("pause: ", reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handlePauseMeeting: ' + err);
        console.log("pause: ", err);
      });
  }


  render() {
    const { cachedMeeting } = this.props;
    const { parent, child } = cachedMeeting.data;
    const imageUrl = cachedMeeting.data.images[0] ? 'https://siasky.net/' + cachedMeeting.data.images[0] : 'https://siasky.net/nAGUnU56g96yjdeMpjHnh37LXnIDGWw2pCyb4--wGdy1FQ';
    const videoUrl = 'https://siasky.net/' + cachedMeeting.data.videos[0];
    const started = cachedMeeting.data.isStarted
    const cancelled = cachedMeeting.data.isCancelled
    const ended = cachedMeeting.data.isEnded
    const status = this.props.loading.meetingDeployment ? "Deploying" : this.props.cachedMeeting.data.isPaused ? "Paused" : started ? (ended ? "Ended" : "Started") : (cancelled ? "Cancelled" : "Active")

    const prevMeetingAddress = cachedMeeting.data.parent;
    const prevMeeting = this.props.meetings.find(m => {
      return m._id === prevMeetingAddress;
    });

    // active events
    let payoutPool = 0.0;
    let estimatedPayout = 0.0;

    // ended events
    let totalStaked = 0.0;
    let individualPayout = 0.0;

    const totalRegisteredNow = cachedMeeting.data.rsvp.length + cachedMeeting.data.attend.length + cachedMeeting.data.withdraw.length;
    const eligibleRegisteredNow = cachedMeeting.data.attend.length + cachedMeeting.data.withdraw.length;
    // ended events
    totalStaked = cachedMeeting.data.stake * totalRegisteredNow;
    individualPayout = eligibleRegisteredNow ? totalStaked / eligibleRegisteredNow : 0.0;

    if (prevMeeting) {
      const totalRegisteredPrev = prevMeeting.data.rsvp.length + prevMeeting.data.attend.length + prevMeeting.data.withdraw.length;

      // active events
      payoutPool = prevMeeting.data.stake * totalRegisteredPrev;
      individualPayout = eligibleRegisteredNow ? payoutPool / eligibleRegisteredNow : 0.0;

      estimatedPayout = totalRegisteredNow ? payoutPool / totalRegisteredNow : 0.0;
    }

    const isRSVPButtonDisabled = () => {
      return cachedMeeting.data.isEnded || cachedMeeting.data.isCancelled || this.props.user.data.rsvp.includes(cachedMeeting._id) || this.props.user.data.attend.includes(cachedMeeting._id) || this.props.user.data.withdraw.includes(cachedMeeting._id)
        || cachedMeeting.data.rsvp.length === cachedMeeting.data.maxParticipants;
    }

    const isCancelRSVPButtonDisabled = () => {
      return cachedMeeting.data.isStarted || cachedMeeting.data.isEnded || cachedMeeting.data.isCancelled || this.props.user.data.cancel.includes(cachedMeeting._id);
    }

    const isUserPartOfMeeting = () => {
      return this.props.user.data.rsvp.includes(cachedMeeting._id) || this.props.user.data.attend.includes(cachedMeeting._id) || this.props.user.data.withdraw.includes(cachedMeeting._id);
    }

    const isWithdrawButtonDisabled = () => {
      if (this.props.user.data.withdraw.includes(cachedMeeting._id))
        return true;

      if (this.props.cachedMeeting.data.isCancelled)
        return false;

      if (this.props.cachedMeeting.data.isEnded && !this.props.cachedMeeting.data.parent)
        return true;

      return false;
    }

    const isWithdrawButtonVisible = () => {
      return cachedMeeting.data.isCancelled || cachedMeeting.data.isEnded;
    }

    const isUserAnOrganiser = () => {
      return (cachedMeeting.data.organizerAddress === this.props.user._id);
    }

    const isStartButtonDisabled = () => {
      return cachedMeeting.data.isStarted || cachedMeeting.data.isEnded || cachedMeeting.data.isCancelled || cachedMeeting.data.rsvp.length === 0 || (new Date()) < new Date(cachedMeeting.data.startDateTime * 1000) || (new Date()) > new Date(cachedMeeting.data.endDateTime * 1000);
    }

    const isEndButtonDisabled = () => {
      return cachedMeeting.data.isEnded || cachedMeeting.data.isCancelled || !cachedMeeting.data.isStarted || this.props.cachedMeeting.data.attend.length === 0 || (new Date()) < new Date(cachedMeeting.data.endDateTime * 1000);
    }

    const isCancelButtonDisabled = () => {
      return cachedMeeting.data.isEnded || cachedMeeting.data.isCancelled || cachedMeeting.data.isStarted;
    }

    return (
      <React.Fragment>
        <ViewProposal isViewing={this.state.isViewing} open={this.state.viewPanelOpen} meeting={this.props.cachedMeeting}
          userAddress={this.props.user._id} dispatchExecuteMeetingProposal={this.props.dispatchExecuteMeetingProposal} dispatchVoteMeetingProposal={this.props.dispatchVoteMeetingProposal}
        />
        <CssBaseline />
        <Dialog
          open={this.state.proposalPanelOpen}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Create Proposals"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Enter the address of the new admin to be proposed and old admin to be removed.
            </DialogContentText>
            <TextField
              autoFocus margin="dense" id="new_address" label="New Admin (separated by comma)" type="text" fullWidth value={this.state.newAdmin}
              onChange={(e) => this.handleProposalDataChange(e)}
            />
            <TextField
              autoFocus margin="dense" id="old_address" label="Remove Admin (separated by comma)" type="text"
              fullWidth value={this.state.oldAdmin} onChange={(e) => this.handleProposalDataChange(e)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCreateProposal} color="primary">
              Propose
            </Button>
            <Button onClick={this.handleCreateProposalPane} color="primary" autoFocus>
              Exit
            </Button>
          </DialogActions>
        </Dialog>
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
                <Grid item container xs={12} md={6}>
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
                    {cachedMeeting.data.videos.length > 0 ?
                      <MediaDisplay imageUrl={imageUrl} videoUrl={videoUrl} /> :
                      <MediaDisplay imageUrl={imageUrl} videoUrl={""} />
                    }
                    <br />
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
                {/**RIGHT SIDE */}
                <Grid item container xs={12} md={6}>
                  <Grid item xs={1} />
                  <Grid item xs={10}>
                    <Typography component="div"><br />
                      <Box fontSize={18} fontWeight="medium">
                        Status: {<CustomChip
                          size="small"
                          label={status}
                          color="primary"
                          style={status === "Deploying" ? { background: "#2094f3" } :
                            status === "Active" ? { opacity: 20 } :
                              status === "Started" ? { background: "#4cae4f" } :
                                status === "Ended" ? { background: "#ff9900" } :
                                  status === "Paused" ? { background: "#e66e07" } :
                                    { background: "#f44034" }}
                        />}
                      </Box><br />
                      {/* User actions */}
                      {this.props.loading.meetingDeployment ||
                        <React.Fragment>
                          <Grid item container style={{ padding: 10 }}>
                            <Grid item xs={6} sm={4}>
                              <Tooltip title={this.getRSVPButtonTooltipText()}>
                                <span>
                                  <CustButton size="small" onClick={this.handleRSVP} disabled={isRSVPButtonDisabled()}                                >
                                    {
                                      this.props.user.data.rsvp.includes(cachedMeeting._id) ||
                                        this.props.user.data.attend.includes(cachedMeeting._id) ||
                                        this.props.user.data.withdraw.includes(cachedMeeting._id)
                                        ? "RSVP'd"
                                        : "RSVP"
                                    }
                                  </CustButton>
                                </span>
                              </Tooltip>
                            </Grid>
                            {isUserPartOfMeeting() ?
                              (<React.Fragment>
                                <Grid item xs={6} sm={4}>
                                  <Tooltip title={this.getCancelRsvpButtonTooltipText()}>
                                    <span>
                                      <CustButton
                                        disabled={isCancelRSVPButtonDisabled()}
                                        size="small"
                                        onClick={this.handleCancelRSVP}>
                                        Cancel
                                      </CustButton>
                                    </span>
                                  </Tooltip>
                                </Grid>
                                {isWithdrawButtonVisible() ?
                                  <Tooltip title={this.getWithdrawButtonTooltipText()}>
                                    <span>
                                      <Grid item xs={6} sm={4}>
                                        <CustButton disabled={isWithdrawButtonDisabled()}
                                          size="small" onClick={cachedMeeting.data.isEnded ? this.handleWithdraw : this.handleGetChange}>
                                          Withdraw
                                        </CustButton>
                                      </Grid>
                                    </span>
                                  </Tooltip>
                                  : <div />
                                }
                              </React.Fragment>)
                              : (<div></div>)}
                          </Grid><br />
                          {/** Payout Details*/}
                          {status === "Ended" ?
                            (<Grid container>
                              <Grid item xs={6}>
                                <Typography component="div"> <br />
                                  <Box fontSize="body2.fontSize">Total Staked in Pool: </Box>
                                  <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                                    {totalStaked.toFixed(4) + " ETH"}
                                  </Box><br />
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography component="div"> <br />
                                  <Box fontSize="body2.fontSize">Individual Payout: </Box>
                                  <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                                    {individualPayout.toFixed(4) + " ETH"}
                                  </Box><br />
                                </Typography>
                              </Grid>
                            </Grid>)
                            :
                            (<Grid container>
                              <Grid item xs={6}>
                                <Typography component="div"> <br />
                                  <Box fontSize="body2.fontSize">Payout Pool: </Box>
                                  <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                                    {payoutPool.toFixed(4) + " ETH"}
                                  </Box><br />
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography component="div"> <br />
                                  <Box fontSize="body2.fontSize">Estimated Individual Payout: </Box>
                                  <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                                    {estimatedPayout.toFixed(4) + " ETH"}
                                  </Box><br />
                                </Typography>
                              </Grid>
                            </Grid>)}

                          {/** Organizer Actions */}
                          {!isUserAnOrganiser() ||
                            <React.Fragment>
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
                                  <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                    <Tooltip title={this.getStartEventButtonTooltipText()}>
                                      <span>
                                        <CustButton
                                          disabled={isStartButtonDisabled()}
                                          onClick={this.handleStart}>
                                          Start Event
                                        </CustButton>
                                      </span>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                    <Tooltip title={this.getEndEventButtonTooltipText()}>
                                      <span>
                                        <CustButton
                                          disabled={isEndButtonDisabled()}
                                          onClick={this.handleEnd}>
                                          End Event
                                        </CustButton>
                                      </span>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                    <Tooltip title={this.getCancelEventButtonTooltipText()}>
                                      <span>
                                        <CustButton
                                          disabled={isCancelButtonDisabled()}
                                          onClick={this.handleCancelEvent}>
                                          Cancel Event
                                        </CustButton>
                                      </span>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                    <Link style={{ textDecoration: 'none' }} to={'/meeting/create/' + this.props.id}>
                                      <CustButton>New Event</CustButton>
                                    </Link>
                                  </Grid>

                                  <Grid item xs={12} style={{ marginTop: 10 }}>
                                    <Divider />
                                    <ExpansionPanel style={{ boxShadow: 'none' }}>
                                      <ExpansionPanelSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                      >
                                        <Typography style={{ fontWeight: "lighter", fontSize: 16, padding: 10 }}>
                                          Governance Functions
                                        </Typography>
                                      </ExpansionPanelSummary>
                                      <ExpansionPanelDetails>
                                        <Grid container>
                                          <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                            <Tooltip title="Pause Event">
                                              <span>
                                                <CustButton
                                                  disabled={this.props.cachedMeeting.data.isPaused}
                                                  onClick={this.handlePauseMeeting}>
                                                  Pause Event
                                                </CustButton>
                                              </span>
                                            </Tooltip>
                                          </Grid>
                                          <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                            <Tooltip title={this.props.cachedMeeting.data.isPaused ? "Execute proposal to unpause event" : "Event is not paused!"}>
                                              <span>
                                                <CustButton
                                                  disabled={!this.props.cachedMeeting.data.isPaused || this.props.cachedMeeting.proposals.length === 0}
                                                  onClick={() => this.handleViewProposalPane(false)}>
                                                  Unpause Event
                                                </CustButton>
                                              </span>
                                            </Tooltip>
                                          </Grid>
                                          <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                            <Tooltip title="Create a proposal">
                                              <span>
                                                <CustButton
                                                  onClick={() => { this.handleCreateProposalPane() }}>
                                                  Create Proposal
                                                </CustButton>
                                              </span>
                                            </Tooltip>
                                          </Grid>
                                          <Grid item md={6} lg={3} style={{ padding: 10 }}>
                                            <Tooltip title="View proposals">
                                              <span>
                                                <CustButton onClick={() => this.handleViewProposalPane(true)}>View Proposals</CustButton>
                                              </span>
                                            </Tooltip>
                                          </Grid>
                                        </Grid>
                                      </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                  </Grid>
                                </Grid>
                                {/** TO DO BUTTON (GOVERNANCE) */}

                              </Paper><br />
                            </React.Fragment>}
                          <Box fontSize="subtitle1.fontSize" fontWeight="fontWeightLight">
                            Participants Registered: {cachedMeeting.data.rsvp.length + cachedMeeting.data.attend.length + cachedMeeting.data.withdraw.length}/{cachedMeeting.data.maxParticipants}
                          </Box><br />
                        </React.Fragment>}
                    </Typography>

                    <UsersList history={this.props.history} />
                  </Grid>
                  <Grid item xs={1} />
                </Grid>

                {/** Feedback Form + Reviews */}
                <Grid item container xs={12} style={{ marginTop: 20 }}>
                  <FeedbackForm />
                  <Reviews />
                </Grid>
                <Footer />
              </Grid>
            )
        }

      </React.Fragment>
    );
  }
}
