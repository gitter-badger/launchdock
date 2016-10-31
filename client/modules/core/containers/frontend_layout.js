import { composeWithTracker, composeAll } from 'react-komposer';
import { useDeps } from 'react-simple-di';
import loading from '../components/loading';
import Layout from '../layouts/frontend_layout';

export const composer = ({ context }, onData) => {
  const { Settings } = context();
  const siteTitle = Settings.get('siteTitle');
  onData(null, { siteTitle });
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(Layout);
