import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, DialogContentText, CircularProgress, Backdrop } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#FF8E53',
        },
    }),
);

interface IProps {
    open: boolean;
}

export default function ClubDeployBackdrop(props: IProps) {
    const { open } = props;
    const classes = useStyles();
    const [isOpen, setOpen] = React.useState(open);
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Deploying Club"}
                    </DialogTitle>
                    <DialogContent
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        }}
                    >
                        <DialogContentText id="alert-dialog-description">
                            We are currently deploying your club. <br />
                            The first transaction is to deploy your <b>club</b>, and the second is to deploy your <b>meeting</b>! <br />
                            <b>Please confirm both transactions!</b>
                        </DialogContentText>
                        <CircularProgress style={{ color: "#FF8E53", margin: "1rem" }} />
                    </DialogContent>
                </Dialog>
            </Backdrop>
        </div>
    );
}