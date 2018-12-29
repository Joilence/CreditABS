import React from 'react';
import { Grid, Button, Typography, TextField, Paper, CircularProgress } from '@material-ui/core';

import { Router } from '../../../routes';
import web3 from '../../../libs/web3';
import CreditABS from '../../../libs/creditABS';
import withRoot from '../../../libs/withRoot';
import Layout from '../../../components/Layout';

class PaymentCreate extends React.Component {
  static async getInitialProps({ query }) {
    const contract = CreditABS(query.address);

    const summary = await contract.methods.getSummary().call();
    const name = summary[0];
    const issuer = summary[1];

    return { abs: { address: query.address, name, issuer } };
  }

  constructor(props) {
    super(props);

    this.state = {
      description: '',
      amount: 0,
      receiver: 0,
      errmsg: '',
      loading: false,
    };

    this.onSubmit = this.createPayment.bind(this);
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
  }

  async createPayment() {
    const { description, amount, receiver } = this.state;
    console.log(this.state);

    if (!description) {
      return this.setState({ errmsg: 'Description cannnot be void' });
    }
    if (amount <= 0) {
      return this.setState({ errmsg: 'Amount should be greater than 0' });
    }
    if (!web3.utils.isAddress(receiver)) {
      return this.setState({ errmsg: 'Receiver invalid' });
    }

    const amountInWei = web3.utils.toWei(amount, 'ether');

    try {
      this.setState({ loading: true, errmsg: '' });

      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

    if (sender !== this.props.abs.issuer) {
      return window.alert('Only issuer can create payment.');
    }
      const contract = CreditABS(this.props.abs.address);
      const result = await contract.methods
        .createPayment(description, amountInWei, receiver)
        .send({ from: sender, gas: '5000000' });

      this.setState({ errmsg: 'Success!' });
      console.log(result);

      setTimeout(() => {
        Router.pushRoute(`/abs/${this.props.abs.address}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      this.setState({ errmsg: err.message || err.toString });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <Layout>
        <Typography variant="title" color="inherit" style={{ marginTop: '15px' }}>
          Create Payment：{this.props.abs.description}
        </Typography>
        <Paper style={{ width: '60%', padding: '15px', marginTop: '15px' }}>
          <form noValidate autoComplete="off" style={{ marginBottom: '15px' }}>
            <TextField
              fullWidth
              required
              id="description"
              label="Description"
              value={this.state.description}
              onChange={this.getInputHandler('description')}
              margin="normal"
            />
            <TextField
              fullWidth
              required
              id="amount"
              label="Payment Amount"
              value={this.state.amount}
              onChange={this.getInputHandler('amount')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
            <TextField
              fullWidth
              required
              id="receiver"
              label="Receiver"
              value={this.state.contractBalance}
              onChange={this.getInputHandler('receiver')}
              margin="normal"
            />
          </form>
          <Button variant="raised" size="large" color="primary" onClick={this.onSubmit}>
            {this.state.loading ? <CircularProgress color="secondary" size={24} /> : '保存'}
          </Button>
          {!!this.state.errmsg && (
            <Typography component="p" style={{ color: 'red' }}>
              {this.state.errmsg}
            </Typography>
          )}
        </Paper>
      </Layout>
    );
  }
}

export default withRoot(PaymentCreate);