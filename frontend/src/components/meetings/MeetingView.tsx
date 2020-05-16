import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import { Loading } from '../../store/loading/actions';
import { UsersList } from '../../containers/users/UsersList';
import EtherService from '../../services/EtherService';
import HomeIcon from '@material-ui/icons/Home';
import { Button, Container, Grid } from '@material-ui/core';

export interface IProps {
  id: String;
  user: User;
  cachedMeeting: Meeting;
  loading: Loading;
  dispatchGetCachedMeetingById(id: String): void;
  dispatchUpdateRSVP(meetingAddress: String, user: User): Array<User>;
}

export class MeetingView extends React.Component<IProps> {
  etherService: EtherService;

  constructor(props: any) {
    super(props);

		this.etherService = new EtherService();
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
    /**
     * TODO: validate that the meeting contract address is available.
     * Otherwise retrieve it from the known txHash (and persist in DB).
     */
    this.etherService.rsvp(
      this.props.cachedMeeting._id,
      this.props.cachedMeeting.data.stake,
      this.callbackFn
    )
    .then((res: any) => {
      console.log("success rsvp ", res);
      // TODO: add loading animation while we wait for callback / TX to be mined
      this.props.dispatchUpdateRSVP(this.props.cachedMeeting._id, this.props.user);
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
      this.callbackFn
    )
    .then((res: any) => {
      console.log("success cancel rsvp ", res);
      // TODO: add loading animation while we wait for callback / TX to be mined
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
    console.log("rend",this.props.cachedMeeting)
    return (
      <div>
          {
            this.props.loading.cachedMeetingLoaded
              ? (
                // TODO: replace by reusable loading component
                <div>Loading</div>
              )
              : (
                <div>
                  <div>Name: { this.props.cachedMeeting.data.name }</div><br />
                  <div>Stake: {this.props.cachedMeeting.data.stake}</div><br />
                  <div>Max participants: {this.props.cachedMeeting.data.maxParticipants}</div><br />
                  <div>Start time: { new Date(this.props.cachedMeeting.data.startDateTime * 1000).toUTCString() }</div><br />
                  <div>End time: { new Date(this.props.cachedMeeting.data.endDateTime * 1000).toUTCString() }</div><br />
                  <div>Location: { this.props.cachedMeeting.data.location }</div><br />
                  <div>Description: { this.props.cachedMeeting.data.description }</div><br />
                  <div>Organizer address: { this.props.cachedMeeting.data.organizerAddress }</div><br />
                  <div>Meeting contract: { this.props.cachedMeeting._id }</div><br />
                  <div>Deployer contract: { this.props.cachedMeeting.data.deployerContractAddress }</div><br />
                


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