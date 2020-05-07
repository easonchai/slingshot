import React from 'react';
import { Home } from './../containers/Home';
import { Event } from '../store/events/actions';

interface IProps {
  events: Array<Event>;
}

export class App extends React.Component<IProps> {
  render() {
    console.log("App's props", this.props);

    return (
      <div>
        <Home />
      </div>
    );
  }
}
