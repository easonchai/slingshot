import React from 'react';
import { Link } from 'react-router-dom';
import { EventPreview } from './EventPreview';
import { Event } from '../store/events/actions';

interface IProps {
  events: Array<Event>;
  isEnded: boolean;
}

export class EventList extends React.Component<IProps> {
  render() {
    const { events, isEnded } = this.props;

    return (
      <div className="events-list">
        <h1>{ isEnded ? 'Passive' : 'Active' } Events.</h1>
        
        { !isEnded && <Link to='/events/create'>Create new Event</Link> }

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
