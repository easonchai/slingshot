import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import { Loading } from '../../store/loading/actions';
import { UsersList } from '../../containers/users/UsersList';
import EtherService from '../../services/EtherService';
import HomeIcon from '@material-ui/icons/Home';
import { Button, CircularProgress, Container, Grid } from '@material-ui/core';

export interface IProps {
  id: String;
  user: User;
  cachedMeeting: Meeting;
  loading: Loading;
  
  dispatchGetCachedMeetingById(id: String): void;

  dispatchUpdateRSVP(meetingAddress: String, userAddress: String): Array<User>;
  dispatchUpdateRsvpCancellation(meetingAddress: String, userAddress: String): void;

  dispatchUpdateRsvpConfirmationLoading(status: Boolean): void;
  dispatchUpdateRsvpCancellationConfirmationLoading(status: Boolean): void;
}

export class MeetingView extends React.Component<IProps> {
  etherService: EtherService;

  constructor(props: any) {
    super(props);

    this.etherService = new EtherService();
   /**
     * TODO: Before every meaningful interaction with etherService,
     * validate that the meeting contract address is available.
     * Otherwise retrieve it from the known txHash (and persist in DB).
     */
  }
  
  componentWillMount() {
      this.props.dispatchGetCachedMeetingById(this.props.id);
  }

