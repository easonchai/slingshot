import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { MeetingPreview } from '../../containers/meetings/MeetingPreview';
import { Grid } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Card, CardContent, CardActions } from '@material-ui/core';

interface IProps {
  meetings: Array<Meeting>;
  isEnded: boolean;
}

export class MeetingList extends React.Component<IProps> {
  render() {
    const { meetings, isEnded } = this.props;

    return (
      <Grid item xs={ 12 }>
        <h1>{ isEnded ? 'Finished' : 'Active' } Meetings</h1>

        <Grid container alignItems="center" justify="center" spacing={ 6 }>

          {
            !isEnded &&
              <Grid item xs={ 6 }>
                <Link style={ { textDecoration: 'none' } } to='/meetings/create'>
                  <Card raised={ true } className="meeting-create">
                    <CardContent>
                      <CardActions>
                        <AddCircleIcon fontSize="large" color="primary" />
                        Add your meeting here
                      </CardActions>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
          }
          
          {
            meetings.length === 0 ?
              (
                <Grid container alignItems="center" justify="center" item xs={ 12 }>
                  <div>There are currently no { isEnded ? 'Finished' : 'Active' } meetings.</div>
                </Grid>
              )
              :
              (
                meetings.map((meeting) => {
                  return (
                    <Grid key={ meeting.txHash } item xs={ 6 }>
                      <MeetingPreview key={ meeting.txHash } meeting={ meeting } />
                    </Grid>
                  );
                })
              )
          }
        </Grid>
      </Grid>
    );
  }
}
