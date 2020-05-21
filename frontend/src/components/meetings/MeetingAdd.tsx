import React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'history';
import { Meeting, GroupHashAndAddress, ModelType } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import EtherService from '../../services/EtherService';
import { Button, Container, Grid, TextareaAutosize, TextField, Tooltip, CssBaseline, Typography, InputAdornment } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import { NotificationList } from '../../containers/notifications/NotificationList';
import { styled } from '@material-ui/core/styles';

const Hero = styled(Container)({
	margin: 0,
	background: 'white',
	padding: '30px 80px',
	height: '200px',
})

const Middle = styled(Grid)({
	padding: '60px 20px'
})

const MyButton = styled(Button)({
	background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
	border: 0,
	borderRadius: 3,
	boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
	color: 'white',
	height: 48,
	padding: '0 10px',
	width: 140,
});

const Test = styled(Grid)({
	border: '2px solid black',
})

interface IProps {
	history: History;
	parent: string;
	user: User;
	cachedMeeting: Meeting;

	dispatchCreateFirstMeeting(history: History, payload: Meeting): void;
	dispatchUpdateMeetingContractAddress(history: History, payload: GroupHashAndAddress): void;
	dispatchUpdateOrganiserEthereumAddress(organiserAddress: string): void;
	dispatchAddErrorNotification(message: String): void;

	dispatchCreateNextMeeting(history: History, meting: Meeting): void;
}

interface IState {
	/**
	 * Local `form` state is simply used to keep track of necessary <form> element changes.
	 * TODO: transition to central cachedMeeting state.
	 */
	form: {
		startDate: any,
		startTime: any,
		endDate: any,
		endTime: any
	}
}

export class MeetingAdd extends React.Component<IProps, IState> {
	stakeInputProps: any;
	etherService: EtherService;

	constructor(props: any) {
		super(props);

		/**
		 * Pre-fill starting time to current time +24 hours.
		 * Pre-fill ending time to current time +25 hours (1 hour meeting).
		 * Round time up to the next full hour.
		 */
		const msInAnHour = 60 * 60 * 1000;
		const currentTime = new Date().getTime();
		const currentRoundedTime = currentTime + msInAnHour - currentTime % msInAnHour;
		const startTime = currentRoundedTime + 24 * msInAnHour;
		const endTime = startTime + msInAnHour;

		this.state = {
			form: {
				startDate: new Date(startTime),
				startTime: new Date(startTime),
				endDate: new Date(endTime),
				endTime: new Date(endTime)
			}
		};

		/**
		 * HTML input element attributes for type=number used to decorate stake amount field.
		 */
		this.stakeInputProps = {
			min: 0.001,
			step: 0.001,
		};

		this.etherService = EtherService.getInstance();
	}

	accChangeCallback = (accounts: string[]) => {
		console.log(accounts[0]);
		this.props.dispatchUpdateOrganiserEthereumAddress(accounts[0]);
	}

	chainChangeCallback = (chainID: string) => {
		// TODO: remove the magic numbers
		if (chainID !== '4') {
			this.props.dispatchAddErrorNotification('You are not on Rinkeby!');
			console.log(".")
		}
	}

	componentWillUnmount() {
		this.etherService.removeAllListeners();
	}

	componentDidMount() {
		this.etherService.requestConnection(this.chainChangeCallback, this.accChangeCallback)
			.then((account: string) => {
				this.accChangeCallback([account]);
				this.chainChangeCallback(this.etherService.getNetwork());
			}, (reason: string) => {
				this.props.dispatchAddErrorNotification('Error connecting to MetaMask: ' + reason);
			})
			.catch((error: string) => {
				this.props.dispatchAddErrorNotification('Error connecting to MetaMask: ' + error);
			});
	}

	callbackDeployedFirstMeeting = (confirmation: any) => {
		// TODO: handle case when the user quit the browser or even refreshed the page, before the meetingAddress could be updated

		console.log(confirmation.transactionHash, confirmation);
		const payload: GroupHashAndAddress = {
			txHash: confirmation.transactionHash,
			meetingAddress: confirmation.args.contractAddr
		};

		this.props.dispatchUpdateMeetingContractAddress(this.props.history, payload);
	}

	handleFirstMeeting = (event: any, startDateTime: number, endDateTime: number) => {
		/**
		 * TODO: verify that the user is still connected to MetaMask.
		 * Preferably listen to events (network change, account change, logout).
		 */
		this.etherService.deployFirstMeeting(
			startDateTime,
			endDateTime,
			event.target.stake.value,
			event.target.maxParticipants.value,
			this.callbackDeployedFirstMeeting
		)
			.then((res: any) => {
				this.props.dispatchCreateFirstMeeting(this.props.history,
					{
						_id: res.hash,
						type: ModelType.PENDING,
						data: {
							name: event.target.meetingName.value,
							location: event.target.location.value,
							description: event.target.description.value,
							startDateTime: startDateTime,
							endDateTime: endDateTime,
							stake: parseFloat(event.target.stake.value),
							maxParticipants: parseInt(event.target.maxParticipants.value),
							prevStake: 0,
							payout: 0,
							isCancelled: false,
							isStarted: false,
							isEnded: false,
							deployerContractAddress: '0x8dF42792C58e7F966cDE976a780B376129632468',  // TODO: pull dynamically once we will have more versions
							organizerAddress: this.props.user._id,
							parent: '',
							child: '',
						},
						cancel: [],
						rsvp: [],
						attend: [],
						withdraw: []
					});
			}, (reason: any) => {
				this.props.dispatchAddErrorNotification("There was an error creating this meeting: " + reason);
			})
			.catch((err: any) => {
				this.props.dispatchAddErrorNotification("There was an error creating this meeting: " + err);
			});
	}

