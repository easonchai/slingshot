import React from 'react';
import { Meeting } from '../../store/interfaces';
import { MeetingPreview } from '../../containers/meetings/MeetingPreview';
import { Grid, Box } from '@material-ui/core';

interface IProps {
  meetings: Array<Meeting>;
  isEnded: boolean;
}

interface IState {
  page: number
}

export class MeetingList extends React.Component<IProps, IState> {
  render() {
    const { meetings, isEnded } = this.props;
    const status: string = isEnded ? 'past' : 'active';

    return (
      <Grid container spacing={2} alignItems="center" justify="center">
        {
          meetings.length === 0 ?
            (
              <Grid container alignItems="center" justify="center" item xs={12}>
                <div>There are currently no {status} meetings.</div>
              </Grid>
            )
            :
            (
              meetings.map((meeting) => {
                return (
                  <Grid item key={meeting._id} xs={12} sm={6} md={4} lg={3}>
                    <Box display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <MeetingPreview key={meeting._id} meeting={meeting} />
                    </Box>
                  </Grid>
                );
              })
            )
        }
      </Grid>
    );
  }
}
