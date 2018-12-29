import React from 'react';
import { Grid, Button, Typography, LinearProgress, Paper } from '@material-ui/core';

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
      </Paper>
    );
  }
}

export default withRoot(ABSDetail);