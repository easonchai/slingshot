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
import { Grid, Typography, Button } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import CloseIcon from '@material-ui/icons/Close';

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
    let ensDomain = " ";

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
                .then(user => dispatch(userActions.UpdateUserEthereumAddress(user)));
        } else {
            const user: User = {
                _id: '',
                type: ModelType.USER,
                cancel: [],
                rsvp: [],
                attend: [],
                withdraw: []
            };

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
        etherService.requestConnection();
    }

    const resolve = (domain: string) => {
        ensDomain = domain;
        console.log("ENS: " + ensDomain);
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
        //user._id ? ensDomain = etherService.findENSDomain("0xD422104E6310367aBE12456FC6017513601E5732") : console.log("Not retrieving")
        console.log(etherService.findENSDomain("0xD422104E6310367aBE12456FC6017513601E5732", resolve))
        // componentWillUnmount alternative
        return () => etherService.removeAllListeners();
    }, []);

    return (
        <React.Fragment>
            <TopBar position="static">
                <Toolbar>
                    <Grid container>
                        <Grid item xs={11} />
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
                                <DialogTitle id="alert-dialog-slide-title">{"Account Details"}
                                    <IconButton aria-label="close" onClick={handleClose}>
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent dividers>
                                    <Typography variant="subtitle1" align="left" color="textPrimary" paragraph>
                                        Address
                                    </Typography>
                                    {
                                        user._id ? (
                                            <Typography variant="subtitle1" align="left" color="textPrimary">
                                                {user._id}
                                            </Typography>
                                        ) :
                                            <AddressButton endIcon={<SignInIcon />} onClick={signIn}>
                                                Click to sign in to MetaMask to link your account.
                                            </AddressButton>
                                    }

                                    <hr />
                                    <Typography variant="subtitle1" align="left" color="textPrimary" paragraph>
                                        ENS Domain
                                    </Typography>
                                    <Typography variant="subtitle1" align="left" color="textPrimary">
                                        {
                                            user._id ? ensDomain : "Please sign in to MetaMask"
                                        }
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
