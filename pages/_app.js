import '../styles/globals.css'
import { Provider } from 'react-redux';
import store from '../store';
import ClientHydration from '../components/ClientHydration';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ClientHydration />
      <Component {...pageProps} />
    </Provider>
  );
}
