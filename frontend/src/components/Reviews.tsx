import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IAppState } from '../store/index';
import {
    Container,
    Grid,
} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import { Feedback } from '../store/meetings/actions';
import { CardImage, Middle } from './meetings/MeetingAdd';

export default function Reviews() {
    const dispatch = useDispatch();

    const user = useSelector((state: IAppState) => state.userReducer.user);
    const cachedMeeting = useSelector((state: IAppState) => state.meetingsReducer.cachedMeeting);

    const reviewCount = cachedMeeting.data.feedback.length;

    return (
        <React.Fragment>
            <Middle item container spacing={2}>
                <Container maxWidth="md">
                    Reviews ({reviewCount})
                </Container>

                {
                    cachedMeeting.data.feedback.map((review: Feedback) => {
                        return (
                            <Container maxWidth="md">
                                <Grid item container xs={12}>
                                    <Grid item xs={6}>
                                        <Rating
                                            name="starsRating"
                                            value={review.stars}
                                            readOnly
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        {review.userAddress}
                                    </Grid>

                                    <Grid item xs={12}>
                                        {review.comment}
                                    </Grid>

                                    {
                                        review.images.length > 0 &&
                                        <Grid item xs={12}>
                                            <CardImage
                                                image={'https://siasky.net/' + review.images[0]}
                                                title="user's picture of the event"
                                            />
                                        </Grid>
                                    }
                                </Grid>
                            </Container>
                        );
                    })
                }
            </Middle>
        </React.Fragment >
    );
}
