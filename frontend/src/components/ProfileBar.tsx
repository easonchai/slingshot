import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IAppState } from '../store/index';
import EtherService from '../services/EtherService';
import { actions as userActions, ModelType, User } from '../store/users/actions';
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
import { Grid, Typography, Button, Box, Divider } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import CloseIcon from '@material-ui/icons/Close';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

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

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProfileBar() {
    const [open, setOpen] = React.useState(false);
    const user = useSelector((state: IAppState) => state.userReducer.user);
    const dispatch = useDispatch();
    const etherService = EtherService.getInstance();
    const meetings = useSelector((state: IAppState) => state.meetingsReducer.meetings);
    const [registeredEvents, setRegistered] = React.useState(['']);
    const [attendedEvents, setAttended] = React.useState(['']);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const accChangeCallback = (accounts: string[]) => {
        const address = accounts[0];

        if (address) {
            axios
                .get('/api/user/id/' + address)
                .then(res => res.data as User)
                .then(user => {
                    dispatch(userActions.UpdateUserEthereumAddress(user))
                    getRegistered(user.rsvp)
                });

            etherService.findENSDomain(address, resolveDomain);

        } else {
            const user: User = {
                _id: '',
                type: ModelType.USER,
                data: {
                    ensDomain: ''
                },
                cancel: [],
                rsvp: [],
                attend: [],
                withdraw: []
            };

            dispatch(userActions.UpdateUserEthereumAddress(user));
            dispatch(userActions.UpdateUserENSDomain(" "));
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
        etherService.requestConnection();
    }

    const resolveDomain = (domain: string) => {
        dispatch(userActions.UpdateUserENSDomain(domain));
    }

    const getRegistered = (rsvpArr: readonly string[]) => {
        console.log(rsvpArr)
        //Get the array
        // console.log(user.rsvp)
        // //Find
        // let registered = [];
        // let userRSVP = user.rsvp;
        // userRSVP.sort();
        // meetings.sort();
        // for (var i = 0; i < userRSVP.length; i += 1) {
        //     if (meetings.indexOf(userRSVP[i]) > -1) {
        //         registered.push(userRSVP[i]);
        //     }
        // }
        //

    }

    // componentDidMount alternative
    React.useEffect(() => {
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

        // componentWillUnmount alternative
        return () => etherService.removeAllListeners();
    }, []);

    return (
        <React.Fragment>
            <TopBar position="static">
                <Toolbar>
                    <Grid container>
                        <Grid item xs={8} />
                        <Grid container item xs={3} alignItems="center" justify="flex-end">
                            <Domain variant="h6">
                                {user.data?.ensDomain}
                            </Domain>
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

                                    <Typography component="div">
                                        <Typography variant="h6" color="textPrimary">
                                            Account Details
                                        </Typography>
                                        <br />
                                        <Box fontSize="16" fontWeight="500" lineHeight={2}>
                                            Address
                                        </Box>
                                        <Box fontSize="12" fontWeight="normal" fontStyle="italic" lineHeight={3}>
                                            {
                                                user.data?.ensDomain ? (user.data?.ensDomain + " // " + user._id) :

                                                    (<AddressButton endIcon={<SignInIcon />} onClick={signIn}>
                                                        Click to sign in to MetaMask to link your account.
                                                    </AddressButton>)
                                            }
                                        </Box>
                                        <br />
                                        <Divider />
                                        <br />
                                        <Typography variant="h6" color="textPrimary">
                                            Events Registered
                                        </Typography>
                                        <br />
                                        <Box fontSize="16" fontWeight="500" lineHeight={2}>
                                            Upcoming
                                        </Box>
                                        <Box fontSize="12" fontWeight="normal" lineHeight={3}>
                                            {
                                                user._id ||

                                                <AddressButton endIcon={<SignInIcon />} onClick={signIn}>
                                                    Click to sign in to MetaMask to link your account.
                                                </AddressButton>
                                            }
                                        </Box>
                                        <Divider variant="middle" />
                                        <Box fontSize="16" fontWeight="500" lineHeight={2}>
                                            Attended
                                        </Box>
                                        <br />
                                        <Divider />
                                        <br />
                                    </Typography>
                                </DialogContent>
                            </Dialog>
                        </Grid>
                    </Grid>
                </Toolbar>
            </TopBar>
        </React.Fragment>
    );
}
