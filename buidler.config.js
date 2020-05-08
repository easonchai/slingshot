usePlugin('@nomiclabs/buidler-waffle');

// Go to https://infura.io/ and create a new project
// Replace this with your Infura project ID
const INFURA_PROJECT_ID = '8ef6fdb435584f53a5379594126badd5';

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY = 'EA10F0DB8EB7097B26FD318E6645FE67C9745DE6A0A6CDC89DADD6A8F0127D74';

module.exports = {
	networks: {
		ropsten: {
			url: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
			accounts: [ `0x${ROPSTEN_PRIVATE_KEY}` ]
		}
	}
};
