import React from 'react';
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
import FileCopyIcon from '@material-ui/icons/FileCopy';

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

const CopyIcon = styled(FileCopyIcon)({
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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


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
                                open={open}
                                TransitionComponent={Transition}
                                keepMounted
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-slide-title"
                                aria-describedby="alert-dialog-slide-description"
                            >
                                <DialogTitle id="alert-dialog-slide-title">{"Account Details"}</DialogTitle>
                                <DialogContent dividers>
                                    <Typography variant="subtitle1" align="left" color="textPrimary" paragraph>
                                        Address
                                    </Typography>
                                    <AddressButton endIcon={<CopyIcon />}>
                                        0x7CA92A76778F89C578FA30290ee84132975F6835
                                    </AddressButton>
                                    <hr />
                                    <Typography variant="subtitle1" align="left" color="textPrimary" paragraph>
                                        ENS Domain
                                    </Typography>
                                    <AddressButton endIcon={<CopyIcon />}>
                                        eason.ethkl.eth
                                    </AddressButton>
                                </DialogContent>
                            </Dialog>
                        </Grid>
                    </Grid>
                </Toolbar>
            </TopBar>
        </React.Fragment>
    );
}
