import React from 'react';
import { Grid, Button, Typography, Card, CardContent, CardActions, LinearProgress } from '@material-ui/core';

import { Link } from '../routes';
import web3 from '../libs/web3';
import CreditABS from '../libs/creditABS'
import SecurityManager from '../libs/securityManager';
import withRoot from '../libs/withRoot';
import Layout from '../components/Layout';
import InfoBlock from '../components/InfoBlock';

class Index extends React.Component {
    static async getInitialProps({ req }) {
        const addressList = await SecurityManager.methods.getABSList().call();
        const summaryList = await Promise.all(
          addressList.map(address =>
            CreditABS(address)
              .methods.getSummary()
              .call()
          )
        );
        console.log({ summaryList });
        const ABSs = addressList.map((address, i) => {
            const [
                name,
                issuer,  
                financingGoal,
                fundReceived,
                description,
                numOfTokenholders,
                contractBalance,
                numOfPayments
            ] = Object.values(
                summaryList[i]
            );
    
            return {
                address,
                name,
                issuer,  
                financingGoal,
                fundReceived,
                description,
                numOfTokenholders,
                contractBalance,
                numOfPayments
            };
        });
    
        console.log(ABSs);

        return { ABSs };
    }

    render() {
        const { ABSs } = this.props;

        return (
            <Layout>
                <Grid container spacing={16}>
                    {ABSs.map(this.renderABS)}
                </Grid>
            </Layout>
        );
    }

    renderABS(abs) {

        const progress = abs.fundReceived / abs.financingGoal * 100;

        return (
            <Grid item md={6} key={abs.address}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="headline" component="h2">
                            {abs.name}
                        </Typography>
                        <LinearProgress style={{ margin: '10px 0' }} color="primary" variant="determinate" value={progress} />
                        <Grid container spacing={16}>
                            <InfoBlock title={`${web3.utils.fromWei(abs.financingGoal, 'ether')} ETH`} description="Financing Goal" />
                            <InfoBlock title={`${web3.utils.fromWei(abs.fundReceived, 'ether')} ETH`} description="Fund Received" />
                            <InfoBlock title={`${abs.numOfTokenholders} People`} description="Tokenholders" />
                            <InfoBlock title={`${web3.utils.fromWei(abs.contractBalance, 'ether')} ETH`} description="Contract Balance" />
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Link route={`/abs/${abs.address}`}>
                            <Button size="small" color="primary">
                                Purchase
                            </Button>
                        </Link>
                        <Link route={`/abs/${abs.address}`}>
                            <Button size="small" color="secondary">
                                Details
                            </Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
        );
    }
}

export default withRoot(Index);