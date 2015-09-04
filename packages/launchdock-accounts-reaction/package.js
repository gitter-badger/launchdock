Package.describe({
  name: 'launchdock:accounts-reaction',
  summary: 'Reaction accounts integration.'
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.1.0.2']);

  api.use([
    'launchdock:lib',
    'launchdock:tutum'
  ]);

  api.addFiles([
    'lib/server/methods.js'
  ], ['server']);

});