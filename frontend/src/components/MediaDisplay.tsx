import React from 'react';
import { CardMedia, Grid, Container } from '@material-ui/core';
import { CardImage } from './meetings/MeetingAdd';
import { Pagination } from '@material-ui/lab';

interface IProps {
    imageUrl: string,
    videoUrl: string,
}

interface IState {
    page: number,
}

export class MediaDisplay extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props)

        this.state = {
            page: 1
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        if (this.state.page === 1) {
            this.setState({
                page: 2
            })
        } else {
            this.setState({
                page: 1
            })
        }

    }
    render() {
        const { imageUrl, videoUrl } = this.props;

        return (
            <Grid>
                {videoUrl ?
                    <React.Fragment>
                        <Grid container>
                            {this.state.page === 1 ?
                                <Grid item xs={12}>
                                    <CardImage
                                        image={imageUrl}
                                    />
                                </Grid> :
                                <Grid item xs={12}>
                                    <video controls width="603" height="339">
                                        <source src={videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </Grid>

                            }
                            <Grid item xs={12}>
                                <Container style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Pagination count={2} page={this.state.page} onChange={this.handleChange} style={{ marginTop: 5, marginLeft: 200 }} />
                                </Container>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                    :
                    <CardImage
                        image={imageUrl}
                    />}
            </Grid>
        )
    }
}

