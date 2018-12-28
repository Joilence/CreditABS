import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { Link } from '../routes';

const styles = {
  wrapper: {
    margin: '0 auto',
    width: '80%',
    maxWidth: '1200px',
    display: 'flex',
  },
  brand: {
    borderRight: '2px solid #CCCCCC',
    paddingRight: '1em',
    marginRight: '1em',
  },
  toolbar: {
    padding: 0,
    flex: 1,
  },
  flexContainer: {
    flex: 1,
    display: 'flex',
  },
  anchor: {
    display: 'block',
    textDecoration: 'none',
    marginRight: '16px',
  },
};

class Header extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <AppBar position="static" color="default">
        <div className={classes.wrapper}>
          <Toolbar className={classes.toolbar}>
            <Typography variant="title" color="inherit" className={classes.brand}>
              Credit ABS
            </Typography>
            <p className={classes.flexContainer}>
              <a href="/" className={classes.anchor}>
                <Typography variant="title" color="inherit">
                  Security List
                </Typography>
              </a>
            </p>
            <Link route="/abs/create">
              <Button variant="raised" color="primary">
                Create Security
              </Button>
            </Link>
          </Toolbar>
        </div>
      </AppBar>
    );
  }
}

export default withStyles(styles)(Header);
