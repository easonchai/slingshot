import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'history';
import { Club } from '../../store/clubs/actions';
import { Meeting, GroupHashAndAddress, ModelType } from '../../store/meetings/actions';
import { initState } from '../../store/meetings/reducers';
import { User } from '../../store/users/actions';
import EtherService from '../../services/EtherService';
import {
	Button,
	Container,
	Grid,
	TextField,
	Tooltip,
	CssBaseline,
	Typography,
	InputAdornment,
	Input,
	CircularProgress,
	CardMedia,
	LinearProgress, Box
} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import { styled } from '@material-ui/core/styles';
import Header from '../Header'
import { upload } from 'skynet-js';
import Footer from '../Footer'
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import Videocam from '@material-ui/icons/Videocam';

export const Hero = styled(Container)({
	margin: 0,
	background: 'white',
	padding: '30px 80px',
	height: '200px',
})

export const Middle = styled(Grid)({
	width: '95%',
	margin: 'auto',
	padding: '60px 20px'
})

export const MyButton = styled(Button)({
	background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
	border: 0,
	borderRadius: 3,
	boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
	color: 'white',
	height: 48,
	padding: '0 10px',
	width: 140,
});

export const CardImage = styled(CardMedia)({
	paddingTop: '56.25%',
})

export const SponsorMessage = styled(Typography)({
	fontSize: 16,
	fontWeight: 'bolder',
	padding: 10,
	color: '#58b662',
	borderRadius: 3
})

const UploadButton = styled(Input)({
	display: 'none',
})

const UploadText = styled(Typography)({
	color: '#454545',
	fontWeight: 'bolder',
	fontSize: 14,
})

const UploadGrid = styled(Grid)({
	border: '1px solid #a8a8a8',
	borderRadius: 5,
	padding: 10
})

interface IProps {
	history: History;
	parent: string;
	user: User;
	cachedMeeting: Meeting;

	dispatchUpdateCachedMeeting(meeting: Meeting): void;

	dispatchIsClubNameUnique(name: string): Promise<boolean>;
	dispatchCreateFirstClubAndMeeting(history: History, club: Club, meeting: Meeting): void;
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

	callbackDeployedMeeting = (confirmation: any) => {
		// TODO: handle case when the user quit the browser or even refreshed the page, before the meetingAddress could be updated

		const payload: GroupHashAndAddress = {
			txHash: confirmation.transactionHash,
			meetingAddress: confirmation.args.contractAddr
		};

		this.props.dispatchUpdateMeetingContractAddress(this.props.history, payload);
	}

	createFirstClubAndMeeting = (hash: string, clubAddress: string, event: any, startDateTime: number, endDateTime: number) => {
		this.props.dispatchCreateFirstClubAndMeeting(this.props.history,
			{
				_id: clubAddress,
				type: ModelType.CLUB,
				admins: [this.props.user._id],
				proposals: [],

				data: {
					name: event.target.clubName.value,
					deployerContractAddress: '0x4F40574184bC0bed3eE6df209118bD0eE06EC067',  // TODO: pull dynamically once we will have more versions
					organizerAddress: this.props.user._id,				}
			},
			{
				_id: hash,
				type: ModelType.PENDING,
				admins: [this.props.user._id],
				proposals: [],

				data: {
					name: event.target.meetingName.value,
					clubName: event.target.clubName.value,
					clubAddress: clubAddress,
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
					isPaused: false,
					deployerContractAddress: '0x4F40574184bC0bed3eE6df209118bD0eE06EC067',  // TODO: pull dynamically once we will have more versions
					organizerAddress: this.props.user._id,
					parent: '',
					child: '',
					images: this.state.form.images,
					videos: this.state.form.videos,
					feedback: [],
					cancel: [],
					rsvp: [],
					attend: [],
					withdraw: []
				},
			});
	}

