import React from 'react';
import { History } from 'history';
import { Event } from '../store/events/actions';
import { Button, Container, Grid, TextField } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import EtherService from '../services/EtherService';

interface IProps {
	history: History;
	events: Array<Event>;
	dispatchAddEvent(event: Event): void;
}

export class AddEvent extends React.Component<IProps> {
	state: any;
  etherService: EtherService;

	constructor(props: any) {
		super(props);

		this.state = {
			date: null,
			time: null
		};

    this.etherService = new EtherService();
	}

  componentDidMount() {
	this.etherService.requestConnection()
      .then((account: string) => {
        console.log('Selected account:', account);  // TODO: save account into redux store
      }, (reason: string) => {
	    console.log('Rejection:', reason);
	  })
      .catch((error: string) => {
        console.log('Error:', error);
      });
  }

  	callbackRSVP = (event: any) => {
		console.log("RSVPEvent: ", event);
	}

  	callbackDeployedMeeting = (event: any) => {
		console.log("NewMeetingEvent: ", event);

		const meetingAddress: string = event.args.contractAddr;
		this.etherService
			.rsvp(meetingAddress, this.callbackRSVP)
			.then((res: any) => {
				console.log("success rsvp ", res);
			}, (reason: any) => {
				console.log("reason rsvp ", reason);
			})
			.catch((err: any) => {
				console.log("error rsvp ", err);
			});
	}

	handleSubmit = (event: any) => {
		event.preventDefault();

		this.props.dispatchAddEvent({
			name: event.target.eventName.value,
			stake: event.target.stakeAmount.value,
			maxParticipants: event.target.maxParticipants.value,
			startDate: this.state.date,
			startTime: this.state.time,
			location: event.target.location.value,
			description: event.target.description.value,
			isEnded: false,
			ownerAddress: '0x0...0',  // TODO: retrieve account from redux store
			contractAddress: '0x0...0',  // TODO: retrieve address
		});

		// The event was just saved locally, lets try to deploy a meeting next on testnet.
		
		this.etherService.deployFirstMeeting(
				0,
				1,
				1,
				1,
				this.callbackDeployedMeeting
			)
			.then((res: any) => {
				console.log("success deploy ", res);
				this.props.history.push('/');
			}, (reason: any) => {
				console.log("reason deploy ", reason);
			})
			.catch((err: any) => {
				console.log("error deploy ", err);
			});
	};

	handleDateChange = (d: any) => {
		this.setState({ date: d });
	};

	handleTimeChange = (t: any) => {
		this.setState({ time: t });
	};

	render() {
		return (
			<Container maxWidth={false}>
				<Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
					<form onSubmit={this.handleSubmit} className="add-event-form">
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField required={false} id="eventName" label="Event Name" />
							</Grid>

							<Grid item xs={12}>
								<TextField
									type="number"
									id="stakeAmount"
									label="Stake Amount (ETH)"
									defaultValue={0.05}
								/>
							</Grid>

							<Grid item xs={12}>
								<TextField
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
											required={false}
											margin="normal"
											id="startDate"
											label="Start Date"
											format="MM/dd/yyyy"
											value={this.state.date}
											onChange={this.handleDateChange}
										/>
									</Grid>
									<Grid item xs={12}>
										<KeyboardTimePicker
											required={false}
											margin="normal"
											id="startTime"
											label="Start Time"
											value={this.state.time}
											onChange={this.handleTimeChange}
										/>
									</Grid>
								</MuiPickersUtilsProvider>
							</Grid>

							<Grid item xs={12}>
								<TextField required={false} id="location" label="Location" />
							</Grid>

							<Grid item xs={12}>
								<TextField id="description" label="Description" />
							</Grid>

							<Grid item xs={12}>
								<Button type="submit" variant="outlined" color="primary">
									Add new Event
								</Button>
							</Grid>
						</Grid>
					</form>
				</Grid>
			</Container>
		);
	}
}
