import web3 from './web3';
import SecurityManager from '../compiled/SecurityManager.json';
import address from '../address.json';

const contract = new web3.eth.Contract(JSON.parse(SecurityManager.interface), address);

export default contract;