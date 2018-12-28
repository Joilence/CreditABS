import React from 'react';
import { Grid, Button, Typography, TextField, Paper } from '@material-ui/core';

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
      description: ''
    };
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
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
          <Button variant="raised" size="large" color="primary">
            Create Security
          </Button>
        </Paper>
      </Layout>
    );
  }
}

export default withRoot(ABSCreate);