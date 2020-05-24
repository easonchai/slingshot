import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { upload } from 'skynet-js';
import {
    CircularProgress,
    Container,
    Grid,
    IconButton,
    Input,
    LinearProgress,
    TextField,
    Tooltip,
    Typography,
} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import { PhotoCamera, Videocam } from '@material-ui/icons';
import { IAppState } from '../store/index';
import { Hero, CardImage, Middle, MyButton, SponsorMessage } from './meetings/MeetingAdd';
import { actions as notificationActions, Notification } from '../store/notifications/actions';
import { actions as userActions } from '../store/users/actions';
import { Feedback, Meeting } from '../store/meetings/actions';
import { styled } from '@material-ui/core/styles';

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

export default function FeedbackForm() {
    const dispatch = useDispatch();

    const user = useSelector((state: IAppState) => state.userReducer.user);
    const cachedMeeting = useSelector((state: IAppState) => state.meetingsReducer.cachedMeeting);

    const [loadingImage, setLoadingImage] = React.useState(false);
    const [loadingVideo, setLoadingVideo] = React.useState(false);
    const [loadingImagePct, setLoadingImagePct] = React.useState(0);
    const [loadingVideoPct, setLoadingVideoPct] = React.useState(0);
    const [uploadedImages, setUploadedImages] = React.useState(['']);
    const [uploadedVideos, setUploadedVideos] = React.useState(['']);
    const [starsRating, setStarsRating] = React.useState(5);
    const [feedbackComment, setFeedbackComment] = React.useState('');

    const onImageUploadProgress = (progress: any, { loaded, total }: any) => {
        setLoadingImagePct(progress * 100);
    };

    const onVideoUploadProgress = (progress: any, { loaded, total }: any) => {
        setLoadingVideoPct(progress * 100);
    };

    const uploadFile = (fileInput: any, isImage: boolean) => {
        if (isImage) {
            setLoadingImage(true);
        } else {
            setLoadingVideo(true);
        }

        const siaUrl = 'https://siasky.net/';
        const progressCallback = isImage ? onImageUploadProgress : onVideoUploadProgress;
        upload(siaUrl, fileInput, { onUploadProgress: progressCallback })
            .then((siaResponse: any) => {
                const skyLink: string = siaResponse.skylink;

                if (isImage) {
                    setUploadedImages([skyLink]);
                    setLoadingImage(false);

                    const message = 'The image is successfully hosted on: ' + siaUrl + skyLink;
                    const notification: Notification = {
                        message: message,
                        variant: 'filled',
                        severity: 'info',
                        display: true
                    };

                    dispatch(notificationActions.AddNotification(notification));
                } else {
                    setUploadedVideos([skyLink]);
                    setLoadingVideo(false);

                    const message = 'The video is successfully hosted on: ' + siaUrl + skyLink;
                    const notification: Notification = {
                        message: message,
                        variant: 'filled',
                        severity: 'info',
                        display: true
                    };

                    dispatch(notificationActions.AddNotification(notification));
                }
            });
    }

    const handleCaptureImage = (event: any) => {
        if (event.target.accept.includes('image')) {
            if (event.target.files.length === 0) {
                setUploadedImages([]);
                setLoadingImage(false);
            } else {
                // TODO multiple files
                const file = event.target.files[0];
                uploadFile(file, true);
            }
        }
    }

    const handleCaptureVideo = (event: any) => {
        if (event.target.accept.includes('video')) {
            if (event.target.files.length === 0) {
                setUploadedVideos([]);
                setLoadingVideo(false);
            } else {
                // TODO multiple files
                const file = event.target.files[0];
                uploadFile(file, false);
            }
        }
    }

    const isUserLoggedOut = () => {
        return user._id === '';
    }

    const getStateTooltipText = () => {
        if (loadingImage)
            return 'Please wait until the image has been uploaded.';

        if (loadingVideo)
            return 'Please wait until the video has been uploaded.';

        if (isUserLoggedOut())
            return 'Please login to MetaMask first.';
    }

    const getFormButtonTooltipText = () => {
        return getStateTooltipText() || 'Your feedback will be saved off-chain.';
    }

    const getUploadButtonTooltipText = () => {
        return getStateTooltipText() || 'This will start the upload right away and replace previous file.';
    }

    const isFormButtonDisabled = () => {
        return loadingImage || loadingVideo || isUserLoggedOut();
    }

    const isUploadImageButtonDisabled = () => {
        return loadingImage || isUserLoggedOut();
    }

    const isUploadVideoButtonDisabled = () => {
        return loadingVideo || isUserLoggedOut();
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        event.persist();

        const feedback: Feedback = {
            meetingAddress: cachedMeeting._id,
            userAddress: user._id,
            stars: starsRating,
            comment: feedbackComment,
            images: uploadedImages[0] === '' ? [] : uploadedImages,
            videos: uploadedVideos[0] === '' ? [] : uploadedVideos
        };
        const payload = { feedback: feedback };

        axios
            .put('/api/meeting/feedback', payload)
            .then(res => res.data as Meeting)
            .then(meeting => {
                dispatch(userActions.CreateUserFeedback(feedback));
            });
    };

    return (
        <React.Fragment>
            <Grid container>
                {/* Top Section */}
                <Hero maxWidth={false}>
                    <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                        Comments
                    </Typography>
                    <Typography variant="h5" align="center" color="textSecondary" paragraph>
                        You speak, we listen!
                    </Typography>
                </Hero>

                {/* Card Section */}
                <Middle item container spacing={2}>
                    <Container maxWidth="md">
                        <Grid item container xs={12} alignItems="flex-end" justify="center">
                            <Typography variant="h6" align="center" color="textSecondary" paragraph>
                                Got a photo/video to show off? Upload it here!
                            </Typography>
                        </Grid>
                        <Grid item container xs={12} alignItems="flex-end" justify="center">
                            <Grid item container xs={12} alignItems="center" justify="center">
                                <img src="https://www.siasky.net/AAAwORAbUuPv2ipKHVM2yxU-t808Kmx1PVuS6CJnENtIig" height={64} width={64} style={{ marginTop: 5, alignItems: 'center', justifyContent: 'center' }} />
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
                        </Grid>

                        {/* Image / Video upload Section */}
                        {/* TODO: refactor with MeetingAdd */}
                        <Grid container spacing={3} >
                            <Grid item container xs={6} alignItems="center" justify="center">
                                <Grid item xs={3} />
                                <UploadGrid item xs={6}>
                                    <Tooltip title={getUploadButtonTooltipText()}>
                                        <Container>
                                            <UploadText variant="body2" align="center" color="textSecondary" paragraph>
                                                Upload an image
												</UploadText>
                                            <UploadButton
                                                disabled={isUploadImageButtonDisabled()}
                                                inputProps={
                                                    {
                                                        accept: "image/*"
                                                    }
                                                }
                                                id="icon-button-photo"
                                                onChange={handleCaptureImage}
                                                type="file"
                                            />
                                            <label htmlFor="icon-button-photo">
                                                <IconButton color="secondary" style={{ marginLeft: 45 }} component="span">
                                                    <PhotoCamera fontSize="large" />
                                                </IconButton>
                                            </label>

                                        </Container>
                                    </Tooltip>
                                </UploadGrid>
                                <Grid item xs={3} />
                                <Grid item xs={12}>
                                    {
                                        loadingImage && <CircularProgress color="secondary" />
                                    }
                                </Grid>
                            </Grid>
                            <Grid item container xs={6}>
                                <Grid item xs={3} />
                                <UploadGrid item xs={6}>
                                    <Tooltip title={getUploadButtonTooltipText()}>
                                        <Container>
                                            <UploadText variant="body2" align="center" color="textSecondary" paragraph>
                                                Upload a video
												</UploadText>
                                            <UploadButton
                                                disabled={isUploadVideoButtonDisabled()}
                                                inputProps={
                                                    {
                                                        accept: "video/*",
                                                        capture: "camcorder"
                                                    }
                                                }
                                                id="icon-button-video"
                                                onChange={handleCaptureVideo}
                                                type="file"
                                            />
                                            <label htmlFor="icon-button-video">
                                                <IconButton color="secondary" component="span" style={{ marginLeft: 45 }}>
                                                    <Videocam fontSize="large" />
                                                </IconButton>
                                            </label>
                                        </Container>
                                    </Tooltip>
                                </UploadGrid>
                                <Grid item xs={3} />
                                <Grid item xs={12}>
                                    {
                                        loadingVideo && <CircularProgress color="secondary" />
                                    }
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Image / Video preview Section */}
                        <Grid container spacing={3} style={{ marginBottom: 20 }}>
                            <Grid item xs={5}>
                                {
                                    uploadedImages[0] !== '' &&
                                    <Container>
                                        <Typography style={{ fontWeight: 'lighter', fontSize: 14 }}>Image Preview: </Typography>
                                        <CardImage
                                            image={'https://siasky.net/' + uploadedImages[0]}
                                            title='event image preview'
                                        />
                                    </Container>
                                }

                                {
                                    loadingImage &&
                                    <LinearProgress variant="determinate" value={loadingImagePct} color="secondary" />
                                }
                            </Grid>
                            <Grid item xs={2} />
                            <Grid item xs={5}>
                                {
                                    uploadedVideos[0] !== '' &&
                                    <Container>
                                        <Typography style={{ fontWeight: 'lighter', fontSize: 14 }}>Video Preview: </Typography>
                                        <video controls width="318" height="179">
                                            <source src={'https://siasky.net/' + uploadedVideos[0]} type="video/mp4" />
											Your browser does not support the video tag.
										</video>
                                    </Container>
                                }

                                {
                                    loadingVideo &&
                                    <LinearProgress variant="determinate" value={loadingVideoPct} color="secondary" />
                                }
                            </Grid>
                        </Grid>

                        {/* Main Section */}
                        <Typography variant="h6" align="center" color="textSecondary" paragraph>
                            Next, share your experience!
              				</Typography>
                        <form onSubmit={handleSubmit} className="add-meeting-form">
                            <Grid container spacing={3} >
                                <Grid item xs={12}>
                                    <Typography component="legend">Rating</Typography>
                                    <Rating
                                        name="starsRating"
                                        value={starsRating}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setStarsRating(newValue);
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth={true}
                                        id="comment"
                                        label="Comments"
                                        multiline
                                        rows={6}
                                        variant="outlined"
                                        value={feedbackComment}
                                        onChange={(event: any) => setFeedbackComment(event.target.value)}
                                    />
                                </Grid>

                                <Grid item container xs={12}>
                                    <Grid item xs={2} alignItems="center" justify="center">
                                        <Tooltip title={getFormButtonTooltipText()}>
                                            <span>
                                                <MyButton disabled={isFormButtonDisabled() || feedbackComment.length === 0} type="submit"
                                                    style={isFormButtonDisabled() ? { background: 'linear-gradient(45deg, #ff9eb4 30%, #ffb994 90%)' } :
                                                        { background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}
                                                >
                                                    SEND
												</MyButton>
                                            </span>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                    </Container>
                </Middle>

            </Grid>
        </React.Fragment>
    );
}
