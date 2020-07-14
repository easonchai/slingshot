import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { TextField } from '@material-ui/core';

interface IProps {
    open: boolean;
}

interface IState {
    open: boolean;
}

export default class CreateProposal extends React.Component<IProps, IState> {
    componentWillMount = () => {
        this.setState({
            open: this.props.open
        })
    }

    componentDidUpdate(prevProps: any) {
        // Typical usage (don't forget to compare props):
        if (this.props.open !== prevProps.open) {
            this.setState({
                open: this.props.open
            })
        }
    }

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Create Proposals"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Enter the address of the new admins to be proposed and old admins to be removed. Click the 'Add' button
                            to add more fields
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="new_address"
                            label="New Admin"
                            type="text"
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="old_address"
                            label="Remove Admin"
                            type="text"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            this.setState({
                                open: this.props.open
                            })
                        }} color="primary">
                            Propose
                        </Button>
                        <Button onClick={() => {
                            this.setState({
                                open: false
                            })
                        }} color="primary" autoFocus>
                            Exit
              </Button>
                    </DialogActions>
                </Dialog>
            </div >
        );
    }
}
