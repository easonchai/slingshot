import React from 'react';
import { Collapse, IconButton } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';
import { Notification } from '../../store/notifications/actions';

export interface IProps {
  index: number,
  
  notification: Notification,

  OnClose(index: number): void;
}

export default class AlertNotification extends React.Component<IProps> {
  render() {
    return (
        <div>
          <Collapse in={ this.props.notification.display }>
            <Alert
              variant={ this.props.notification.variant }
              severity={ this.props.notification.severity }
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => this.props.OnClose(this.props.index) }
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              { this.props.notification.message }
            </Alert>
          </Collapse>
        </div>
      );
  }
}