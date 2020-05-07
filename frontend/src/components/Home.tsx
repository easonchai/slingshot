import React from 'react';
import { EventList } from './../containers/EventList';

interface IProps {
}

export class Home extends React.Component<IProps> {
  render() {
    console.log("Home's props", this.props);

    return (
      <div>
        <h1>Home!</h1>
        <EventList isEnded={false} />
        <EventList isEnded={true} />
      </div>
    );
  }
}
