import React from 'react';
import { History } from 'history';
import { Event } from '../store/events/actions';
import { Button, Container, Grid, TextField } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import { ethers } from 'ethers';

interface IProps {
	history: History;
	events: Array<Event>;
	dispatchAddEvent(event: Event): void;
}

export class AddEvent extends React.Component<IProps> {
	state: any;

	constructor(props: any) {
		super(props);
		this.state = {
			date: null,
			time: null
		};
	}

	handleSubmit = (event: any) => {
		event.preventDefault();

		this.props.dispatchAddEvent({
			name: event.target.eventName.value,
			stake: event.target.stakeAmount.value,
			maxParticipants: event.target.maxParticipants.value,
			startDate: this.state.date,
			startTime: this.state.time,
			location: event.target.location.value,
			description: event.target.description.value,
			isEnded: false,
			address: '0x0...0'
		});

		// The even was just saved locally, lets try to deploy a meeting next on testnet.
		this.testEthersJS();

		// TODO: uncomment once ethers.js is fixed
		//this.props.history.push('/');
	};

	testEthersJS = () => {
		let ethereum = (window as any).ethereum;
		let web3 = (window as any).Web3;

		if (typeof ethereum !== 'undefined') {
			ethereum
				.enable()
				.then((accounts: any) => {
					console.log(window);
					console.log('accounts ', accounts);

					const provider = new ethers.providers.Web3Provider(ethereum, 'ropsten');
					const signer = new ethers.providers.Web3Provider(ethereum).getSigner();

					console.log('Provider: ' + web3.currentProvider);
					console.log(signer);

					// console.log(signer);
					provider
						.getBalance(accounts[0])
						.then((balance: any) => console.log(ethers.utils.formatEther(balance)))
						.catch((err: any) => console.log(err));

					// let tx = {
					// 	// Required unless deploying a contract (in which case omit)
					// 	to: '0x8dF42792C58e7F966cDE976a780B376129632468', // the target address or ENS name

					// 	// These are optional/meaningless for call and estimateGas
					// 	nonce: 3, // the transaction nonce
					// 	gasLimit: 200000, // the maximum gas this transaction may spend
					// 	gasPrice: 10, // the price (in wei) per unit of gas

					// 	// These are always optional (but for call, data is usually specified)
					// 	data: '0x', // extra data for the transaction, or input for call
					// 	value: 100, // the amount (in wei) this transaction is sending
					// 	chainId: 3 // the network ID; usually added by a signer
					// };

					// const defaultProvider = ethers.getDefaultProvider('ropsten');
					// defaultProvider.getBalance("0xafa676bf71a9464ab6fa1edb1f154a289a2737bd")
					//   .then((balance: any) => console.log(ethers.utils.formatEther(balance)))
					//   .catch((err: any) => console.log(err));

					// Partial Deployer Contract interface
					let abi = [
						'function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address)'
					];
					const contractAddress = '0x8dF42792C58e7F966cDE976a780B376129632468';
					const contract = new ethers.Contract(contractAddress, abi, signer);

					const tx = contract.deploy(0, 1, 1, 1);

					let txn = signer.sendTransaction(tx);
					let signature = signer.signMessage('Hello world');
					// tx is prepared, but still needs to be sent to testnet
					// [should we utilise this?: sendAsync ( method , params , callback )]
				})
				.catch((error: any) => {
					console.log('error @ outer level: ', error);
				});
		}
	};

	handleDateChange = (d: any) => {
		this.setState({ date: d });
	};

	handleTimeChange = (t: any) => {
		this.setState({ time: t });
	};

	render() {
		return (
			<Container maxWidth={false}>
				<Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={2}>
					<form onSubmit={this.handleSubmit} className="add-event-form">
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField required={false} id="eventName" label="Event Name" />
							</Grid>

							<Grid item xs={12}>
								<TextField
									type="number"
									id="stakeAmount"
									label="Stake Amount (ETH)"
									defaultValue={0.05}
								/>
							</Grid>

							<Grid item xs={12}>
								<TextField
									type="number"
									id="maxParticipants"
									label="Max participants"
									defaultValue={100}
								/>
							</Grid>

							<Grid item xs={12}>
								<MuiPickersUtilsProvider utils={DateFnsUtils}>
									<Grid item xs={12}>
										<KeyboardDatePicker
											required={false}
											margin="normal"
											id="startDate"
											label="Start Date"
											format="MM/dd/yyyy"
											value={this.state.date}
											onChange={this.handleDateChange}
										/>
									</Grid>
									<Grid item xs={12}>
										<KeyboardTimePicker
											required={false}
											margin="normal"
											id="startTime"
											label="Start Time"
											value={this.state.time}
											onChange={this.handleTimeChange}
										/>
									</Grid>
								</MuiPickersUtilsProvider>
							</Grid>

							<Grid item xs={12}>
								<TextField required={false} id="location" label="Location" />
							</Grid>

							<Grid item xs={12}>
								<TextField id="description" label="Description" />
							</Grid>

							<Grid item xs={12}>
								<Button type="submit" variant="outlined" color="primary">
									Add new Event
								</Button>
							</Grid>
						</Grid>
					</form>
				</Grid>
			</Container>
		);
	}
}
