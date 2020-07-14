import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Grid, Typography, Box } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

interface IProps {
    open: boolean;
}

interface IState {
    open: boolean;
}

export default class ViewProposal extends React.Component<IProps, IState> {
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
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle id="alert-dialog-title">{"View Proposals"}</DialogTitle>
                    <DialogContent>
                        {/* <DialogContentText id="alert-dialog-description">
                            Let Google help apps determine location. This means sending anonymous location data to
                            Google, even when no apps are running.
                        </DialogContentText> */}
                        <Grid container>
                            <Grid item xs={4} style={{ borderRight: '1px solid #8C8C8C', paddingRight: '2rem' }}>
                                <Typography component="div" >
                                    <Box fontWeight="700" fontSize="1.5rem">
                                        Proposal 01
                                    </Box>
                                    <Box fontWeight="300" fontSize="1rem">
                                        Jul 13, 2020
                                    </Box>
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography component="div" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
                                    <Box fontWeight="700" fontSize="2rem">
                                        Proposal 01
                                    </Box>
                                    <Box fontWeight="300" fontSize="1rem">
                                        Created Jul 13, 2020
                                    </Box>
                                    <br />
                                    <Box fontWeight="400" fontSize="1rem">
                                        Proposal Details: <br />
                                    </Box>
                                    <Box fontWeight="300" fontSize="1rem">
                                        New Admins: <br />
                                        0x0asd02jf9asdwg4 <br />
                                        0x07sg129ga2sfs76
                                        <br /><br />
                                        Old Admins: <br />
                                        0x7ca2dksy20cnaks
                                    </Box>
                                    <br /><br />
                                    <Box display="flex" flexDirection="row" fontWeight="500" fontSize="1.2rem" alignItems="center">
                                        <CheckCircleIcon style={{ marginRight: '1rem', color: "#4cae4f" }} />
                                        Active
                                    </Box>
                                </Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            this.setState({
                                open: this.props.open
                            })
                        }} color="primary">
                            Vote
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
