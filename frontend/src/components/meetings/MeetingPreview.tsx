import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { Card, CardContent, CardHeader, IconButton, Typography, CardActions, Button } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import ShareIcon from "@material-ui/icons/Share";

const CustButton = styled(Button)({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 38,
  padding: '0 30px',
});

const DisplayCard = styled(Card)({
  maxWidth: 280,
})

export interface IProps {
  meeting: Meeting;
}

export class MeetingPreview extends React.Component<IProps> {
  render() {
    const url = '/meeting/' + this.props.meeting._id;
    const title = this.props.meeting.data.name
    const stake = 'Stake Required: ' + this.props.meeting.data.stake + ' ETH';

    return (
      <Link style={{ textDecoration: 'none' }} to={url}>
        <DisplayCard raised={true} className="meeting-preview">
          <CardHeader
            action={
              <IconButton aria-label="share">
                <ShareIcon />
              </IconButton>
            }
            title={title}
            subheader={stake}
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              {this.props.meeting.data.description}
            </Typography>
            <br />
            <Typography variant="body2" color="textSecondary" component="p">
              Max participants: {this.props.meeting.data.maxParticipants}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <CustButton size="small">
              RSVP
            </CustButton>
          </CardActions>
        </DisplayCard>
      </Link>
    );
  }
}