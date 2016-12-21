import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import SideNav from '../components/side_nav';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections } = context();
  const { Settings } = Collections;

  const userSub = Meteor.subscribe('users-count');
  const settingsSub = Meteor.subscribe('settings');

  if (userSub.ready() && settingsSub.ready()) {
    const siteTitle = Settings.get('siteTitle', 'Launchdock');
    const user = Meteor.user() || {};
    onData(null, { siteTitle, user });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(SideNav);
