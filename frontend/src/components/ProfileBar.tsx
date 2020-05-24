import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IAppState } from '../store/index';
import EtherService from '../services/EtherService';
import { actions as userActions, User } from '../store/users/actions';
import { actions as meetingActions } from '../store/meetings/actions';
import { actions as notificationActions, Notification } from '../store/notifications/actions';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { styled } from '@material-ui/core/styles';
import { Grid, Typography, Button, Box, Divider, Container, Paper, Link, Tooltip, CardMedia } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import CloseIcon from '@material-ui/icons/Close';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Blockies from 'react-blockies'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Meeting } from '../store/meetings/actions';
import { initState as userDefaultState } from '../store/users/reducers';

const TopBar = styled(AppBar)({
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    boxShadow: 'none',
})

const Avatar = styled(AccountCircle)({
    color: 'white',
})

const AddressButton = styled(Button)({
    textTransform: 'none'
})

const SignInIcon = styled(LockIcon)({
    fontSize: "small",
    color: "#bdbdbd"
})

const CloseButton = styled(IconButton)({
    position: 'absolute',
    right: 23,
    top: 7,
    color: 'white',
})

const StyledDialogTitle = styled(DialogTitle)({
    background: '#f05475',
    color: 'white',
})

const Domain = styled(Typography)({
    color: 'white',
})

const QuickSignIn = styled(Button)({
    background: 'none',
    color: 'white'
})

