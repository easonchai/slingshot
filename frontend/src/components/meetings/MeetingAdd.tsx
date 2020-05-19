import React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'history';
import { Meeting, GroupHashAndAddress, ModelType } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import EtherService from '../../services/EtherService';
import { Button, Container, Grid, TextareaAutosize, TextField, Tooltip, CssBaseline } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';

interface IProps {
	history: History;
	user: User;
	//cachedMeeting: Meeting;
	dispatchCreateFirstMeeting(payload: Meeting): void;
	dispatchUpdateMeetingContractAddress(payload: GroupHashAndAddress, history: History): void;
	dispatchUpdateUserEthereumAddress(payload: User): void;
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
		 * Pre-fill starting date to current time +24 hours.
		 * Pre-fill ending date to current time +25 hours (1 hour meeting).
		 * TODO: round up to next hour
		 */
		this.state = {
			form: {
				startDate: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)),
				startTime: new Date(new Date().getTime()),
				endDate: new Date(new Date().getTime() + (25 * 60 * 60 * 1000)),
				endTime: new Date(new Date().getTime() + (25 * 60 * 60 * 1000))
			}
		};

		/**
		 * HTML5 input element attributes for type=number used to decorate stake amount field.
		 */
		this.stakeInputProps = {
			min: 0.001,
			step: 0.001,
		};

		this.etherService = new EtherService();
	}

	componentDidMount() {
		this.etherService.requestConnection()
			.then((account: string) => {
				// TODO: keep the whole object consistent (i.e. reload the arrays of meetings for the new wallet addres.)
				const user = {
					_id: account,
					type: ModelType.USER,
					cancel: [],
					rsvp: [],
					attend: [],
					withdraw: []
				};

				this.props.dispatchUpdateUserEthereumAddress(user);
			}, (reason: string) => {
				console.log('Rejection:', reason);
				// TODO notify user
			})
			.catch((error: string) => {
				console.log('Error:', error);
				// TODO notify user
			});
	}

	callbackDeployedMeeting = (meeting: any) => {
		// TODO: handle case when the user quit the browser or even refreshed the page, before the meetingAddress could be updated

		const payload: GroupHashAndAddress = {
			txHash: meeting.transactionHash,
			meetingAddress: meeting.args.contractAddr
		};

		this.props.dispatchUpdateMeetingContractAddress(payload, this.props.history);
	}

	handleSubmit = (event: any) => {
		event.preventDefault();
		event.persist();

		// TODO: pay attention to timezone
		const startDate = new Date(this.state.form.startDate.toDateString());
		const startHour = this.state.form.startTime.getHours();
		const startMinute = this.state.form.startTime.getMinutes();
		const startDateTime = (new Date(startDate)).getTime() / 1000 + (startHour * 60 + startMinute) * 60;

		// TODO: pay attention to timezone
		const endDate = new Date(this.state.form.endDate.toDateString());
		const endHour = this.state.form.endTime.getHours();
		const endMinute = this.state.form.endTime.getMinutes();
		const endDateTime = (new Date(endDate)).getTime() / 1000 + (endHour * 60 + endMinute) * 60;

		/**
		 * TODO: verify that the user is still connected to MetaMask.
		 * Preferably listen to events (network change, account change, logout).
		 */
		this.etherService.deployFirstMeeting(
			startDateTime,
			endDateTime,
			event.target.stake.value,
			event.target.maxParticipants.value,
			this.callbackDeployedMeeting
		)
			.then((res: any) => {
				this.props.dispatchCreateFirstMeeting({
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

				this.props.history.push('/meeting/' + res.hash);
			}, (reason: any) => {
				console.log("reason deploy ", reason);
				// TODO notify user
			})
			.catch((err: any) => {
				console.log("error deploy ", err);
				// TODO notify user
			});
	};

	render() {
		return (
			<Container maxWidth={false}>
				<Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
					<form onSubmit={this.handleSubmit} className="add-meeting-form">
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField id="meetingName" label="Meeting Name" />
							</Grid>

							<Grid item xs={12}>
								<TextField
									required={true}
									type="number"
									inputProps={this.stakeInputProps}
									id="stake"
									label="Stake Amount (ETH)"
									defaultValue={0.01}
								/>
							</Grid>

							<Grid item xs={12}>
								<TextField
									required={true}
									type="number"
									id="maxParticipants"
									label="Max participants"
									defaultValue={100}
								/>
							</Grid>

							<Grid item xs={12}>
								<MuiPickersUtilsProvider utils={DateFnsUtils}>
									<Grid item xs={12}>
										<KeyboardDatePicker
											required={true}
											margin="normal"
											id="startDate"
											label="Start Date"
											format="MM/dd/yyyy"
											value={this.state.form.startDate}
											onChange={(d) => this.setState({ form: { ...this.state.form, startDate: d } })}
										/>
									</Grid>
									<Grid item xs={12}>
										<KeyboardTimePicker
											required={true}
											margin="normal"
											id="startTime"
											label="Start Time"
											value={this.state.form.startTime}
											onChange={(t) => this.setState({ form: { ...this.state.form, startTime: t } })}
										/>
									</Grid>

									<Grid item xs={12}>
										<KeyboardDatePicker
											required={true}
											margin="normal"
											id="endDate"
											label="End Date"
											format="MM/dd/yyyy"
											value={this.state.form.endDate}
											onChange={(d) => this.setState({ form: { ...this.state.form, endDate: d } })}
										/>
									</Grid>
									<Grid item xs={12}>
										<KeyboardTimePicker
											required={true}
											margin="normal"
											id="endTime"
											label="End Time"
											value={this.state.form.endTime}
											onChange={(t) => this.setState({ form: { ...this.state.form, endTime: t } })}
										/>
									</Grid>
								</MuiPickersUtilsProvider>
							</Grid>

							<Grid item xs={12}>
								<TextField id="location" label="Location" />
							</Grid>

							<Grid item xs={12}>
								<TextareaAutosize id="description" aria-label="Description" rowsMin={10} placeholder="Description" />
							</Grid>

							<Grid item xs={12}>
								<Link style={{ textDecoration: 'none' }} to={'/'}>
									<Button variant="outlined" color="primary">
										CANCEL
									</Button>
								</Link>
								<Tooltip title={this.props.user._id === '' ? 'Please authorize MetaMask first.' : 'This will require smart contract interaction.'}>
									<span>
										<Button disabled={this.props.user._id === ''} type="submit" variant="outlined" color="primary">
											CREATE MEETING
										</Button>
									</span>
								</Tooltip>
							</Grid>
						</Grid>
					</form>
				</Grid>
			</Container>);
	}
}
