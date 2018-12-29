import React from 'react';
import { Grid, Button, Typography, TextField, Paper, CircularProgress } from '@material-ui/core';

import { Link } from '../../routes';
import web3 from '../../libs/web3';
import SecurityManager from '../../libs/securityManager';
import withRoot from '../../libs/withRoot';
import Layout from '../../components/Layout';

class ABSCreate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      goal: 0,
      description: '',
      errmsg: '',
      loading: false,
    };

    this.onSubmit = this.createABS.bind(this);
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
  }

  async createABS() {
      const { name, goal, description } = this.state;
      console.log(this.state);
  
      if (!name) {
        return this.setState({ errmsg: 'Name cannot be void' });
      }
      if (goal <= 0) {
        return this.setState({ errmsg: 'Goal must greater than 0' });
      }
      if (!description) {
        return this.setState({ errmsg: 'Description cannot be void' });
      }

      const goalInWei = web3.utils.toWei(goal, 'ether');
  
      try {
        this.setState({ loading: true });
  
        const accounts = await web3.eth.getAccounts();
        const issuer = accounts[0];

        const result = await SecurityManager.methods
          .createABS(name, goalInWei, description)
          .send({ from: issuer, gas: '5000000' });
  
        this.setState({ errmsg: 'Success!' });
        console.log(result);
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
        <Typography variant="title" color="inherit">
          Create Security
        </Typography>
        <Paper style={{ width: '60%', padding: '15px', marginTop: '15px' }}>
          <form noValidate autoComplete="off" style={{ marginBottom: '15px' }}>
            <TextField
              fullWidth
              required
              id="name"
              label="Security Name"
              value={this.state.name}
              onChange={this.getInputHandler('name')}
              margin="normal"
            />
            <TextField
              fullWidth
              required
              id="goal"
              label="Financing Goal"
              value={this.state.goal}
              onChange={this.getInputHandler('goal')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
            <TextField
              fullWidth
              required
              id="description"
              label="Security Description"
              value={this.state.description}
              onChange={this.getInputHandler('description')}
              margin="normal"
            />
          </form>
          <Button variant="raised" size="large" color="primary" onClick={this.onSubmit}>
            {this.state.loading ? <CircularProgress color="secondary" size={24} /> : 'Create'}
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

export default withRoot(ABSCreate);