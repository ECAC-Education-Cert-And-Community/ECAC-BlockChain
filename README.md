# auctionbox

To compile the contract, execute below commands

$cd ethereum
$node compile.js

To deploy the contract, execute below command

$node deploy.js

You need update the "provider instance" from test code of Auction.bidding1.hodu.test.js as shown in below.
const provider = new Web3.providers.HttpProvider("http://your_ip:your_port");

To test the conctract, execute below commands

$cd ..
$npm run test 



Please refer to below link for installation and deployment of private ethereum network.
https://sites.google.com/site/hyungjongkim/ethereum-private-network-construction

