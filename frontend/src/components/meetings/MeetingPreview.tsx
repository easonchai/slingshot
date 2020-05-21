import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { Card, CardContent, CardHeader, IconButton, Typography, CardActions, Button, Container } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import ShareIcon from "@material-ui/icons/Share";
import SharePopup from "../SharePopup"

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
  height: 320,
})

export interface IProps {
  meeting: Meeting;
}

export class MeetingPreview extends React.Component<IProps> {
  render() {
    const url = '/meeting/' + this.props.meeting._id;
    const title = this.props.meeting.data.name
    const stake = 'Stake Required: ' + this.props.meeting.data.stake + ' ETH';
    const description = this.props.meeting.data.description.length > 150 ?
      this.props.meeting.data.description.substring(0, 149) + '...' :
      this.props.meeting.data.description

    return (
      <DisplayCard raised={true} className="meeting-preview">
        <CardHeader
          action={
            <SharePopup />
          }
          title={title}
          subheader={stake}
        />
        <Link style={{ textDecoration: 'none' }} to={url}>
          <CardContent>
            <Typography variant="body2" color="textPrimary" component="p">
              {description}
            </Typography>
            <br />
            {
              description.length < 38 ? (<Container><br /><br /><br /><br /></Container>) :
                description.length < 76 ? (<Container><br /><br /><br /></Container>) :
                  description.length < 114 ? (<Container><br /><br /></Container>) :
                    description.length < 150 ? (<br />) : null
            }
            <Typography variant="body2" color="textSecondary" component="p">
              Max participants: {this.props.meeting.data.maxParticipants}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <CustButton size="small">
              RSVP
            </CustButton>
          </CardActions>
        </Link>
      </DisplayCard >

    );
  }
}