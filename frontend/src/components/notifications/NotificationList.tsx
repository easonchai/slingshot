import React from 'react';
import { Notification } from '../../store/notifications/actions';
import AlertNotification from './AlertNotification';

interface IProps {
  notifications: Array<Notification>;
  dispatchRemoveNotification(index: number): void;
}

export class NotificationList extends React.Component<IProps> {
  render() {
    return (
      <div>
        {
          this.props.notifications.map((notification: Notification, index: number) => {
            return (
              <AlertNotification
                key={index}
                index={index}
                notification={notification}
                OnClose={this.props.dispatchRemoveNotification}
              />
            );
          })
        }
      </div>
    );
  }
}