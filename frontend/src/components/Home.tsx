import React from 'react';
import { MeetingList } from '../containers/meetings/MeetingList';
import Grid from '@material-ui/core/Grid';

interface IProps {
  dispatchGetAllMeetings(): void;
}

export class Home extends React.Component<IProps> {
  componentWillMount() {
    this.props.dispatchGetAllMeetings();
  }

  render() {
    return (
      <Grid container className="meetings-list" spacing={ 4 }>
        <MeetingList isEnded={ false } />
        <MeetingList isEnded={ true } />
      </Grid>
    );
  }
}
