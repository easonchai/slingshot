import React from 'react';
import { EventList } from './../containers/EventList';

interface IProps {
}

export class Home extends React.Component<IProps> {
  render() {
    return (
      <div>
        <EventList isEnded={false} />
        <EventList isEnded={true} />
      </div>
    );
  }
}
