const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');
 
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);
 
const campaignPath = path.resolve(__dirname, 'contracts', 'ECAC.sol');
const source = fs.readFileSync(campaignPath, 'utf8');
 
const input = JSON.stringify({
    language: 'Solidity',
    sources: {
        'ECAC.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
});


// const output = JSON.parse(solc.compile(JSON.stringify(input)));

// if (!output.contracts || !output.contracts['ECAC.sol']) {
//   console.error('No contract output found for ECAC.sol');
//   return;
// }

// fs.ensureDirSync(buildPath);

// for (const file of Object.keys(output.contracts['ECAC.sol'])) {
//   const contractName = file.replace('.sol', '');
//   const contractFilePath = path.resolve(buildPath, `${contractName}.json`);
//   const contractData = output.contracts['ECAC.sol'][file];

//   fs.outputJsonSync(contractFilePath, contractData);
// }


const abiString = solc.compile(input);
const contracts = JSON.parse(abiString).contracts['ECAC.sol'];
 
fs.ensureDirSync(buildPath);
for (let contract in contracts) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract + ".json"),
        contracts[contract]
    );
}

var output = JSON.parse(solc.compile(input));

for(contractName in output.contracts['ECAC.sol']){
    fs.outputJSONSync(
        path.resolve(buildPath, contractName + '.json'),
        output.contracts['ECAC.sol'][contractName]
    );
}