	callbackDeployedNextMeeting = (confirmation: any) => {
		// TODO: handle case when the user quit the browser or even refreshed the page, before the meetingAddress could be updated

		console.log(confirmation.transactionHash, confirmation);
		const payload: GroupHashAndAddress = {
			txHash: confirmation.transactionHash,
			meetingAddress: confirmation.args._nextMeeting
		};

		this.props.dispatchUpdateMeetingContractAddress(this.props.history, payload);
	}

	handleNextMeeting = (event: any, startDateTime: number, endDateTime: number) => {
		this.etherService.nextMeeting(
			this.props.cachedMeeting._id,
			startDateTime,
			endDateTime,
			parseFloat(event.target.stake.value),
			parseInt(event.target.maxParticipants.value),
			this.callbackDeployedNextMeeting
		)
			.then((res: any) => {
				console.log("success next meeting ", res);
				this.props.dispatchCreateNextMeeting(this.props.history, {
					_id: res.hash,
					type: ModelType.PENDING,
					data: {
						name: event.target.meetingName.value,
						location: event.target.location.value,
						description: event.target.description.value,
						startDateTime: startDateTime,
						endDateTime: endDateTime,
						stake: parseFloat(event.target.stake.value),
						maxParticipants: parseInt(event.target.maxParticipants.value),
						prevStake: 0,  // TODO: carry over from parent meeting (wait for next contract release)
						payout: 0,  // TODO: calculate from parent meeting / reward pool (wait for next contract release)
						isCancelled: false,
						isStarted: false,
						isEnded: false,
						deployerContractAddress: '0x8dF42792C58e7F966cDE976a780B376129632468',  // TODO: pull dynamically once we will have more versions
						organizerAddress: this.props.user._id,
						parent: this.props.parent,
						child: '',
					},
					cancel: [],
					rsvp: [],
					attend: [],
					withdraw: []
				});
			}, (reason: any) => {
				this.props.dispatchAddErrorNotification('handleNextMeeting: ' + reason);
			})
			.catch((err: any) => {
				this.props.dispatchAddErrorNotification('handleNextMeeting: ' + err);
			});
	}

	handleSubmit = (event: any) => {
		event.preventDefault();
		event.persist();

		const startDate = new Date(this.state.form.startDate.toDateString());
		const startHour = this.state.form.startTime.getHours();
		const startMinute = this.state.form.startTime.getMinutes();
		const startDateTime = (new Date(startDate)).getTime() / 1000 + (startHour * 60 + startMinute) * 60;

		const endDate = new Date(this.state.form.endDate.toDateString());
		const endHour = this.state.form.endTime.getHours();
		const endMinute = this.state.form.endTime.getMinutes();
		const endDateTime = (new Date(endDate)).getTime() / 1000 + (endHour * 60 + endMinute) * 60;

		if (this.props.parent === 'first') {
			this.handleFirstMeeting(event, startDateTime, endDateTime);
		} else {
			this.handleNextMeeting(event, startDateTime, endDateTime);
		}
	};

	/**
	 * Given a new start date, calculate the difference with previous filled in date.
	 * Adjust the end date with that exact difference.
	 */
	handleStartDateChange = (datetime: any) => {
		const difference = this.state.form.startDate - datetime;
		const newStartTime = new Date(this.state.form.startTime - difference);
		const newEndDate = new Date(this.state.form.endDate - difference);
		const newEndDateTime = new Date(this.state.form.endTime - difference);

		this.setState({
			form: {
				...this.state.form,
				startDate: datetime,
				startTime: newStartTime,
				endDate: newEndDate,
				endTime: newEndDateTime
			}
		});
	}

	/**
	 * Given a new start time, calculate the difference with previous filled in time.
	 * Adjust the end time with that exact difference.
	 */
	handleStartTimeChange = (datetime: any) => {
		const difference = this.state.form.startTime - datetime;
		const newEndDate = new Date(this.state.form.endDate - difference);
		const newEndDateTime = new Date(this.state.form.endTime - difference);

		this.setState({
			form: {
				...this.state.form,
				startTime: datetime,
				endDate: newEndDate,
				endTime: newEndDateTime
			}
		});
	}

