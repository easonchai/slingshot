import React from 'react';
import { Event } from '../store/events/actions';
import { Card, CardContent, CardHeader } from '@material-ui/core';

export interface IProps {
  event: Event;
}

export class EventPreview extends React.Component<IProps> {
  render() {
    const title = this.props.event.name + ' ( ' + this.props.event.stake + ' ETH )';

    return (
      <Card raised={true} className="event-preview">
        <CardHeader
          title={title}
        />
        <CardContent>
          <p>
            Max participants: { this.props.event.maxParticipants }
          </p>
          <p>
            { this.props.event.description }
          </p>
        </CardContent>
      </Card>
    );
  }
}