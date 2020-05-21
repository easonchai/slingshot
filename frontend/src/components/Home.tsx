import React from 'react';
import { MeetingList } from '../containers/meetings/MeetingList';
import {
  Theme, Grid, Button, Container, Typography, Box, CssBaseline
} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const MyButton = styled(Button)({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
});

const Hero = styled(Container)({
  margin: 0,
  background: 'white',
  padding: '30px 80px',
  height: '300px',
})

const Middle = styled(Grid)({
  padding: '60px 20px'
})

interface IProps {
  dispatchGetAllMeetings(): void;
}

export class Home extends React.Component<IProps> {
  componentWillMount() {
    this.props.dispatchGetAllMeetings();
  }

  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <Grid container>
          {/* Top Section */}
          <Hero maxWidth={false}>
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Slingshot
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Launch your next meeting forward.
            </Typography>
            <br />
            <Grid container spacing={2} justify="center">
              <Link style={{ textDecoration: 'none' }} to='/meeting/create/first'>
                <MyButton>Host a Meeting</MyButton>
              </Link>
            </Grid>
          </Hero>

          {/* Card Section */}
          <Middle item container className="meetings-list" spacing={2}>
            <Container maxWidth="lg">
              <Typography variant="h3" align="center" color="textPrimary" paragraph>
                Active Meetings
              </Typography>
              <MeetingList isEnded={false} />
              <br /><br /><br />
              <Typography variant="h3" align="center" color="textPrimary" paragraph>
                Past Meetings
              </Typography>
              <MeetingList isEnded={true} />
            </Container>
          </Middle>

          <Container>
            <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
              Slingshot 2020
            </Typography>
          </Container>
        </Grid>
      </React.Fragment>
    );
  }
}