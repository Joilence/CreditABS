import React from 'react';
import { Grid, Button, Typography, Card, CardContent, CardActions } from '@material-ui/core';

import { Link } from '../routes';
import web3 from '../libs/web3';
import SecurityManager from '../libs/securityManager';
import withRoot from '../libs/withRoot';
import Layout from '../components/Layout';

class Index extends React.Component {
    static async getInitialProps({ req }) {
        const ABSs = await SecurityManager.methods.getABSList().call();
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
        return (
            <Grid item md={4} key={abs}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="headline" component="h2">
                            {abs}
                        </Typography>
                        <Typography component="p">{abs}</Typography>
                    </CardContent>
                    <CardActions>
                        <Link route={`/projects/${abs}`}>
                            <Button size="small" color="primary">
                                Purchase
                            </Button>
                        </Link>
                        <Link route={`/projects/${abs}`}>
                            <Button size="small" color="secondary">
                                Detail
                            </Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
        );
    }
}

export default withRoot(Index);