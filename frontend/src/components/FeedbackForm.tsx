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
    Tooltip,
    Typography,
} from '@material-ui/core';
import { PhotoCamera, Videocam } from '@material-ui/icons';
import { IAppState } from '../store/index';
import { Hero, Middle } from './meetings/MeetingAdd';
import { actions as notificationActions, Notification } from '../store/notifications/actions';

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

    // componentDidMount alternative
    React.useEffect(() => {
        console.log('mounting FeedbackForm');

        // componentWillUnmount alternative
        return () => console.log('unmounting FeedbackForm');
    }, []);

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
        return getStateTooltipText() || 'This will require smart contract interaction.';
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

    return (
        <React.Fragment>
            <Grid container>
                {/* Top Section */}
                <Hero maxWidth={false}>
                    <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                        Reviews
                    </Typography>
                    <Typography variant="h5" align="center" color="textSecondary" paragraph>
                        We would like to hear your feedback
                    </Typography>
                </Hero>

                {/* Card Section */}
                <Middle item container spacing={2}>
                    <Container maxWidth="md">
                        <Grid item container xs={12} alignItems="flex-end" justify="center">
                            <Typography variant="h6" align="center" color="textSecondary" paragraph>
                                Upload media files while you fill out the details of the event below
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
                        {/* TODO: refactor with MeetingAdd */}
                        <Grid container spacing={3} >
                            <Tooltip title={getUploadButtonTooltipText()}>
                                <Grid item xs={6}>
                                    <Input
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
                                        <IconButton color="primary" component="span">
                                            <PhotoCamera />
                                        </IconButton>
                                    </label>
                                    {
                                        loadingImage && <CircularProgress color="secondary" />
                                    }
                                </Grid>
                            </Tooltip>
                            <Tooltip title={getUploadButtonTooltipText()}>
                                <Grid item xs={6}>
                                    <Input
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
                                        <IconButton color="primary" component="span">
                                            <Videocam />
                                        </IconButton>
                                    </label>
                                    {
                                        loadingVideo && <CircularProgress color="secondary" />
                                    }
                                </Grid>
                            </Tooltip>
                        </Grid>

                        {/* Image / Video preview Section */}
                        <Grid container spacing={3} >
                            <Grid item xs={6}>
                                {
                                    uploadedImages.length > 0 &&
                                    <img
                                        src={'https://siasky.net/' + uploadedImages[0]}
                                        alt='event image preview'
                                        width="256"
                                        height="256"
                                    />
                                }

                                {
                                    loadingImage &&
                                    <LinearProgress variant="determinate" value={loadingImagePct} color="secondary" />
                                }
                            </Grid>
                            <Grid item xs={6}>
                                {
                                    uploadedVideos.length > 0 &&
                                    <video controls width="256" height="144">
                                        <source src={'https://siasky.net/' + uploadedVideos[0]} type="video/mp4" />
											Your browser does not support the video tag.
										</video>
                                }

                                {
                                    loadingVideo &&
                                    <LinearProgress variant="determinate" value={loadingVideoPct} color="secondary" />
                                }
                            </Grid>
                        </Grid>
                    </Container>
                </Middle>

            </Grid>
        </React.Fragment>
    );
}
