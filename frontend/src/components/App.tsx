import React from 'react';
import { Home } from './../containers/Home';
import { Container } from '@material-ui/core';

interface IProps {
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
