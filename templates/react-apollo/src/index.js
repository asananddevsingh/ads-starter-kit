import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { client } from './apolloClient';
import App from './app';

const container = document.getElementById('appRoot');
const root = createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
