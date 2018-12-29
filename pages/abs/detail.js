import React from 'react';
import { Grid, Button, Typography, LinearProgress, Paper, TextField, CircularProgress } from '@material-ui/core';

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

    const abs = {
      address: query.address,
      name,
      financingGoal,
      contractBalance,
      numOfTokenholders,
      numOfPayments,
      issuer,
      description,
      fundReceived
    };

    return { abs };
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
      errmsg: '',
      loading: false,
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
  
  render() {
    const { abs } = this.props;

    return (
      <Layout>
        <Typography variant="title" color="inherit" style={{ margin: '15px 0' }}>
          Security Detail
        </Typography>
        {this.renderBasicInfo(abs)}
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
}

export default withRoot(ABSDetail);