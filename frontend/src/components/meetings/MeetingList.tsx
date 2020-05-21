import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { MeetingPreview } from '../../containers/meetings/MeetingPreview';
import { Grid, Container } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Card, CardContent, CardActions } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

interface IProps {
  meetings: Array<Meeting>;
  isEnded: boolean;
}

const Test = styled(Grid)({
  border: '3px solid black'
})

export class MeetingList extends React.Component<IProps> {
  render() {
    const { meetings, isEnded } = this.props;
    const status: string = isEnded ? 'past' : 'active';

    return (
      <Grid container spacing={2} alignItems="center" justify="center">

        {/* {
            !isEnded &&
            <Grid item xs={6}>
              <Link style={{ textDecoration: 'none' }} to='/meeting/create'>
                <Card raised={true} className="meeting-create">
                  <CardContent>
                    <CardActions>
                      <AddCircleIcon fontSize="large" color="primary" />
                        Add your meeting here
                      </CardActions>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          } */}

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
                  <Grid item key={meeting._id} xs={3}>
                    <MeetingPreview key={meeting._id} meeting={meeting} />
                  </Grid>
                );
              })
            )
        }
      </Grid>
    );
  }
}
