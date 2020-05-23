import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'history';
import { Meeting, GroupHashAndAddress, ModelType } from '../../store/meetings/actions';
import { initState } from '../../store/meetings/reducers';
import { User } from '../../store/users/actions';
import EtherService from '../../services/EtherService';
import {
	Button,
	Container,
	Grid,
	TextareaAutosize,
	TextField,
	Tooltip,
	CssBaseline,
	Typography,
	InputAdornment,
	Input,
	CircularProgress,
	CardMedia,
	LinearProgress
} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import { styled } from '@material-ui/core/styles';
import Header from '../Header'
import { upload } from 'skynet-js';

import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import Videocam from '@material-ui/icons/Videocam';

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

	dispatchUpdateCachedMeeting(meeting: Meeting): void;

	dispatchCreateFirstMeeting(history: History, payload: Meeting): void;
	dispatchUpdateMeetingContractAddress(history: History, payload: GroupHashAndAddress): void;
	dispatchUpdateOrganiserEthereumAddress(organizer: User): void;

	dispatchAddErrorNotification(message: String): void;
	dispatchAddSuccessNotification(message: string): void;

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
		endTime: any,
		images: Array<any>,
		videos: Array<any>
	};
	loadingImage: boolean;
	loadingVideo: boolean;
	loadingImagePct: number;
	loadingVideoPct: number;
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
				endTime: new Date(endTime),
				images: [],
				videos: [],
			},
			loadingImage: false,
			loadingVideo: false,
			loadingImagePct: 0,
			loadingVideoPct: 0,
		};

		if (this.props.parent === 'first') {
			const meeting = { ...initState.cachedMeeting };
			this.props.dispatchUpdateCachedMeeting(meeting);
		} else {
			axios
				.get('/api/meeting/id/' + this.props.parent)
				.then(res => res.data as Meeting)
				.then(meeting => {
					this.props.dispatchUpdateCachedMeeting(meeting);

					this.setState({
						form: {
							...this.state.form,
							images: [...this.props.cachedMeeting.data.images],
							videos: [...this.props.cachedMeeting.data.videos],
						}
					});
				});
		}

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
		const address = accounts[0];

		if (address) {
			axios
				.get('/api/user/id/' + address)
				.then(res => res.data as User)
				.then(user => this.props.dispatchUpdateOrganiserEthereumAddress(user));
		} else {
			const user: User = {
				_id: '',
				type: ModelType.USER,
				data: {
					ensDomain: ''
				},
				cancel: [],
				rsvp: [],
				attend: [],
				withdraw: []
			};

			this.props.dispatchUpdateOrganiserEthereumAddress(user);
		}
	}

	componentDidMount() {
		this.etherService.addAccountListener(this.accChangeCallback);
	}

	componentWillUnmount() {
		this.etherService.removeAllListeners();
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

	createFirstMeeting = (hash: string, event: any, startDateTime: number, endDateTime: number) => {
		this.props.dispatchCreateFirstMeeting(this.props.history,
			{
				_id: hash,
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
					images: this.state.form.images,
					videos: this.state.form.videos,
				},
				cancel: [],
				rsvp: [],
				attend: [],
				withdraw: []
			});
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
			.then((ethersResponse: any) => {
				this.createFirstMeeting(ethersResponse.hash, event, startDateTime, endDateTime);
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
						// TODO replace files if needed
						images: this.state.form.images,
						videos: this.state.form.videos,
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
				endTime: newEndDateTime,

			}
		});
	}

	onImageUploadProgress = (progress: any, { loaded, total }: any) => {
		this.setState({
			loadingImagePct: progress * 100
		});
	};

	onVideoUploadProgress = (progress: any, { loaded, total }: any) => {
		this.setState({
			loadingVideoPct: progress * 100
		});
	};

	uploadFile = (fileInput: any, isImage: boolean) => {
		if (isImage) {
			this.setState({
				loadingImage: true
			});
		} else {
			this.setState({
				loadingVideo: true
			});
		}

		const siaUrl = 'https://siasky.net/';
		const progressCallback = isImage ? this.onImageUploadProgress : this.onVideoUploadProgress;
		upload(siaUrl, fileInput, { onUploadProgress: progressCallback })
			.then((siaResponse: any) => {
				const skyLink = siaResponse.skylink;

				if (isImage) {
					this.setState({
						form: {
							...this.state.form,
							images: [skyLink]
						},
						loadingImage: false
					});

					this.props.dispatchAddSuccessNotification(
						'The image is successfully hosted on: '
						+ siaUrl
						+ skyLink
					);
				} else {
					this.setState({
						form: {
							...this.state.form,
							videos: [skyLink]
						},
						loadingVideo: false
					});

					this.props.dispatchAddSuccessNotification(
						'The video is successfully hosted on: '
						+ siaUrl
						+ skyLink
					);
				}
			});
	}

	handleCaptureImage = (event: any) => {
		if (event.target.accept.includes('image')) {
			if (event.target.files.length === 0) {
				this.setState({
					form: {
						...this.state.form,
						images: []
					},
					loadingImage: false
				});
			} else {
				// TODO multiple files
				const file = event.target.files[0];
				this.uploadFile(file, true);
			}
		}
	}

	handleCaptureVideo = (event: any) => {
		if (event.target.accept.includes('video')) {
			if (event.target.files.length === 0) {
				this.setState({
					form: {
						...this.state.form,
						videos: []
					},
					loadingVideo: false
				});
			} else {
				// TODO multiple files
				const file = event.target.files[0];
				this.uploadFile(file, false);
			}
		}
	}

	isUserLoggedOut = () => {
		return this.props.user._id === '';
	}

	getStateTooltipText = () => {
		if (this.state.loadingImage)
			return 'Please wait until the image has been uploaded.';

		if (this.state.loadingVideo)
			return 'Please wait until the video has been uploaded.';

		if (this.isUserLoggedOut())
			return 'Please login to MetaMask first.';
	}

	getFormButtonTooltipText = () => {
		return this.getStateTooltipText() || 'This will require smart contract interaction.';
	}

	getUploadButtonTooltipText = () => {
		return this.getStateTooltipText() || 'This will start the upload right away and replace previous file.';
	}

	isFormButtonDisabled = () => {
		return this.state.loadingImage || this.state.loadingVideo || this.isUserLoggedOut();
	}

	isUploadImageButtonDisabled = () => {
		return this.state.loadingImage || this.isUserLoggedOut();
	}

	isUploadVideoButtonDisabled = () => {
		return this.state.loadingVideo || this.isUserLoggedOut();
	}

	render() {
		const { cachedMeeting } = this.props;

		const imageUrlpreview = 'https://siasky.net/' +
			(
				this.state.form.images.length
					? this.state.form.images[0]
					: ''
			)

		const videoUrlpreview = 'https://siasky.net/' +
			(
				this.state.form.videos.length
					? this.state.form.videos[0]
					: ''
			)

		return (
			<React.Fragment>
				<CssBaseline />
				<Header />
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
							<Grid item container xs={12} alignItems="flex-end" justify="center">
								<Typography variant="h6" align="center" color="textSecondary" paragraph>
									Upload media files while you fill out the details of your event below
								</Typography>
							</Grid>
							<Grid item container xs={12} alignItems="flex-end" justify="center">
								<Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
									The media will be hosted on
									<a
										style={{ textDecoration: 'none' }}
										href={'https://www.siasky.net/'}
										rel="noopener noreferrer"
										target="_blank"
									> Sia Skynet</a>.
								</Typography>
							</Grid>

							{/* Image / Video upload Section */}
							<Grid container spacing={3} >
								<Tooltip title={this.getUploadButtonTooltipText()}>
									<Grid item xs={6}>
										<Input
											disabled={this.isUploadImageButtonDisabled()}
											inputProps={
												{
													accept: "image/*"
												}
											}
											id="icon-button-photo"
											onChange={this.handleCaptureImage}
											type="file"
										/>
										<label htmlFor="icon-button-photo">
											<IconButton color="primary" component="span">
												<PhotoCamera />
											</IconButton>
										</label>
										{
											this.state.loadingImage && <CircularProgress color="secondary" />
										}
									</Grid>
								</Tooltip>
								<Tooltip title={this.getUploadButtonTooltipText()}>
									<Grid item xs={6}>
										<Input
											disabled={this.isUploadVideoButtonDisabled()}
											inputProps={
												{
													accept: "video/*",
													capture: "camcorder"
												}
											}
											id="icon-button-video"
											onChange={this.handleCaptureVideo}
											type="file"
										/>
										<label htmlFor="icon-button-video">
											<IconButton color="primary" component="span">
												<Videocam />
											</IconButton>
										</label>
										{
											this.state.loadingVideo && <CircularProgress color="secondary" />
										}
									</Grid>
								</Tooltip>
							</Grid>

							{/* Image / Video preview Section */}
							<Grid container spacing={3} >
								<Grid item xs={6}>
									{
										this.state.form.images.length > 0 &&
										<img
											src={imageUrlpreview}
											alt='event image preview'
											width="256"
											height="256"
										/>
									}

									{
										this.state.loadingImage &&
										<LinearProgress variant="determinate" value={this.state.loadingImagePct} color="secondary" />
									}
								</Grid>
								<Grid item xs={6}>
									{
										this.state.form.videos.length > 0 &&
										<video controls width="256" height="144">
											<source src={videoUrlpreview} type="video/mp4" />
											Your browser does not support the video tag.
										</video>
									}

									{
										this.state.loadingVideo &&
										<LinearProgress variant="determinate" value={this.state.loadingVideoPct} color="secondary" />
									}
								</Grid>
							</Grid>

							{/* Main Section */}
							<Typography variant="h6" align="center" color="textSecondary" paragraph>
								Please fill in the important details
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
											defaultValue={cachedMeeting.data.description}
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
											<Tooltip title={this.getFormButtonTooltipText()}>
												<span>
													<MyButton disabled={this.isFormButtonDisabled()} type="submit"
														style={this.isFormButtonDisabled() ? { background: 'linear-gradient(45deg, #ff9eb4 30%, #ffb994 90%)' } :
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

					{/* Footer Section */}
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
