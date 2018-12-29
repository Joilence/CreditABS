import React from 'react';
import {
  Grid,
  Button,
  Typography,
  LinearProgress,
  CircularProgress,
  Paper,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';

import { Link } from '../../routes';
import web3 from '../../libs/web3';
import CreditABS from '../../libs/creditABS';
import SecurityManager from '../../libs/securityManager';
import withRoot from '../../libs/withRoot';
import Layout from '../../components/Layout';
import InfoBlock from '../../components/InfoBlock';

class ABSDetail extends React.Component {
  static async getInitialProps({ query }) {
    const contract = CreditABS(query.address);

    const summary = await contract.methods.getSummary().call();
    const [
      name,
      issuer,  
      financingGoal,
      fundReceived,
      description,
      numOfTokenholders,
      contractBalance,
      numOfPayments] = Object.values(
        summary
      );
    
    const tasks = [];
    for (let i = 0; i < numOfPayments; i++) {
      tasks.push(contract.methods.payments(i).call());
    }
    const payments = await Promise.all(tasks);

    const abs = {
      address: query.address,
      name,
      financingGoal,
      contractBalance,
      numOfTokenholders,
      numOfPayments,
      issuer,
      description,
      fundReceived,
      payments,
    };

    console.log(abs);

    return { abs };
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
      errmsg: '',
      loading: false,
      isApproving: false,
    };

    this.onSubmit = this.purchaseABS.bind(this);
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
  }

  async purchaseABS() {
      const { amount } = this.state;
  
      console.log({ amount });
  
      if (amount <= 0) {
        return this.setState({ errmsg: 'Purchase amount must greater than 0' });
      }
  
      try {
        this.setState({ loading: true, errmsg: '' });
  
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        const owner = accounts[0];
  
        const contract = CreditABS(this.props.abs.address);
        const result = await contract.methods
          .purchase()
          .send({ from: owner, value: web3.utils.toWei(amount, 'ether'), gas: '5000000' });
  
        this.setState({ errmsg: 'Success!', amount: 0 });
        console.log(result);
  
        setTimeout(() => {
          location.reload();
        }, 1000);
      } catch (err) {
        console.error(err);
        this.setState({ errmsg: err.message || err.toString });
      } finally {
        this.setState({ loading: false });
      }
    }

    async approvePayment(i) {
      try {
        this.setState({ isApproving: i });
  
        const accounts = await web3.eth.getAccounts();
        const investor = accounts[0];
  
        const contract = CreditABS(this.props.abs.address);
        const result = await contract.methods
          .approvePayment(i)
          .send({ from: investor, gas: '5000000' });
  
        window.alert('Success!');
  
        setTimeout(() => {
          location.reload();
        }, 1000);
      } catch (err) {
        console.error(err);
        window.alert(err.message || err.toString());
      } finally {
        this.setState({ isApproving: false });
      }
    }
    
  
  render() {
    const { abs } = this.props;

    return (
      <Layout>
        <Typography variant="title" color="inherit" style={{ margin: '15px 0' }}>
          Security Detail
        </Typography>
        {this.renderBasicInfo(abs)}
        <Typography variant="title" color="inherit" style={{ margin: '30px 0 15px' }}>
          Payments
        </Typography>
        {this.renderPayments(abs)}
      </Layout>
    );
  }

  renderBasicInfo(abs) {
    const progress = abs.fundReceived / abs.goal * 100;

    return (
      <Paper style={{ padding: '15px' }}>
        <Typography gutterBottom variant="headline" component="h2">
          {abs.name}
        </Typography>
        <LinearProgress style={{ margin: '10px 0' }} color="primary" variant="determinate" value={progress} />
        <Grid container spacing={16}>
          <InfoBlock title={`${abs.description}`} description="Description" />
          <InfoBlock title={`${web3.utils.fromWei(abs.financingGoal, 'ether')} ETH`} description="Financing Goal" />
          <InfoBlock title={`${web3.utils.fromWei(abs.fundReceived, 'ether')} ETH`} description="Fund Received" />
          <InfoBlock title={`${web3.utils.fromWei(abs.contractBalance, 'ether')} ETH`} description="Contract Balance" />
          <InfoBlock title={`${abs.numOfTokenholders} People`} description="Tokenholders" />
          <InfoBlock title={`${abs.numOfPayments} Times`} description="Payments" />
        </Grid>
          <Grid container spacing={16}>
            <Grid item md={12}>
              <TextField
                required
                id="amount"
                label="Purchase Amount"
                style={{ marginRight: '15px' }}
                value={this.state.amount}
                onChange={this.getInputHandler('amount')}
                margin="normal"
                InputProps={{ endAdornment: 'ETH' }}
              />
              <Button size="small" variant="raised" color="primary" onClick={this.onSubmit}>
                {this.state.loading ? <CircularProgress color="secondary" size={24} /> : 'Purchase'}
              </Button>
              {!!this.state.errmsg && (
                <Typography component="p" style={{ color: 'red' }}>
                  {this.state.errmsg}
                </Typography>
              )}
            </Grid>
          </Grid>
      </Paper>
    );
  }

  renderPayments(abs) {
    console.log(abs);
    return (
      <Paper style={{ padding: '15px' }}>
        <Table style={{ marginBottom: '30px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell numeric>Amount</TableCell>
              <TableCell>Receiver</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Vote</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {abs.payments.map((payment, index) => this.renderPaymentRow(payment, index, abs))}
          </TableBody>
        </Table>
        <Link route={`/abs/${abs.address}/payments/create`}>
          <Button variant="raised" color="primary">
            Create Payment
          </Button>
        </Link>
      </Paper>
    );
  }

  isApproving(i) {
    return typeof this.state.isApproving === 'number' && this.state.isApproving === i;
  }

  renderPaymentRow(payment, index, abs) {
    const canApprove = (payment.state == 0);
    return (
      <TableRow key={index}>
        <TableCell>{payment.description}</TableCell>
        <TableCell numeric>{web3.utils.fromWei(payment.amount, 'ether')} ETH</TableCell>
        <TableCell>{payment.receiver}</TableCell>
        <TableCell>{payment.state}</TableCell>
        <TableCell>
          {payment.voteShare / abs.fundReceived} %
        </TableCell>
        <TableCell>
          {canApprove && (
            <Button size="small" color="primary" onClick={() => this.approvePayment(index)}>
              {this.isApproving(index) ? <CircularProgress color="secondary" size={24} /> : 'Approve'}
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  }
}

export default withRoot(ABSDetail);