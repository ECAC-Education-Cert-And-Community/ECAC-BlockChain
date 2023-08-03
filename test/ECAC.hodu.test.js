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
let likes = 1701;
let reflectedLikes = 0;

// nestedComments와 Count지정
let nestedComments = 221;

let account;
let address;

// 포인트 검증하기 위한 변수
var check_point;

// 포인트 환급할 금액 설정 위한 변수
let input = 0;

// 스마트 컨트랙트 받아오기 위한 변수
let box;

var eth_point = 0;
var sender;
var receiver;


beforeEach(async () => {
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log("함수 실행 시작 시간: " + currentTime);

    accounts = await web3.eth.getAccounts();
    account = accounts[3];

    // 주소 체크섬 오류 해결 -> 스마트컨트랙트 배포 주소
    address = web3.utils.toChecksumAddress('0x3b6d00DE1373ccbEbeA835FF76825DBB7F0bC7c4')

    box = new web3.eth.Contract(
        compiledBox.abi,
        // compiledAbi,
        address
    );
    await box.methods.addUser(account).call();

    // 주소 unlock
    web3.eth.personal.unlockAccount(accounts[0], '', 0);
    web3.eth.personal.unlockAccount(accounts[3], '', 0);

    // try-catch문으로 모든 것이 실행되기 전에 시나리오에서처럼 포인트가 얼마 있는지 확인해보면 된다.
    await box.methods.getCount(account).call((error, result) => {
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Account3 has :', result);
        }
    });
});

// 계좌 3 좋아요
describe('[1: 계좌/유저 1개에 대한 좋아요 포인트 지급 함수 실행]', () => {

    it('좋아요 함수 시작', async () => {
        let point_like1 = await box.methods.getCount(account).call();
        console.log("User's Point before addPoint_likes() is : " + point_like1);
        try {
            await box.methods.addPoint_likes(account, likes).send({
                from: accounts[0],
                gas: 1000000
            }).then((receipt) => {
                // console.log("Transaction receipt: ", receipt);
                console.error("addPoint_likes SUCCESS");
            }).catch((error) => {
                console.error("Error: ", error);
            });
        }
        catch (err) {
            console.log(err.message);
        }
        let point_like2 = await box.methods.getCount(account).call();
        console.log("User's Point after addPoint_likes() is : " + point_like2);
        eth_point = 0.001 * (point_like2 - point_like1);
        sender = accounts[0];
        receiver = account;
    });
});

// 계좌 3 대댓글
describe('[2: 동일 계좌/유저 1개에 대한 대댓글 포인트 지급 함수 실행]', () => {

    it('대댓글 함수 시작', async () => {
        let point_nestedComment1 = await box.methods.getCount(account).call();
        console.log("User's Point before addPoint_nestedComments() is : " + point_nestedComment1);
        try {
            // 대댓글이 추가되었을 때 실행하면 사용자에게 100포인트를 지급해주는 함수 
            await box.methods.addPoint_nestedComments(account, nestedComments).send({
                from: accounts[0],
                gas: 1000000
            }).then((receipt) => {
                // console.log("Transaction receipt: ", receipt);
                console.error("addPoint_nestedComments SUCCESS");
            }).catch((error) => {
                console.error("Error: ", error);
            });
            result = await box.methods.getCount(account).call();
            // console.log("The number of result: ", result);
        }
        catch (err) {
            console.log(err.message);
        }
        let point_nestedComment2 = await box.methods.getCount(account).call();
        console.log("User's Point after addPoint_nestedComments() is : " + point_nestedComment2);
        eth_point = 0.001 * (point_nestedComment2 - point_nestedComment1);
        sender = accounts[0];
        receiver = account;
    });
});

// 계좌 3 포인트 환급
// describe('[3: 동일 계좌/유저 1개에 대한 포인트 환급 함수 실행]', () => {
//     it('환급 함수 시작', async () => {
//         let point = await box.methods.getCount(account).call();
//         console.log("User's Point before refunds() is : " + point);
//         try {
//             // refund를 실행하면 전체의 포인트에서 입력한 수만큼의 포인트를 빼주게 됨 
//             await box.methods.refunds(account, input).send({
//                 from: accounts[0],
//                 gas: 1000000
//             }).then((receipt) => {
//                 // console.log("Transaction receipt: ", receipt);
//                 console.error("refunds SUCCESS");
//             }).catch((error) => {
//                 console.error("Error: ", error);
//             });

//         }
//         catch (err) {
//             console.log(err.message);
//         }
//         let left_point = await box.methods.getCount(account).call();
//         console.log("User's Point after refunds() is : " + left_point);
//         eth_point = 0.001 * (point - left_point);
//         sender = account;
//         receiver = accounts[0];
//     });
// });

afterEach(async () => {
    if (eth_point != 0) {
        const amount = web3.utils.toWei(eth_point.toString(), 'ether');
        var balance1 = await web3.eth.getBalance(sender);
        var balance1InEther = web3.utils.fromWei(balance1, 'ether');
        console.log("Get Sender Balance Before : " + balance1InEther);
        var balance2 = await web3.eth.getBalance(receiver);
        var balance2InEther = web3.utils.fromWei(balance2, 'ether');
        console.log("Get Receipient Balance Before : " + balance2InEther);
        let i=0.01;
        var point_val = 0.01;
        const val = web3.utils.toWei(point_val.toString(), 'ether');
        while (i<=eth_point) {
            try {
                const transact = {
                    from: sender,
                    to: receiver,
                    value: val,
                };
                const receipt = await web3.eth.sendTransaction(transact);
                i += point_val;
                console.log('송금 완료');
            }
            catch (err) {
                console.error('송금 실패:', err);
            }
        }
        balance1 = await web3.eth.getBalance(sender);
        balance1InEther = web3.utils.fromWei(balance1, 'ether');
        console.log("Get Sender Balance After : " + balance1InEther);
        balance2 = await web3.eth.getBalance(receiver);
        balance2InEther = web3.utils.fromWei(balance2, 'ether');
        console.log("Get Receipient Balance After : " + balance2InEther);
    }
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log("함수 실행 끝난 시간: " + currentTime);

});