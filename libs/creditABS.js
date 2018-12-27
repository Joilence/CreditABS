import web3 from './web3';
import CreditABS from '../compiled/CreditABS.json';

const getContract = address => new web3.eth.Contract(JSON.parse(CreditABS.interface), address);

export default getContract;