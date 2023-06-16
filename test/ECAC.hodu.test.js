require('dotenv').config({ path: '../.env' });
const assert = require('assert');
const ganache = require('ganache-cli');
const { describe } = require('mocha');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://192.168.56.101:8545");
const web3 = new Web3(provider);


const HDWalletProvider = require('@truffle/hdwallet-provider');
const compiledBox = require('../ethereum/build/ECAC_SmartContract.json');
// const compiledAbi = require('../ethereum/build/ECAC_SmartContract.json')

/* current time */
const moment = require('moment');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

let accounts = [];
// likes와 reflectedLikes 지정
let likes = 421;

// nestedComments와 Count지정
let nestedComments = 21;

let account, account3, account4, account5, account8;
let address;

// 포인트 검증하기 위한 변수
var check_point;

// 포인트 환급할 금액 설정 위한 변수
let input = 100;

// 스마트 컨트랙트 받아오기 위한 변수
let box;
// 새로운 계좌 생성할 때 받아올 변수
let newAccount;


beforeEach(async () => {

    accounts = await web3.eth.getAccounts();
    account3 = accounts[3];
    account4 = accounts[4];
    account5 = accounts[5];
    account8 = accounts[8];

    // 주소 체크섬 오류 해결 -> 스마트컨트랙트 배포 주소
    address = web3.utils.toChecksumAddress('0x3b6d00DE1373ccbEbeA835FF76825DBB7F0bC7c4')

    box = new web3.eth.Contract(
        compiledBox.abi,
        // compiledAbi,
        address
    );
    await box.methods.addUser(account3).call();
    await box.methods.addUser(account4).call();
    await box.methods.addUser(account5).call();
    await box.methods.addUser(account8).call();

    // 주소 unlock
    web3.eth.personal.unlockAccount(accounts[0], '', 0);
    web3.eth.personal.unlockAccount(accounts[3], '', 0);
    web3.eth.personal.unlockAccount(accounts[4], '', 0);
    web3.eth.personal.unlockAccount(accounts[5], '', 0);
    web3.eth.personal.unlockAccount(accounts[8], '', 0);

});

describe('[1: 계좌 생성]', () => {

    it('계좌 생성하기', async () => {        
        try {
            newAccount = web3.eth.accounts.create();
            console.log('생성 성공');
        }
        catch (err) {
            console.error('생성 실패:', err);
        }
        // 새로 생성한 계좌 정보
        console.log('New Account Address:', newAccount.address);
        console.log('New Account Private Key:', newAccount.privateKey);
    });
});



describe('[2: 송금]', () => {

    it('송금 메서드 작성', async () => {
        const amountToSend = web3.utils.toWei('0.5', 'ether');
        var balance1 = await web3.eth.getBalance(newAccount.address);
        console.log("Get Receipient Balance Before : " + balance1);
        var balance2 = await web3.eth.getBalance(accounts[0]);
        console.log("Get Sender Balance Before : " + balance2);
        try {
            const transact = {
                from: accounts[0],
                to: newAccount.address,
                value: amountToSend,
            };
            const receipt = await web3.eth.sendTransaction(transact);
            console.log('송금 완료');
        }
        catch (err) {
            console.error('송금 실패:', err);
        }
        balance1 = await web3.eth.getBalance(newAccount.address);
        console.log("Get Receipient Balance After : " + balance1);
        balance2 = await web3.eth.getBalance(accounts[0]);
        console.log("Get Sender Balance After : " + balance2);
    });
});