	handleFirstMeeting = (event: any, startDateTime: number, endDateTime: number) => {
		/**
		 * Verify that the club name is unique.
		 */
		this.props.dispatchIsClubNameUnique(event.target.clubName.value)
			.then((isUnique: boolean) => {
				if (!isUnique) {
					this.props.dispatchAddErrorNotification("The name of the club already exists, please choose another one.");
				} else {
					/**
					 * TODO: verify that the user is still connected to MetaMask.
					 * Preferably listen to events (network change, account change, logout).
					 */
					this.etherService.deployFirstMeeting(
						startDateTime,
						endDateTime,
						parseFloat(event.target.stake.value),
						parseInt(event.target.maxParticipants.value),
						this.callbackDeployedMeeting
					)
						.then((ethersResponse: any) => {
							this.createFirstClubAndMeeting(ethersResponse.hash, ethersResponse.clubAddress, event, startDateTime, endDateTime);
						}, (reason: any) => {
							// Code 4001 reflects MetaMask's rejection by user.
							// Hence we don't display it as an error.
							if (reason?.code !== 4001) {
								this.props.dispatchAddErrorNotification("There was an error creating this event: " + reason);
								console.error(reason);
							}
						})
						.catch((err: any) => {
							this.props.dispatchAddErrorNotification("There was an error creating this event: " + err);
							console.error(err);
						});
				}
			}, (reason: any) => {
				this.props.dispatchAddErrorNotification("Please try again later. A rejection occured while checking for club name uniqueness: " + reason);
				console.error(reason);
			})
			.catch((err: any) => {
				this.props.dispatchAddErrorNotification("Please try again later. An error occured while checking for club name uniqueness: " + err);
				console.error(err);
			});
	}

