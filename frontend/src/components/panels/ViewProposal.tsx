import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Grid, Typography, Box, makeStyles, Theme, DialogContentText } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Meeting, Proposal } from '../../store/interfaces';
import EtherService from '../../services/EtherService';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: any) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: 224,
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
}));

interface IProps {
    isViewing: boolean;
    open: boolean;
    meeting: Meeting;
    userAddress: string;
    dispatchExecuteMeetingProposal(meetingAddress: string, approverAddress: string, proposal: Proposal): void;
    dispatchVoteMeetingProposal(meetingAddress: string, approverAddress: string, proposal: Proposal): void;
}

interface IState {
    open: boolean;
    value: number;
}

export default class ViewProposal extends React.Component<IProps, IState> {
    // classes = useStyles();
    etherService: EtherService;

    constructor(props: any) {
        super(props);
        this.etherService = EtherService.getInstance();

        this.state = {
            open: this.props.open,
            value: 0,
        }
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.open !== prevProps.open) {
            this.setState({
                open: true
            })
        }
    }

    callbackFn = (result: any) => {
        console.log("cb fn ", result);
    }

    handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        this.setState({
            value: newValue,
        })
    };

    hasProposal = () => {
        if (this.props.meeting.proposals.length > 0) {
            return true
        }
        return false
    }

    retrieveProposal = (id: number) => {
        return this.props.meeting.proposals.filter(proposal => proposal.id.index === id)[0];
    }

    hasUserVotedOnProposalId = (id: number) => {
        const proposal = this.retrieveProposal(id);

        return proposal.votes.includes(this.props.userAddress);
    }

    allowedToVote = () => {
        const id = this.state.value + 1;

        return this.hasProposal() && !this.hasUserVotedOnProposalId(id);
    }

    allowedToExecute = () => {
        const totalAdmins = this.props.meeting.admins.length
        const voted = this.props.meeting.proposals[this.state.value].votes.length;
        // Need 4/5 consensus
        return (voted * 5) >= (totalAdmins * 4);
    }

    handleVote = () => {
        let id = this.state.value + 1
        let proposal = this.retrieveProposal(id);

        proposal.votes.push(this.props.userAddress);

        this.etherService.approveProposal(
            this.props.meeting.data.clubAddress,
            id,
            this.callbackFn
        )
            .then((res: any) => {
                console.log("success vote ", res);
                this.props.dispatchVoteMeetingProposal(this.props.meeting._id, this.props.userAddress, proposal);
            }, (reason: any) => {
                console.log("vote: ", reason);
            })
            .catch((err: any) => {
                console.log("vote: ", err);
            });
    }

    handleExecute = () => {
        let id = this.state.value + 1
        let proposal = this.retrieveProposal(id);

        proposal.state = "Executed"
        this.props.meeting.data.isPaused = false;

        console.log("New state: " + proposal.state);

        this.etherService.executeProposal(
            this.props.meeting.data.clubAddress,
            id,
            this.callbackFn
        )
            .then((res: any) => {
                console.log("success execute ", res);
                this.props.dispatchExecuteMeetingProposal(this.props.meeting._id, this.props.userAddress, proposal);
            }, (reason: any) => {
                //   this.props.dispatchAddErrorNotification('handlePauseMeeting: ' + reason);
                console.log("execute: ", reason);
            })
            .catch((err: any) => {
                //   this.props.dispatchAddErrorNotification('handlePauseMeeting: ' + err);
                console.log("execute: ", err);
            });
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
                        {
                            this.hasProposal() ?
                                <Grid container>
                                    <Grid item xs={4} style={{ borderRight: '1px solid #8C8C8C', paddingRight: '2rem' }}>
                                        <Tabs
                                            orientation="vertical"
                                            variant="scrollable"
                                            value={this.state.value}
                                            onChange={this.handleChange}
                                            aria-label="Proposal Tabs"
                                        // className={this.classes.tabs}
                                        >
                                            {
                                                this.props.meeting.proposals.map(proposal => {
                                                    let title = "Proposal " + proposal.id.index;
                                                    return (<Tab label={title} {...a11yProps(proposal.id.index - 1)} />);
                                                })
                                            }
                                        </Tabs>
                                    </Grid>
                                    <Grid item xs={8}>
                                        {
                                            this.props.meeting.proposals.map(data => {
                                                return (
                                                    <TabPanel value={this.state.value} index={data.id.index - 1}>
                                                        <Typography component="div" style={{ paddingLeft: '1rem', paddingRight: '1rem', display: 'inline-block' }}>
                                                            <Box fontWeight="700" fontSize="2rem">
                                                                {`Proposal ${data.id.index}`}
                                                            </Box>
                                                            <Box fontWeight="300" fontSize="1rem">
                                                                Created {(new Date(data.created)).toLocaleDateString()}
                                                            </Box>
                                                            <br />
                                                            <Box fontWeight="400" fontSize="1rem">
                                                                Proposal Details: <br />
                                                            </Box>
                                                            <Box fontWeight="300" fontSize="1rem">
                                                                New Admins: <br />
                                                                {data.newAdmin.map(admin => {
                                                                    return (
                                                                        <div>
                                                                            {admin} <br />
                                                                        </div>
                                                                    )
                                                                })}
                                                                <br /><br />
                                                                Old Admins: <br />
                                                                {data.oldAdmin.map(admin => {
                                                                    return (
                                                                        <div>
                                                                            {admin} <br />
                                                                        </div>
                                                                    )
                                                                })}
                                                                <br /><br />
                                                                Votes: <br />
                                                                {`${data.votes.length}`}
                                                            </Box>
                                                            <br /><br />
                                                            <Box display="flex" flexDirection="row" fontWeight="500" fontSize="1.2rem" alignItems="center">
                                                                <CheckCircleIcon style={{ marginRight: '1rem', color: "#4cae4f" }} />
                                                                {data.state}
                                                            </Box>
                                                        </Typography>
                                                    </TabPanel>);
                                            })
                                        }
                                    </Grid>
                                </Grid>
                                :
                                <DialogContentText>
                                    No proposals have been created!
                                </DialogContentText>
                        }
                    </DialogContent>
                    <DialogActions>
                        {this.props.isViewing ?
                            <Button disabled={!this.allowedToVote()} onClick={this.handleVote} color="primary">
                                Vote
                        </Button>
                            :
                            <Button disabled={!this.allowedToExecute()} onClick={this.handleExecute} color="primary">
                                Execute
                        </Button>
                        }
                        <Button onClick={() => {
                            console.log("false")
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