  componentDidMount() {
    // TODO: refactor
    this.etherService
      .requestConnection()
      .then((res: any) => {
        console.log(res);
        // TODO: update user
        // this.props.user = res;
      }, (reason: any) => {
        console.log(reason);
      })
      .catch((err: any) => {
        console.log(err);
      })
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
      console.log("reason rsvp ", reason);
      // TODO notify user
    })
    .catch((err: any) => {
      console.log("error rsvp ", err);
      // TODO notify user
    });
  }

  handleGetChange = (event: any) => {
    console.log(event);

    if (this.props.cachedMeeting) {
      // TODO: get user address
      
      this.etherService.getChange(
        this.props.cachedMeeting._id,
        this.callbackFn
      )
      .then((res: any) => {
				console.log("success get change ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
			}, (reason: any) => {
				console.log("reason get change ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error get change ", err);
				// TODO notify user
			});
    } else {
      // TODO: button disabled
    }
  }

  handleCancelEvent = (event: any) => {
    console.log(event);

    if (this.props.cachedMeeting) {
      // TODO: get user address
      
      this.etherService.eventCancel(
        this.props.cachedMeeting._id,
        this.callbackFn
      )
      .then((res: any) => {
				console.log("success cancel event ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
			}, (reason: any) => {
				console.log("reason cancel event ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error cancel event ", err);
				// TODO notify user
			});
    } else {
      // TODO: button disabled
    }
  }

  handleCancelRSVP = (event: any) => {
    this.etherService.guyCancel(
      this.props.cachedMeeting._id,
      confirmation => this.props.dispatchUpdateRsvpCancellationConfirmationLoading(false)
    )
    .then((res: any) => {
      this.props.dispatchUpdateRsvpCancellation(this.props.cachedMeeting._id, this.props.user._id);
    }, (reason: any) => {
      console.log("reason cancel rsvp ", reason);
      // TODO notify user
    })
    .catch((err: any) => {
      console.log("error cancel rsvp ", err);
      // TODO notify user
    });
  }

  handleStart = (event: any) => {
    console.log(event);

    if (this.props.cachedMeeting) {
      // TODO: get user address
      
      this.etherService.startEvent(
        this.props.cachedMeeting._id,
        this.callbackFn
      )
      .then((res: any) => {
				console.log("success start event ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
			}, (reason: any) => {
				console.log("reason start event ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error start event ", err);
				// TODO notify user
			});
    } else {
      // TODO: button disabled
    }
  }
  
  handleEnd = (event: any) => {
    console.log(event);

    if (this.props.cachedMeeting) {
      // TODO: get user address
      
      this.etherService.endEvent(
        this.props.cachedMeeting._id,
        this.callbackFn
      )
      .then((res: any) => {
				console.log("success endEvent ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
			}, (reason: any) => {
				console.log("reason endEvent ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error endEvent ", err);
				// TODO notify user
			});
    } else {
      // TODO: button disabled
    }
  }

  handleWithdraw = (event: any) => {
    console.log(event);

    if (this.props.cachedMeeting) {
      // TODO: get user address
      
      this.etherService.withdraw(
        this.props.cachedMeeting._id,
        this.callbackFn
      )
      .then((res: any) => {
				console.log("success withdraw ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
			}, (reason: any) => {
				console.log("reason withdraw ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error withdraw ", err);
				// TODO notify user
			});
    } else {
      // TODO: button disabled
    }
  }

  handleNextMeeting = (event: any) => {
    console.log(event);

    if (this.props.cachedMeeting) {
      // TODO: get user address
      
      this.etherService.nextMeeting(
        this.props.cachedMeeting._id,
        this.props.cachedMeeting.data.startDateTime,
        this.props.cachedMeeting.data.endDateTime,
        this.props.cachedMeeting.data.stake,
        this.props.cachedMeeting.data.maxParticipants,
        this.callbackFn
      )
      .then((res: any) => {
				console.log("success next meeting ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined
			}, (reason: any) => {
				console.log("reason next meeting ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error next meeting ", err);
				// TODO notify user
			});
    } else {
      // TODO: button disabled
    }
  }

  render() {
    const { cachedMeeting } = this.props;

    return (
      <div>
          {
            this.props.loading.cachedMeeting && cachedMeeting
              ? (
                <CircularProgress />
              )
              : (
                <div>
                  <div>Name: { cachedMeeting.data.name }</div>
                  <div>Stake: { cachedMeeting.data.stake }</div>
                  <div>Max participants: { cachedMeeting.data.maxParticipants }</div>
                  <div>Start time: { new Date(cachedMeeting.data.startDateTime * 1000).toUTCString() }</div>
                  <div>End time: { new Date(cachedMeeting.data.endDateTime * 1000).toUTCString() }</div>
                  <div>Location: { cachedMeeting.data.location }</div>
                  <div>Description: { cachedMeeting.data.description }</div>
                  <div>Organizer address: { cachedMeeting.data.organizerAddress }</div>
                  
                  {
                      this.props.loading.meetingDeployment
                      ? (
                        <div>Meeting tx: { cachedMeeting._id } <CircularProgress /></div>
                      )
                      : (
                        // display contract address
                        <div>Meeting contract: { cachedMeeting._id }</div>
                      )
                  }

                  <div>Deployer contract: { cachedMeeting.data.deployerContractAddress }</div>
                
                  <Container maxWidth={ false }>
                    <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={ 2 }>
                      <Grid container spacing={ 2 }>
                        {
                          // TODO: organize buttons per role (organizer / participant) and per state (active / finished meeting).
                        }

                        <Grid item xs={ 12 }>
                          <Link to='/'>
                            <Button>
                              <HomeIcon fontSize="large" color="primary" />
                            </Button>
                          </Link>
                          <Button disabled={ false } onClick={ this.handleRSVP } variant="outlined" color="primary">
                            RSVP
                          </Button>
                          <Button disabled={ false } onClick={ this.handleCancelRSVP } variant="outlined" color="primary">
                            CANCEL RSVP
                          </Button>
                          <Button disabled={ false } onClick={ this.handleGetChange } variant="outlined" color="primary">
                            GET CHANGE
                          </Button>
                          <Button disabled={ false } onClick={ this.handleWithdraw } variant="outlined" color="primary">
                            WITHDRAW PAYOUT
                          </Button>
                        </Grid>


                        <Grid item xs={ 12 }>
                          <Button disabled={ false } onClick={ this.handleCancelEvent } variant="outlined" color="primary">
                            CANCEL EVENT
                          </Button>
                          <Button disabled={ false } onClick={ this.handleStart } variant="outlined" color="primary">
                            START EVENT
                          </Button>
                          <Button disabled={ false } onClick={ this.handleEnd } variant="outlined" color="primary">
                            END EVENT
                          </Button>
                          <Button disabled={ false } onClick={ this.handleNextMeeting } variant="outlined" color="primary">
                            NEXT MEETING
                          </Button>
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