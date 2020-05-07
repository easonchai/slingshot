import React from 'react';
import { Home } from './../containers/Home';
import { Event } from '../store/events/actions';

interface IProps {
  events: Array<Event>;
}

export class App extends React.Component<IProps> {
  render() {
    console.log("App's props", this.props);
    
    // TODO: Route logic

    return (
      <div>
        <Home />
      </div>
    );
  }
}
