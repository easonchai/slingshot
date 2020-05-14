async function main() {
	const [ deployer ] = await ethers.getSigners();

	console.log('Deploying contracts with the account:', await deployer.getAddress());

	console.log('Account balance:', (await deployer.getBalance()).toString());

	const DeployerContract = await ethers.getContractFactory('Deployer');
	const deployerContract = await DeployerContract.deploy();

	await deployerContract.deployed();

	console.log('Contract address:', deployerContract.address);
}

main().then(() => process.exit(0)).catch((error) => {
	console.error(error);
	process.exit(1);
});
