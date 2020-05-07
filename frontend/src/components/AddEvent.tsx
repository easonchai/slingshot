import React from 'react';
import { Event } from '../store/events/actions';

interface IProps {
  events: Array<Event>;
  dispatchAddEvent(): void;
}

export class AddEvent extends React.Component<IProps> {
  render() {
    console.log("AddEvent's props", this.props);
    const { dispatchAddEvent } = this.props;

    return (
      <div className="add-event">
        <button
          onClick={dispatchAddEvent}>
            Add new Event
        </button>
      </div>
    );
  }
}
