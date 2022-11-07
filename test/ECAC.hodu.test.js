require('dotenv').config({ path: '../.env' });

// 아래코드는 solidity code를 test하기 위한 것입니다. ECAC 코드를 아래 코드를 이용하여 테스트 해야 합니다. 

const assert = require('assert');
const ganache = require('ganache-cli');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const compiledBox = require('../ethereum/build/AuctionBox_v2.json');
const compiledAuction = require('../ethereum/build/Auction_v2.json');

const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://192.168.219.103:8545");
const web3 = new Web3(provider);

/* current time */
const moment = require('moment');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

let accounts = [];
let auctionAddress = null;
let auction = null;
let aMoment;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showtime(auctionending){
    let date =  new Date(auctionending * 1000);
    aMoment = moment(date);

    console.log("Bid Ending Time", aMoment.format('YYYY-MM-DD HH:mm:ss'));
    console.log("Current Time", moment().format('YYYY-MM-DD HH:mm:ss'));

}

let myaccount_1, myaccount_2, gasValue;
var auction_endate;
beforeEach(async () => {

    auction_endate = moment().add(140, 'seconds').format('YYYY-MM-DD HH:mm:ss');


    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
    console.log(auction_endate);
    accounts = await web3.eth.getAccounts();
    console.log(accounts);
    myaccount_1 = accounts[1];
    myaccount_2 = accounts[2];
    gasValue = '5000000';

    //    console.log(accounts);
    const box = new web3.eth.Contract(
        compiledBox.abi,
        '0xeeE21f461bf3eC60299fEe50134f09A9D699C176'
    );
    console.log("Gas Price: ")
    web3.eth.getGasPrice().then(console.log);
    const result = await box.methods.createAuction('1', moment(auction_endate).unix()).send({
        from: accounts[1],
        gas: gasValue
    });

    auctionAddress = result['events']['AuctionCreated']['returnValues']['auctionContract']

    // Only one contract deployed, so this is safe.
    //[auctionAddress] = await box.methods.getDeployedAuctions().call();
    console.log("AuctionAddress:", auctionAddress);

    auction = await new web3.eth.Contract(compiledAuction.abi, auctionAddress);

    console.log(myaccount_1);

    console.log("Here is the line 66");
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
    console.log(auction_endate);

});

describe('Bids and successful bid in HODU-Net', () => {

    it('Deposit for the bid in HODU-Net', async () => {
        let result;
        try {
            result = await auction.methods.receiveDeposit().send({
                from: myaccount_1,
                value: web3.utils.toWei('0.5', 'ether'),
                gas: gasValue
            });
        }
        catch (err) {
            console.log(err.message);
        }
        console.log("Here is the line 93", result);

        let auctionending = await auction.methods.auctionEnd().call();

        showtime(auctionending);

        let receiveDeposit = await auction.methods.deposit(myaccount_1).call();
        console.log("deposit received", receiveDeposit);
        assert.equal(receiveDeposit,web3.utils.toWei('0.5', 'ether'));

        console.log("Here is the line 102");

        try {
            result = await auction.methods.receiveDeposit().send({
                from: myaccount_2,
                value: web3.utils.toWei('0.6', 'ether'),
                gas: gasValue
            });
        }
        catch (err) {
            console.log(err.message);
        }

        console.log("Here is the line 115", result);
        auctionending = await auction.methods.auctionEnd().call();
        showtime(auctionending);

        let receiveDeposit2 = await auction.methods.deposit(myaccount_2).call();
        console.log("deposit received", receiveDeposit2);
        assert.equal(receiveDeposit2,web3.utils.toWei('0.6', 'ether'));

// start bidding 
        await auction.methods.bid(web3.utils.toWei('0.1', 'ether')).send({
            gas: gasValue,
            from: myaccount_1
        });

        bidNum = await auction.methods.bids(myaccount_1).call();
        console.log(bidNum);
        assert.ok(bidNum);
        console.log("here is 133 line--->First Bid is ended");
        showtime(auctionending);

        await auction.methods.bid(web3.utils.toWei('0.2', 'ether')).send({
            gas: gasValue,
            from: myaccount_2
        });

        bidNum = await auction.methods.bids(myaccount_2).call();
        console.log(bidNum);
        assert.ok(bidNum);

// finish bidding 
        await sleep(110000);
        console.log("here is 149 line--->Finishing Bid is ended");
        showtime(auctionending);

        await auction.methods.successfulBid().send({
            from: myaccount_2,
            value: web3.utils.toWei('0.2', 'ether'),
            gas: gasValue
        });

        const auctionInstance = await auction.methods.a().call({from: myaccount_2});
        console.log("bidding result");
        console.log(auctionInstance[3]);

        assert.equal(auctionInstance[3], web3.utils.toWei('0.2', 'ether'));
 

        console.log(myaccount_1);
        
        console.log("Here is the line 160", result);
        auctionending = await auction.methods.auctionEnd().call();
        showtime(auctionending);

        await auction.methods.refundDeposit().send({
            from: myaccount_1,
//            value: web3.utils.toWei('0.5', 'ether'),
            gas: gasValue
        });

        let remainingDeposit = await auction.methods.deposit(myaccount_1).call();
        console.log("remaining deposit", remainingDeposit);     
        assert.ok(remainingDeposit);

        console.log(myaccount_1);

        await auction.methods.refundDeposit().send({
            from: myaccount_2,
//            value: web3.utils.toWei('0.6', 'ether'),
            gas: gasValue
        });

        remainingDeposit = await auction.methods.deposit(myaccount_2).call();
        console.log("remaining deposit", remainingDeposit);
        assert.ok(remainingDeposit);
    });


});