const BlockAvatar = styled(Blockies)({
    height: "200%",
    width: "200%"
})

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProfileBar() {
    const location = useLocation();
    const [open, setOpen] = React.useState(false);
    const dispatch = useDispatch();
    const etherService = EtherService.getInstance();
    const user = useSelector((state: IAppState) => state.userReducer.user);
    const meetings = useSelector((state: IAppState) => state.meetingsReducer.meetings);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const updateOrganizerAddress = (user: User) => {
        // TODO: store path names in constants
        if (location.pathname === '/meeting/create/first') {
            // In case the user switches account while creating a new event,
            // we want to update the cached organizer address as well.
            dispatch(meetingActions.UpdateOrganiserEthereumAddress(user));
        }
    }

    const accChangeCallback = (accounts: string[]) => {
        const address = accounts[0];

        if (address) {
            // Retrieve the user's details from DB and update redux store after a user switched account
            axios
                .get('/api/user/id/' + address)
                .then(res => res.data as User)
                .then(user => {
                    updateOrganizerAddress(user);
                    dispatch(userActions.UpdateUserEthereumAddress(user));

                    // Lookup user's ENS domain and save in the redux store after account changed.
                    etherService.findENSDomain(address, resolveDomain);
                });
        } else {
            // reset the user in redux store when user logs out from MM
            const user: User = { ...userDefaultState.user };

            updateOrganizerAddress(user);
            dispatch(userActions.UpdateUserEthereumAddress(user));
        }
    }

    const chainChangeCallback = (chainID: string) => {
        // TODO: remove the magic number for Rinkeby network/chain id
        if (chainID !== '4') {
            const notification: Notification = {
                message: 'You are not on Rinkeby!',
                variant: 'filled',
                severity: 'error',
                display: true
            };

            dispatch(notificationActions.AddNotification(notification));
        }
    }

    const signIn = () => {
        if (!etherService.isEthereumNodeAvailable()) {
            const notification: Notification = {
                message: 'Please install MetaMask extension first.',
                variant: 'filled',
                severity: 'error',
                display: true
            };

            dispatch(notificationActions.AddNotification(notification));
        } else {
            etherService.requestConnection();
        }
    }

    const resolveDomain = (domain: string) => {
        // in case the ENS domain doesn't match the one in redux store,
        // we want to update both the redux store and save it in the DB
        if (domain !== user.data.ensDomain) {
            dispatch(userActions.UpdateUserENSDomain(domain));

            axios
                .put('/api/user/update/', user)
                .then(res => res.data as User)
                .then(user => {
                    // entry point to notify that ENS domain synched with database
                });
        }
    }

    /**
     * Filter out meetings a user RSVP'd to,
     * make sure they haven't been cancelled nor ended.
     * Sort by start datetime, with most recent one coming up first.
     *
     * We can make use of redux store by directly working with:
     *      user.rsvp
     *      user.attend
     *      user.withdraw
     * to find all the meetings the user registered for.
     *
     * Once the user switches to another account,
     * the listener will update the user in redux store.
     */
    const getUpcoming = () => {
        // Filter out active upcoming meetings.
        let result = user.rsvp.reduce((result: Meeting[], userMeeting) => {
            let found = meetings.find(globalMeeting => {
                return globalMeeting._id === userMeeting
            })

            if (found !== undefined) {
                if (!found.data.isEnded && !found.data.isStarted && !found.data.isCancelled) {
                    result.push(found);
                }
            }

            return result;
        }, [])

        // Lets sort the result array by event's start date (most recent one first)
        // instead of displaying them in the order of RSVP sequence.
        result = result.sort((m1, m2) => {
            return m1.data.startDateTime - m2.data.startDateTime;
        })

        return result;
    }

    const getCancelledMeetings = () => {
        let result = user.rsvp.reduce((state: Meeting[], meeting) => {
            let found = meetings.find(allMeeting => {
                return allMeeting._id === meeting
            })
            if (found !== undefined) {
                if (found.data.isCancelled) {
                    state.push(found);
                }
            }
            return state;
        }, [])
        return result;
    }

    const getAttended = () => {
        let result = user.attend.reduce((state: Meeting[], meeting) => {
            let found = meetings.find(allMeeting => {
                return allMeeting._id === meeting
            })
            if (found !== undefined) {
                if (found.data.isEnded) {
                    state.push(found);
                }
            }
            return state;
        }, [])
        return result;
    }

    // componentDidMount alternative
    React.useEffect(() => {
        if (!etherService.isEthereumNodeAvailable()) {
            const notification: Notification = {
                message: 'Please install MetaMask extension to host / join events.',
                variant: 'filled',
                severity: 'warning',
                display: true
            };

            dispatch(notificationActions.AddNotification(notification));
        } else {
            const selectedAddress = etherService.getUserAddress();

            if (selectedAddress && selectedAddress !== user._id) {
                /**
                 * Edge case that requires manual dispatch call.
                 *
                 * Sometimes window.ethereum.selectAddress is already
                 * pre-filled before we start listening for account changes.
                 * So we manually invoke the callback function to update userEthAddress.
                 */

                accChangeCallback([selectedAddress]);
                chainChangeCallback(etherService.getNetwork());
            }

            etherService.addAllListeners(chainChangeCallback, accChangeCallback);
        }


        // componentWillUnmount alternative
        return () => {
            if (etherService.isEthereumNodeAvailable()) {
                etherService.removeAllListeners();
            }
        };
    }, []);

    return (
        <React.Fragment>
            <TopBar position="static">
                <Toolbar>
                    <Grid container>
                        <Grid item xs={3} container>
                            <Link href="/" style={{ textDecoration: 'none' }}>
                                <CardMedia style={{ alignItems: 'center', justifyContent: 'center', height: 48, width: 48, color: 'white' }}
                                    image="https://www.siasky.net/KACEhRdglW80DQ_rxo-tGken1lzV8kfh5sY4G0W_b3kMEA"
                                /></Link>
                            <Link href="/" style={{ textDecoration: 'none' }}>
                                <Typography component="h1" variant="h2" align="center" style={{ color: 'white', fontSize: 24, marginTop: 8, marginLeft: 6 }}>
                                    Slingshot
                            </Typography> </Link>
                        </Grid>
                        <Grid item xs={5} />
                        <Grid container item xs={3} alignItems="center" justify="flex-end">
                            {user._id
                                ? (<Domain variant="h6">
                                    {user.data?.ensDomain}
                                </Domain>)
                                : (<QuickSignIn onClick={signIn}>
                                    Sign In
                                </QuickSignIn>)
                            }
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleClickOpen}
                                color="inherit"
                            >
                                <Avatar />
                            </IconButton>
                            <Dialog
                                fullScreen
                                open={open}
                                TransitionComponent={Transition}
                                keepMounted
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-slide-title"
                                aria-describedby="alert-dialog-slide-description"
                            >
                                <StyledDialogTitle id="alert-dialog-slide-title">
                                    User Profile
                                    <CloseButton aria-label="close" onClick={handleClose}>
                                        <CloseIcon />
                                    </CloseButton>
                                </StyledDialogTitle>
                                <DialogContent dividers>

                                    <Grid container>
                                        <Grid item xs={5}>
                                            <Typography component="div">
                                                <Typography variant="h6" color="textPrimary">
                                                    Account Details
                                                </Typography>
                                                <br />
                                                <Box fontSize={16} fontWeight="500" lineHeight={2}>
                                                    Address
                                                </Box>
                                                <Link href={user._id ? "https://rinkeby.etherscan.io/address/" + user._id : "#"} style={{ textDecoration: 'none' }} target="_blank">
                                                    <Tooltip title={user._id ? "Click to view on Etherscan" : "Sign In"} aria-label="visit etherscan" placement="bottom">
                                                        <Paper style={{ marginBottom: 20 }} elevation={3}>
                                                            <Container>
                                                                <Grid container>
                                                                    <Grid item style={{ marginTop: 8, padding: 10 }}>
                                                                        <Blockies
                                                                            seed={user._id}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Box fontSize={20} fontWeight="500" lineHeight={3} style={{ marginTop: 5, marginLeft: 10 }}>
                                                                            {user._id || (<AddressButton endIcon={<SignInIcon />} onClick={signIn}>
                                                                                Click to sign in to MetaMask to link your account.
                                                                            </AddressButton>)}
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </Container>
                                                        </Paper>
                                                    </Tooltip>
                                                </Link>
                                                <Box fontSize={16} fontWeight="500" lineHeight={2}>
                                                    ENS Domain
                                                </Box>
                                                <Link href={user.data?.ensDomain ? "https://app.ens.domains/name/" + user.data?.ensDomain : "https://ens.domains/"} style={{ textDecoration: 'none' }} target="_blank">
                                                    <Tooltip title={user.data?.ensDomain ? "Click to view on ENS" : ""} aria-label="visit ENS" placement="bottom">
                                                        <Paper elevation={3}>
                                                            <Container>
                                                                <Grid container>
                                                                    <Grid item style={{ marginTop: 8, padding: 10 }}>
                                                                        <img src="https://www.siasky.net/AAD-CBTOGoG6kpMsNBnSS585Yaqmjk2jjZazFZ9Ja7mphQ"
                                                                            height={32} width={32}></img>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Box fontSize={20} fontWeight="500" lineHeight={3} style={{ marginTop: 5, marginLeft: 10 }}>
                                                                            {user.data?.ensDomain ||
                                                                                <AddressButton endIcon={<ArrowForwardIcon />}>
                                                                                    No ENS Domain found. Click here to get one now
                                                                            </AddressButton>}
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </Container>
                                                        </Paper>
                                                    </Tooltip>
                                                </Link>
                                                <br />
                                                <Container>
                                                    <Box fontSize={24} fontWeight="fontWeightLight" lineHeight={3}>
                                                        Powered by
                                                    </Box>
                                                    <img src="https://www.siasky.net/EABxJkl542vXYjkUM2EZyJXKjcGJRzU7jDSGLtcfUoD9zw"
                                                        height={108} width={108} style={{ marginLeft: 7 }}></img>
                                                </Container>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={1} />
                                        <Grid item xs={4}>
                                            <Container>
                                                <Typography component="div">
                                                    <Typography variant="h6" color="textPrimary">
                                                        Events Registered
                                                    </Typography>
                                                    <br />
                                                    <Box fontSize={16} fontWeight="500" lineHeight={2}>
                                                        Upcoming
                                                    </Box>
                                                    {
                                                        getUpcoming().map((meeting) => {
                                                            return (
                                                                <Link href={"/meeting/" + meeting._id} style={{ textDecoration: 'none' }}>
                                                                    <Paper style={{ marginBottom: 10 }} elevation={3}>
                                                                        <Container>
                                                                            <Typography component="div">
                                                                                <Box fontSize={14} fontWeight="normal" lineHeight={3}>
                                                                                    {meeting.data.name}
                                                                                </Box>
                                                                            </Typography>
                                                                        </Container>
                                                                    </Paper>
                                                                </Link>
                                                            )
                                                        })
                                                    }
                                                    <br />
                                                    <Divider />
                                                    <br />
                                                    <Box fontSize={16} fontWeight="500" lineHeight={2}>
                                                        Attended
                                                    </Box>
                                                    {
                                                        getAttended().map((meeting) => {
                                                            return (
                                                                <Link href={"/meeting/" + meeting._id} style={{ textDecoration: 'none' }}>
                                                                    <Paper style={{ marginBottom: 10 }} elevation={3}>
                                                                        <Container>
                                                                            <Typography component="div">
                                                                                <Box fontSize={14} fontWeight="normal" lineHeight={3}>
                                                                                    {meeting.data.name}
                                                                                </Box>
                                                                            </Typography>
                                                                        </Container>
                                                                    </Paper>
                                                                </Link>
                                                            )
                                                        })
                                                    }
                                                    <br />
                                                    <Divider />
                                                    <br />
                                                    <Box fontSize={16} fontWeight="500" lineHeight={2}>
                                                        Cancelled by Organizer
                                                    </Box>
                                                    {
                                                        getCancelledMeetings().map((meeting) => {
                                                            return (
                                                                <Link href={"/meeting/" + meeting} style={{ textDecoration: 'none' }}>
                                                                    <Paper style={{ marginBottom: 10 }} elevation={3}>
                                                                        <Container>
                                                                            <Typography component="div">
                                                                                <Box fontSize={14} fontWeight="normal" lineHeight={3}>
                                                                                    {meeting.data.name}
                                                                                </Box>
                                                                            </Typography>
                                                                        </Container>
                                                                    </Paper>
                                                                </Link>
                                                            )
                                                        })
                                                    }
                                                </Typography>
                                            </Container>
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                            </Dialog>
                        </Grid>
                    </Grid>
                </Toolbar>
            </TopBar>
        </React.Fragment >
    );
}
