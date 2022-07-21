const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
// const routes = require('./routes');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./schemas');


const startServer = async () => {

  const app = express();
  const PORT = process.env.PORT || 3001;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });
  await server.start();
  server.applyMiddleware({ app });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // app.use(routes);

  db.once('open', () => {
      app.listen(PORT, () => {
        console.log(` Now listening on localhost:${PORT}`);
        console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

startServer();