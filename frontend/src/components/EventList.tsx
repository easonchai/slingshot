import React from 'react';
import { EventPreview } from './EventPreview';
import { AddEvent } from '../containers/AddEvent';
import { Event } from '../store/events/actions';

interface IProps {
  events: Array<Event>;
  isEnded: boolean;
}

export class EventList extends React.Component<IProps> {
  render() {
    const { events, isEnded } = this.props;
    console.log("EventList's props", this.props);

    return (
      <div className="events-list">
        <h1>{ isEnded ? 'Passive' : 'Active' } Events.</h1>
        
        { !isEnded && <AddEvent /> }

        {
          events.filter((event) => {
            return event.isEnded === isEnded;
          }).map((event) => {
            return (<EventPreview />)
          })
        }
      </div>
    );
  }
}
