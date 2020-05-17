import React from 'react';
import { Collapse, IconButton } from '@material-ui/core';
import { Alert, AlertProps } from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';

export interface IProps {
  index: number,

  message: string;
  variant: AlertProps['variant'];
  severity: AlertProps['severity'];
  display: boolean;

  OnClose(index: number): void;
}

export default class AlertNotification extends React.Component<IProps> {
  render() {
    return (
        <div>
          <Collapse in={ this.props.display }>
            <Alert
              variant={ this.props.variant }
              severity={ this.props.severity }
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
              { this.props.message }
            </Alert>
          </Collapse>
        </div>
      );
  }
}