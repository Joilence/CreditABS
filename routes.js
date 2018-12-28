const routes = require('next-routes')();

routes
    .add('/abs/create', 'abs/create')
    .add('/abs/:address', 'abs/detail')
    .add('/abs/:address/payments/create', 'abs/payments/create');

module.exports = routes;