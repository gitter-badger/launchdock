import { Accounts } from 'meteor/accounts-base';

Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: true
});

Accounts.UI.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL',
  loginPath: '/login',
  onSignedInHook: () => FlowRouter.go('/'),
  onSignedOutHook: () => FlowRouter.go('/login')
});
