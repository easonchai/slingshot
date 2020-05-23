import React from 'react';
import { Collapse, IconButton, Snackbar, Slide } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';
import { Notification } from '../../store/notifications/actions';
import { TransitionProps } from '@material-ui/core/transitions';

export interface IProps {
  index: number,

  notification: Notification,

  OnClose(index: number): void;
}

function TransitionLeft(props: TransitionProps) {
  return <Slide {...props} direction="left" />;
}

export default class AlertNotification extends React.Component<IProps> {
  render() {
    return (
      <div>
        <Collapse in={this.props.notification.display}>
          <Snackbar
            TransitionComponent={TransitionLeft}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={true} autoHideDuration={5000} onClose={() => this.props.OnClose(this.props.index)}>
            <Alert
              variant={this.props.notification.variant}
              severity={this.props.notification.severity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => this.props.OnClose(this.props.index)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {this.props.notification.message}
            </Alert>
          </Snackbar>
        </Collapse>
      </div>
    );
  }
}