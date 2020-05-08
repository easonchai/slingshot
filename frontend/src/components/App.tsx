import React from 'react';
import { Home } from './../containers/Home';
import { Event } from '../store/events/actions';
import { Container } from '@material-ui/core';

interface IProps {
  events: Array<Event>;
}

export class App extends React.Component<IProps> {
  render() {
    return (
      <Container maxWidth="sm">
        <Home />
      </Container>
    );
  }
}
