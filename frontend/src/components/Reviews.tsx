import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IAppState } from '../store/index';
import {
    Container,
    Grid,
    Paper,
    Box,
    Typography,
} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import { Feedback } from '../store/meetings/actions';
import { CardImage, Middle } from './meetings/MeetingAdd';
import Blockies from 'react-blockies';

export default function Reviews() {
    const dispatch = useDispatch();

    const user = useSelector((state: IAppState) => state.userReducer.user);
    const cachedMeeting = useSelector((state: IAppState) => state.meetingsReducer.cachedMeeting);

    const reviewCount = cachedMeeting.data.feedback.length;

    return (
        <React.Fragment>
            <Middle item container spacing={2}>
                <Container maxWidth="md">
                    Comments ({reviewCount})
                </Container>

                {
                    cachedMeeting.data.feedback.map((review: Feedback) => {
                        return (
                            <Grid container>
                                <Grid item xs={2} />
                                <Grid item xs={8}>
                                    <Paper elevation={2} style={{ margin: 10, padding: 10 }}>
                                        <Container maxWidth="md" style={{ marginBottom: 10 }}>
                                            <Grid item container xs={12}>
                                                <Grid item xs={6} container>
                                                    <Grid item xs={12}>
                                                        <Typography component="div">
                                                            <Box fontSize="body2.fontSize" fontWeight="fontWeightBold" style={{ marginBottom: 5, paddingTop: 7 }}>
                                                                From:
                                                            </Box>
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item>
                                                        <Blockies seed={review.userAddress} scale={2} />
                                                    </Grid>
                                                    <Grid item>
                                                        <Typography component="div">
                                                            <Box fontSize="body2.fontSize" fontWeight="fontWeightLight" style={{ marginLeft: 8 }}>
                                                                {review.userAddress}
                                                            </Box><br />
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={4} />
                                                <Grid item>
                                                    <Rating
                                                        name="starsRating"
                                                        value={review.stars}
                                                        readOnly
                                                    />
                                                </Grid>


                                                <Grid item xs={12}>
                                                    <Typography component="div">
                                                        <Box fontSize="body2.fontSize" fontWeight="fontWeightBold" style={{ marginBottom: 8 }}>
                                                            Comment:
                                                            </Box>
                                                        <Box fontSize="body2.fontSize" fontWeight="fontWeightLight">
                                                            {review.comment}
                                                        </Box><br />
                                                    </Typography>
                                                </Grid>

                                                {
                                                    review.images.length > 0 &&
                                                    <Grid item xs={12}>
                                                        <Typography component="div">
                                                            <Box fontSize="body2.fontSize" fontWeight="fontWeightBold" style={{ marginBottom: 8 }}>
                                                                Attachments:
                                                            </Box>
                                                        </Typography>
                                                        <CardImage
                                                            style={{ width: 318, paddingTop: '26.17%' }}
                                                            image={'https://siasky.net/' + review.images[0]}
                                                            title={review.comment}
                                                        />
                                                    </Grid>
                                                }
                                            </Grid>
                                        </Container>
                                    </Paper>
                                </Grid>
                                <Grid item xs={2} />
                            </Grid>
                        );
                    })
                }
            </Middle>
        </React.Fragment >
    );
}