	handleNextMeeting = (event: any, startDateTime: number, endDateTime: number) => {
		this.etherService.nextMeeting(
			this.props.cachedMeeting.data.clubAddress,
			startDateTime,
			endDateTime,
			parseFloat(event.target.stake.value),
			parseInt(event.target.maxParticipants.value),
			this.callbackDeployedMeeting
		)
			.then((res: any) => {
				this.props.dispatchCreateNextMeeting(this.props.history, {
					_id: res.hash,
					type: ModelType.PENDING,
					admins: [this.props.user._id],
					proposals: [],

					data: {
						name: event.target.meetingName.value,
						clubName: this.props.cachedMeeting.data.clubName,
						clubAddress: this.props.cachedMeeting.data.clubAddress,
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
						isPaused: false,
						deployerContractAddress: '0x4F40574184bC0bed3eE6df209118bD0eE06EC067',  // TODO: pull dynamically once we will have more versions
						organizerAddress: this.props.user._id,
						parent: this.props.parent,
						child: '',
						// TODO replace files if needed
						images: this.state.form.images,
						videos: this.state.form.videos,
						feedback: [],
						cancel: [],
						rsvp: [],
						attend: [],
						withdraw: []
					},
				});
			}, (reason: any) => {
				// Code 4001 reflects MetaMask's rejection by user.
				// Hence we don't display it as an error.
				if (reason?.code !== 4001) {
					this.props.dispatchAddErrorNotification("There was an error creating this event: " + reason);
					console.error(reason);
				}
			})
			.catch((err: any) => {
				this.props.dispatchAddErrorNotification('There was an error creating this event: ' + err);
				console.error(err);
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
		console.log("Clicked")
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
								<Grid item container xs={12} alignItems="center" justify="center">
									<img src="https://www.siasky.net/AAAwORAbUuPv2ipKHVM2yxU-t808Kmx1PVuS6CJnENtIig" alt="Sia Logo"
										height={64} width={64} style={{ alignItems: 'center', justifyContent: 'center' }} />
								</Grid>
								<Grid item>
									<SponsorMessage variant="subtitle1" align="center" paragraph>
										Media proudly hosted on
										<a
											style={{ textDecoration: 'none', color: '#3c9e47' }}
											href={'https://www.siasky.net/'}
											rel="noopener noreferrer"
											target="_blank"
										> Sia Skynet</a>!
									</SponsorMessage>
								</Grid>
								<Grid item container xs={12} alignItems="flex-end" justify="center">
									<Typography variant="h6" align="center" color="textSecondary" paragraph style={{ marginBottom: 10 }}>
										First, let's upload a catchy picture/video to showcase your event!
									</Typography>
								</Grid>
							</Grid>

							{/* Image / Video upload Section */}
							<Grid container spacing={3} >
								<Grid item container xs={6} alignItems="center" justify="center">
									<Grid item xs={1} sm={2} md={3} />
									<UploadGrid item xs={10} sm={8} md={6} style={{ alignItems: 'center', justifyContent: 'center' }}>
										<Tooltip title={this.getUploadButtonTooltipText()}>
											<Container>
												<UploadText variant="body2" align="center" color="textSecondary" paragraph>
													Upload an image
												</UploadText>
												<Box display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
													<UploadButton
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
														<IconButton color="secondary" component="span">
															<PhotoCamera fontSize="large" />
														</IconButton>
													</label>
												</Box>
											</Container>
										</Tooltip>
									</UploadGrid>
									<Grid item xs={1} sm={2} md={3} />
									<Grid item xs={12}>
										{
											this.state.loadingImage && <CircularProgress color="secondary" />
										}
									</Grid>
								</Grid>
								<Grid item container xs={6} alignItems="center" justify="center">
									<Grid item xs={1} sm={2} md={3} />
									<UploadGrid item xs={10} sm={8} md={6}>
										<Tooltip title={this.getUploadButtonTooltipText()}>
											<Container>
												<UploadText variant="body2" align="center" color="textSecondary" paragraph>
													Upload a video
												</UploadText>
												<Box display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
													<UploadButton
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
														<IconButton color="secondary" component="span">
															<Videocam fontSize="large" />
														</IconButton>
													</label>
												</Box>
											</Container>
										</Tooltip>
									</UploadGrid>
									<Grid item xs={1} sm={2} md={3} />
									<Grid item xs={12}>
										{
											this.state.loadingVideo && <CircularProgress color="secondary" />
										}
									</Grid>
								</Grid>
							</Grid>

							{/* Image / Video preview Section */}
							<Grid container spacing={3} style={{ marginBottom: 20 }}>
								<Grid item xs={5}>
									{
										this.state.form.images.length > 0 &&
										<Container>
											<Typography style={{ fontWeight: 'lighter', fontSize: 14 }}>Image Preview: </Typography>
											<CardImage
												image={imageUrlpreview}
												title='event image preview'
											/>
										</Container>
									}

									{
										this.state.loadingImage &&
										<LinearProgress variant="determinate" value={this.state.loadingImagePct} color="secondary" />
									}
								</Grid>
								<Grid item xs={2} />
								<Grid item xs={5}>
									{
										this.state.form.videos.length > 0 &&
										<Container>
											<Typography style={{ fontWeight: 'lighter', fontSize: 14 }}>Video Preview: </Typography>
											<video controls width="318" height="179">
												<source src={videoUrlpreview} type="video/mp4" />
												Your browser does not support the video tag.
											</video>
										</Container>
									}

									{
										this.state.loadingVideo &&
										<LinearProgress variant="determinate" value={this.state.loadingVideoPct} color="secondary" />
									}
								</Grid>
							</Grid>

							{/* Main Section */}
							<Typography variant="h6" align="center" color="textSecondary" paragraph>
								Next, fill in the important details!
              				</Typography>
							<form onSubmit={this.handleSubmit} className="add-meeting-form">
								<Grid container spacing={3} >
									<Grid item xs={12}>
										<TextField
											fullWidth
											required
											disabled={cachedMeeting.data.clubAddress !== ''}
											id="clubName"
											label="Club Name"
											defaultValue={cachedMeeting.data.clubName}
											variant="outlined"
										/>
									</Grid>
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
									<Grid item xs={5} md={3}>
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
									<Grid item xs={2} md={1} />
									<Grid item xs={5} md={3}>
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
									<Grid item md={1} />
									<Grid item xs={12} md={4}>
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
										<Grid item xs={6} md={3}>
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
										<Grid item xs={6} md={3}>
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
										<Grid item xs={6} md={3}>
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
										<Grid item xs={6} md={3}>
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
										<Grid item sm={1} md={3} />
										<Grid item xs={6} sm={5} md={3} alignItems="center" justify="center">
											<Link style={{ textDecoration: 'none' }} to={'/'}>
												<MyButton>CANCEL</MyButton>
											</Link>
										</Grid>
										<Grid item xs={6} sm={5} md={3} alignItems="center" justify="center">
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
										<Grid item sm={1} md={3} />
									</Grid>
								</Grid>
							</form>
						</Container>
					</Middle>

					{/* Footer Section */}
					<Footer />
				</Grid>
			</React.Fragment >

		);
	}
}
