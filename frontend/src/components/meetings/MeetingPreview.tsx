import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { Card, CardContent, CardHeader } from '@material-ui/core';

export interface IProps {
  meeting: Meeting;
}

export class MeetingPreview extends React.Component<IProps> {
  render() {
    const title = this.props.meeting.name + ' ( ' + this.props.meeting.stake + ' ETH )';
    
    let url = '/meetings/';
    if (this.props.meeting.meetingAddress) {
      url += 'contract/' + this.props.meeting.meetingAddress;
    } else {
      url += 'hash/' + this.props.meeting.txHash;
    }

    return (
      <Link style={ { textDecoration: 'none' } } to={ url }>
        <Card raised={ true } className="meeting-preview">
          <CardHeader title={ title } />
          <CardContent>
            <p>
              Max participants: { this.props.meeting.maxParticipants }
            </p>
            <p>
              { this.props.meeting.description }
            </p>
          </CardContent>
        </Card>
      </Link>
    );
  }
}