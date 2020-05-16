import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { Card, CardContent, CardHeader } from '@material-ui/core';

export interface IProps {
  meeting: Meeting;
}

export class MeetingPreview extends React.Component<IProps> {
  render() {
    const url = '/meeting/' + this.props.meeting._id;
    const title = this.props.meeting.data.name + ' ( ' + this.props.meeting.data.stake + ' ETH )';

    return (
      <Link style={ { textDecoration: 'none' } } to={ url }>
        <Card raised={ true } className="meeting-preview">
          <CardHeader title={ title } />
          <CardContent>
            <p>
              Max participants: { this.props.meeting.data.maxParticipants }
            </p>
            <p>
              { this.props.meeting.data.description }
            </p>
          </CardContent>
        </Card>
      </Link>
    );
  }
}