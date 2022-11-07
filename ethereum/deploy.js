const HDWalletProvider = require('@truffle/hdwallet-provider');
 
const { interfaces } = require('mocha');
//const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledABox = require('./build/ECAC_SmartContract.json');

 const provider = new HDWalletProvider(
  'metamask의 12개 단어를 적어주세요.',
  // remember to change this to your own phrase!
  'http://192.168.56.104:8545'//가상머신의 ip주소를 적어주세요.
  // remember to change this to your own endpoint!
);

const web3 = new Web3(provider);
 


const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    let txn;
    console.log('Attempting to deploy using account ' + accounts[0]);
    console.log('abi ' + compiledABox.abi); 
//    console.log('bytecode ' + compiledABox.evm.bytecode.object); 

    try{
      txn = await new web3.eth.Contract(compiledABox.abi)
          .deploy({ data: '0x' + compiledABox.evm.bytecode.object })
          .send({ from: accounts[0] });
    }
    catch(err){
      console.log(err.message);
    }
    console.log('Contract is at ' + txn.options.address);
    //provider.engine.stop();
};
deploy();
