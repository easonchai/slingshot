import React from 'react';
import { Event } from '../store/events/actions';
import { Card, CardContent, CardHeader } from '@material-ui/core';

export interface IProps {
  event: Event;
}

export class EventPreview extends React.Component<IProps> {
  render() {
    console.log("Event Preview's props", this.props);

    return (
      <Card raised={true} className="event-preview">
        <CardHeader
          title={this.props.event.name}
        />
        <CardContent>
          { this.props.event.address }
        </CardContent>
      </Card>
    );
  }
}