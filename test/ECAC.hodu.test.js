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
let likes = 301;
let reflectedLikes = 0;

// nestedComments와 Count지정
let nestedComments = 21;
let reflectedNestedComments = 0;

let account;
let address;

// 포인트 검증하기 위한 변수
var check_point;

// 포인트 환급할 금액 설정 위한 변수
let input = 100;

// 스마트 컨트랙트 받아오기 위한 변수
let box;



beforeEach(async () => {

    accounts = await web3.eth.getAccounts();
    account = accounts[3];

    // 주소 체크섬 오류 해결 -> 스마트컨트랙트 배포 주소
    address = web3.utils.toChecksumAddress('0xf16D8b31817F76dD5F143eA73e61bCa1D86Bdbca')

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
            console.log('Count:', result);
        }
    });
});

// //스마트 컨트랙트가 선언된 변수에 맞게 정확히 생성되었는지 테스트
// describe("[Testcase 1 : check if the smart contract has been created as set in the variables]", () => {

//     //getAccounts한 결과 그대로 accounts 변수에 지정되어 생성되었는가
//     it("1.1. Is the token(=box) accounts the same as set in the variable?", async function () {
//         (await await web3.eth.getAccounts()).should.eq(accounts);
//     });

//     //토큰 box의 likes와 reflectedLikes 지정된 값으로 생성되었는가
//     it("1.2. Is the token(=box) likes and reflectedLikes the same as set in the variable?", async function () {
//         (await box.methods.addPoint_likes(likes, reflectedLikes));
//     });

//     //토큰 box의 nestedComments와 reflectedNestedComments 지정된 값으로 생성되었는가
//     it("1.3. Is the token(=box) nestedComments and reflectedNestedComments is the same as set in the variable?", async function () {
//         (await box.methods.addPoint_nestedComments(nestedComments, reflectedNestedComments));
//     });

// });

// 좋아요 클릭에 대한 테스트
describe('[Testcase 2 : check ECAC Smart Contract for addPoint_likes()]', () => {

    it('2. Is the function addPoint_likes() running correctly?', async () => {
        let result;
        check_point = Math.floor(await box.methods.getCount(account).call());
        try {
            // 좋아요가 추가되었을 때 실행하면 사용자에게 100포인트를 지급해주는 함수 
            // likes만 있어도 나머지를 계산할 수 있는데, reflectedLikes 파라미터 제거 (조작 가능, 스마트컨트랙트 안에서만 처리필요)
            await box.methods.addPoint_likes(account, likes).send({
                from: account, 
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
            console.log("==========에러 실행되고 있는가?==========");
        }

        // 위의 addPoint_likes()가 제대로 실행되었다면, getCount를 했을 때 포인트를 지급받은 상황일 것임.
        console.log("User's Point after addPoint_likes() is : " + await box.methods.getCount(account).call());
    });

    // it('2.2. Did the function addPoint_likes() give points to the user?', async () => {
    //     // 비교- 검증 부분 추가 (0 point -> 200 point 된 상황이어야함.)
    //     assert.equal(await box.methods.getCount(account).call(),200);
    // });
});


// 대댓글 작성에 대한 테스트
describe('[Testcase 3 : check ECAC Smart Contract for addPoint_nestedComments()]', () => {

    it('3.1. Is the function addPoint_nestedComments() running correctly?', async () => {
        let result;
        check_point = Math.floor(await box.methods.getCount(account).call());
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
            // 포인트 확인 위한 계산
            check_point += (Math.floor(nestedComments/20)-reflectedNestedComments)*100;
        }
        catch (err) {
            console.log(err.message);
            console.log("==========에러 실행되고 있는가?==========");
        }

        // 위의 addPoint_nestedComments ()가 제대로 실행되었다면, getCount를 했을 때 포인트를 지급받은 상황일 것임.
        let point_nestedComment = await box.methods.getCount(account).call();
        console.log("User's Point after addPoint_nestedComments()" + point_nestedComment);
    });
    // it('3.2. Did the function addPoint_nestedComments() give points to the user?', async () => {
    //     assert.equal(await box.methods.getCount(account).call(),check_point);
    // });
});

// 포인트 환급 요청에 따라 실행할 부분
describe('[Testcase 4 : check ECAC Smart Contract for refunds()]', () => {
    it('4.1. Is the function refunds() running correctly?', async () => {
        try {
            // refund를 실행하면 전체의 포인트에서 입력한 수만큼의 포인트를 빼주게 됨 
            await box.methods.refunds(account, input).send({
                from: accounts[0], 
                gas: 1000000
            }).then((receipt) => {
                // console.log("Transaction receipt: ", receipt);
                console.error("refunds SUCCESS");
            }).catch((error) => {
                console.error("Error: ", error);
            });

        }
        catch (err) {
            console.log(err.message);
        }

        // 위의 함수가 제대로 실행되었다면 지정한 100만큼 빠진 포인트가 남아있어야 함
        let left_point = await box.methods.getCount(account).call();
        console.log("User's Point after refunds() " + left_point);
    });

    // it('4.2. Did the function refunds() give money to the user account?', async () => {
    //     // 계좌에는 원래 금액 + input 만큼의 잔액이 들어있어야함.
    //     // 계좌에 지급하려면 어떻게 하지?? -> 지급 로직이 어떻게 되는지...
    //     assert.equal(await box.methods.getCount(account).call(),check_point);
    // });
});
