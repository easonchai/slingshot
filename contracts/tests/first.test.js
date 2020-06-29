const ethers = require("ethers");
const fs = require("fs");
const provider = new ethers.providers.JsonRpcProvider();

const contractByteCode = fs.readFileSync('testContract_sol_simpleContract.bin').toString()
const contractAbi = JSON.parse(fs.readFileSync('testContract_sol_simpleContract.abi').toString())
let contractAddress = null;

const signerWallet = provider.getSigner(0);
const factory = new ethers.ContractFactory(
    contractAbi,
    contractByteCode,
    signerWallet
);

contractAddress = factory.deploy()
    .then(_contract => {
        _contractAddress = _contract.address;
        _contract.deployTransaction.wait(); //Waits until tx is confirmed and contract is deployed.
        return _contractAddress;
    });

let wallet = provider.getSigner(1);

let contract = new ethers.Contract(contractAddress, contractAbi, provider);

contract = contract.connect(wallet);


test('async test', async() =>{
    try {    
    let tx2 = await contract.alwaysRevert();
    console.log('tx2:', tx2);
    } catch (error) {
        let a = error.body.error.message.slice(50);
        console.log(a);
        expect(a).toBe('My revert message');
    }
});

test('some counting', async() =>{
    let a = await contract.count();
    await contract.increaseCount(); 
    let b = await contract.count();
    expect(a).toStrictEqual(b.sub(1));
});