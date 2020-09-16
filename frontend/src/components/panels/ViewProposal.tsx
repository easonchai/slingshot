import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Grid, Typography, Box, makeStyles, Theme } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Proposal } from '../../store/meetings/actions';

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
    open: boolean;
    proposals: ReadonlyArray<Proposal>;
}

interface IState {
    open: boolean;
    value: number;
}

export default class ViewProposal extends React.Component<IProps, IState> {
    // classes = useStyles();

    componentWillMount = () => {
        this.setState({
            open: this.props.open,
            value: 0,
        })
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.open !== prevProps.open) {
            this.setState({
                open: true
            })
        }
    }

    handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        this.setState({
            value: newValue,
        })
    };

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
                                        this.props.proposals.map(data => {
                                            let title = "Proposal " + data.id;
                                            return (<Tab label={title} {...a11yProps(data.id - 1)} />);
                                        })
                                    }
                                </Tabs>
                            </Grid>
                            <Grid item xs={8}>
                                {
                                    this.props.proposals.map(data => {
                                        return (
                                            <TabPanel value={this.state.value} index={data.id - 1}>
                                                <Typography component="div" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
                                                    <Box fontWeight="700" fontSize="2rem">
                                                        {`Proposal ${data.id}`}
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
                                                        {data.newAdmin.join("\n")}
                                                        <br /><br />
                                                        Old Admins: <br />
                                                        {data.oldAdmin.join("\n")}
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
