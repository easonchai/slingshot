import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import { UsersList } from '../../containers/users/UsersList';
import EtherService from '../../services/EtherService';
import HomeIcon from '@material-ui/icons/Home';
import { Button, Container, Grid, TextField } from '@material-ui/core';

export interface IProps {
  user: User;
  meeting: Meeting | undefined;
  dispatchGetAllMeetings(): void;
  dispatchUpdateRSVP(meetingAddress: string, user: User): Array<User>;
}

export class MeetingView extends React.Component<IProps> {
  etherService: EtherService;

  constructor(props: any) {
    super(props);

		this.etherService = new EtherService();
  }
  
  componentWillMount() {
    /**
     * TODO: In order for people to share direct links to meeting details page,
     * we need to synchronize router path to correct redux store,
     * or at least lazy load requested meeting instead of all the meetings.
     */
    this.props.dispatchGetAllMeetings();
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
    console.log(event);

    if (this.props.meeting) {
      this.etherService.rsvp(
        this.props.meeting.meetingAddress,
        this.props.meeting.stake,
        this.callbackFn
      )
      .then((res: any) => {
				console.log("success rsvp ", res);
        // TODO: add loading animation while we wait for callback / TX to be mined

        if (this.props.meeting) {
          //this.props.meeting.users = this.props.dispatchUpdateRSVP(this.props.meeting.meetingAddress, this.props.user);
        } else {
          // TODO: fix undefined type
        }
			}, (reason: any) => {
				console.log("reason rsvp ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error rsvp ", err);
				// TODO notify user
			});
    } else {
      // TODO: RSVP button disabled
    }
  }

  handleGetChange = (event: any) => {
    console.log(event);

    if (this.props.meeting) {
      // TODO: get user address
      
      this.etherService.getChange(
        this.props.meeting.meetingAddress,
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

    if (this.props.meeting) {
      // TODO: get user address
      
      this.etherService.eventCancel(
        this.props.meeting.meetingAddress,
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
    console.log(event);

    if (this.props.meeting) {
      // TODO: get user address
      
      this.etherService.guyCancel(
        this.props.meeting.meetingAddress,
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
    } else {
      // TODO: button disabled
    }
  }

  handleStart = (event: any) => {
    console.log(event);

    if (this.props.meeting) {
      // TODO: get user address
      
      this.etherService.startEvent(
        this.props.meeting.meetingAddress,
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

    if (this.props.meeting) {
      // TODO: get user address
      
      this.etherService.endEvent(
        this.props.meeting.meetingAddress,
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

    if (this.props.meeting) {
      // TODO: get user address
      
      this.etherService.withdraw(
        this.props.meeting.meetingAddress,
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

    if (this.props.meeting) {
      // TODO: get user address
      
      this.etherService.nextMeeting(
        this.props.meeting.meetingAddress,
        this.props.meeting.startDateTime,
        this.props.meeting.endDateTime,
        this.props.meeting.stake,
        this.props.meeting.maxParticipants,
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
    return (
      <div>
        <Link to='/'>
          <HomeIcon fontSize="large" color="primary" />
        </Link>

        { 
          typeof this.props.meeting === 'undefined'
            // TODO: replace by a Loading animation in case no meetings have been loaded yet
            ? ('Something went wrong retrieving the correct Meeting. Please try again.')
            : (
              <Container maxWidth={ false }>
                <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={ 2 }>
                  <Grid container spacing={ 2 }>
                    <Grid item xs={ 12 }>
                      <TextField disabled id="meetingName" label={ this.props.meeting.name } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled type="number" id="stakeAmount" label="Stake Amount (ETH)" defaultValue={ this.props.meeting.stake } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled type="number" id="maxParticipants" label="Max participants" defaultValue={ this.props.meeting.maxParticipants } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="startTime" label="Start time" defaultValue={ new Date(this.props.meeting.startDateTime * 1000) } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="endTime" label="End time" defaultValue={ new Date(this.props.meeting.endDateTime * 1000) } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="location" label="Location" defaultValue={ this.props.meeting.location } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="description" label="Description" defaultValue={ this.props.meeting.description } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="organizer" label="Organizer" defaultValue={ this.props.meeting.organizerAddress } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="meetingAddress" label="Meeting Contract Address" defaultValue={ this.props.meeting.meetingAddress } />
                    </Grid>

                    <Grid item xs={ 12 }>
                      <TextField disabled id="deployerContractAddress" label="Deployer Contract Address" defaultValue={ this.props.meeting.deployerContractAddress } />
                    </Grid>

                    {
                      // TODO: disable buttons when needed
                    }
                    <Grid item xs={ 12 }>
                      <Button disabled={ false } onClick={ this.handleRSVP } variant="outlined" color="primary">
                        RSVP
                      </Button>
                      <Button disabled={ false } onClick={ this.handleGetChange } variant="outlined" color="primary">
                        GET CHANGE
                      </Button>
                      <Button disabled={ false } onClick={ this.handleCancelEvent } variant="outlined" color="primary">
                        CANCEL EVENT
                      </Button>
                      <Button disabled={ false } onClick={ this.handleCancelRSVP } variant="outlined" color="primary">
                        CANCEL RSVP
                      </Button>
                      <Button disabled={ false } onClick={ this.handleStart } variant="outlined" color="primary">
                        START
                      </Button>
                      <Button disabled={ false } onClick={ this.handleEnd } variant="outlined" color="primary">
                        END
                      </Button>
                      <Button disabled={ false } onClick={ this.handleWithdraw } variant="outlined" color="primary">
                        WITHDRAW
                      </Button>
                      <Button disabled={ false } onClick={ this.handleNextMeeting } variant="outlined" color="primary">
                        NEXT MEETING
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>

                <UsersList meeting={ this.props.meeting } />
              </Container>
            )
        }
      </div>
    );
  }
}