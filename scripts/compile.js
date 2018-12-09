/*jshint esversion: 6 */

const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');

// clean up the compile dir
const compileDir = path.resolve(__dirname, '../compiled');
fs.removeSync(compileDir);
fs.ensureDirSync(compileDir);

// compile @0.5.1
function getContractSource(filename) {
    try {
        const file =  fs.readFileSync(
            path.resolve(__dirname, '../contracts', filename),
            'utf8'
        );
        return file;
    } catch (err) {
        if (err instanceof Error) {
            if (err.code === 'ENOENT')
                console.log('File not found.');
            else
                throw err;
        } else { throw err; }
    }
}

const compileInput = {
    language: 'Solidity',
    sources: {
        'CreditABS.sol': {
            content: getContractSource('CreditABS.sol')
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

function findImports (path) {
    if (path === 'SafeMath.sol') {
        return { contents: getContractSource('SafeMath.sol') };
    } else {
        throw new Error('File ' + path + ' is neither given or found');
    }
}

var result = JSON.parse(solc.compile(JSON.stringify(compileInput), findImports));

// `output` here contains the JSON output as specified in the documentation
console.log("Result:\n", result);
for (var contractName in result.contracts['CreditABS.sol']) {
	console.log(contractName + ': ' + result.contracts['CreditABS.sol'][contractName].evm.bytecode.object)
}

// // check errors
if (Array.isArray(result.errors) && result.errors.length) {
    throw new Error(result.errors[0]);
}

// // save to disk
Object.keys(result.contracts).forEach(name => {
    const contractName = name.replace(/^:/, '');
    const filePath = path.resolve(compileDir, `${contractName}.json`);
    fs.outputJSONSync(filePath, result.contracts[name]);
    console.log(`Save compiled contract ${contractName} to ${filePath}`);
})