	render() {
		const { cachedMeeting } = this.props;

		return (
			<React.Fragment>
				<CssBaseline />
				<NotificationList />
				<Grid container>
					{/* Top Section */}
					<Hero maxWidth={false}>
						<Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
							Host a Meeting
            		</Typography>
						<Typography variant="h5" align="center" color="textSecondary" paragraph>
							Ready for your next event?
            		</Typography>
					</Hero>

					{/* Card Section */}
					<Middle item container spacing={2}>
						<Container maxWidth="md">
							<Typography variant="h6" align="center" color="textSecondary" paragraph>
								First, fill in the important details
              				</Typography>
							<form onSubmit={this.handleSubmit} className="add-meeting-form">
								<Grid container spacing={3} >
									<Grid item xs={12}>
										<TextField
											fullWidth
											required
											id="meetingName"
											label="Event Name"
											defaultValue={cachedMeeting.data.name}
											variant="outlined"
										/>
									</Grid>
									<Grid item xs={3}>
										<TextField
											required
											id="stake"
											label="Stake Amount"
											type="number"
											InputLabelProps={{
												shrink: true,
											}}
											variant="outlined"
											inputProps={this.stakeInputProps}
											InputProps={{
												endAdornment: <InputAdornment position="end">ETH</InputAdornment>
											}}
											defaultValue={cachedMeeting.data.stake}
										/>
									</Grid>
									<Grid item xs={1} />
									<Grid item xs={3}>
										<TextField
											required
											id="maxParticipants"
											label="Max Participants"
											type="number"
											InputLabelProps={{
												shrink: true,
											}}
											variant="outlined"
											defaultValue={cachedMeeting.data.maxParticipants}
										/>
									</Grid>
									<Grid item xs={1} />
									<Grid item xs={4}>
										<TextField
											fullWidth
											variant="outlined"
											defaultValue={cachedMeeting.data.location}
											id="location"
											label="Location"
										/>
									</Grid>
									<Grid item container xs={12} alignItems="flex-end" justify="center">
										<Typography variant="h6" align="center" color="textSecondary" paragraph>
											When does your event start?
										</Typography>
									</Grid>
									<Grid item container xs={12} alignItems="flex-end" justify="center">
										<Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
											* The time is in your local timezone.
										</Typography>
									</Grid>

									<MuiPickersUtilsProvider utils={DateFnsUtils}>
										<Grid item xs={3}>
											<KeyboardDatePicker
												required
												disableToolbar
												variant="inline"
												margin="normal"
												id="startDate"
												label="Start Date"
												format="MM/dd/yyyy"
												value={this.state.form.startDate}
												onChange={this.handleStartDateChange}
												KeyboardButtonProps={{
													'aria-label': 'change date',
												}}
											/>
										</Grid>
										<Grid item xs={3}>
											<KeyboardTimePicker
												required
												margin="normal"
												id="startTime"
												label="Start Time"
												value={this.state.form.startTime}
												onChange={this.handleStartTimeChange}
												KeyboardButtonProps={{
													'aria-label': 'change time',
												}}
											/>
										</Grid>
										<Grid item xs={3}>
											<KeyboardDatePicker
												required
												disableToolbar
												variant="inline"
												format="MM/dd/yyyy"
												margin="normal"
												id="endDate"
												label="End Date"
												value={this.state.form.endDate}
												onChange={(d) => this.setState({ form: { ...this.state.form, endDate: d } })}
												KeyboardButtonProps={{
													'aria-label': 'change date',
												}}
											/>
										</Grid>
										<Grid item xs={3}>
											<KeyboardTimePicker
												required
												margin="normal"
												id="endTime"
												label="End Time"
												value={this.state.form.endTime}
												onChange={(t) => this.setState({ form: { ...this.state.form, endTime: t } })}
												KeyboardButtonProps={{
													'aria-label': 'change time',
												}}
											/>
										</Grid>
									</MuiPickersUtilsProvider>
									<Grid item xs={12}>
										<TextField
											fullWidth={true}
											id="description"
											label="Event Description"
											multiline
											rows={6}
											variant="outlined"
											defaultValue={cachedMeeting.data.location}
										/>
									</Grid>
									<Grid item container xs={12}>
										<Grid item xs={4} />
										<Grid item xs={2} alignItems="center" justify="center">
											<Link style={{ textDecoration: 'none' }} to={'/'}>
												<MyButton>CANCEL</MyButton>
											</Link>
										</Grid>
										<Grid item xs={2} alignItems="center" justify="center">
											<Tooltip title={this.props.user._id === '' ? 'Please authorize MetaMask first.' : 'This will require smart contract interaction.'}>
												<span>
													<MyButton disabled={this.props.user._id === ''} type="submit"
														style={this.props.user._id === '' ? { background: 'linear-gradient(45deg, #ff9eb4 30%, #ffb994 90%)' } :
															{ background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}
													>
														CREATE MEETING
												</MyButton>
												</span>
											</Tooltip>
										</Grid>
										<Grid item xs={4} />
									</Grid>
								</Grid>
							</form>
						</Container>
					</Middle>

					<Container>
						<Typography variant="subtitle1" align="center" color="textSecondary" component="p">
							Slingshot 2020
            			</Typography>
					</Container>
				</Grid>
			</React.Fragment >

		);
	}
}
