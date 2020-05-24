import React from 'react';
import { CardMedia, Grid } from '@material-ui/core';
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
                        {this.state.page === 1 ?
                            <CardImage
                                image={imageUrl}
                            /> :
                            <video controls width="603" height="339">
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        }
                        <Pagination count={2} page={this.state.page} onChange={this.handleChange} style={{ marginTop: 5, marginLeft: 200 }} />
                    </React.Fragment>
                    :
                    <CardImage
                        image={imageUrl}
                    />}
            </Grid>
        )
    }
}

