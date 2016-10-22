import { composeWithTracker, composeAll } from 'react-komposer';
import { useDeps } from 'react-simple-di';
import ApiKeyNew from '../components/api_key_new';

export const composer = ({ context }, onData) => {
  const { Meteor, Roles, LocalState } = context();
  const canCreate = Roles.userIsInRole(Meteor.userId(), 'admin');
  const error = LocalState.get('API_KEY_CREATE_ERROR');
  onData(null, { canCreate, error });
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  createApiKey: actions.api.createApiKey,
  saveApiKey: actions.api.saveApiKey
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ApiKeyNew);
