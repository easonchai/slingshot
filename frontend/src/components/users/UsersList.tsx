import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { Meeting } from '../../store/meetings/actions';

interface IProps {
    cachedMeeting: Meeting
}

export class UsersList extends React.Component<IProps> {
  render() {
    return (
        <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={ 2 }>
            <Grid container spacing={ 2 }>
                <Grid item xs={ 12 }>
                    Participants
                </Grid>

                {
                    this.props.cachedMeeting.users
                        .map((ethereumAddress) => {
                            return (
                                <Grid item key={ ethereumAddress } xs={ 12 }>
                                    { ethereumAddress }
                                    <Button disabled={ false } type="submit" variant="outlined" color="primary">
                                        MARK ATTENDANCE
                                    </Button>
                                </Grid>
                            );
                        })
                }
            </Grid>
        </Grid>
    );
  }
}
