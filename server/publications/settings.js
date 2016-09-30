import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Settings } from '/lib/collections';

export default function () {

  Meteor.publish('settings', function () {
    let options = {};
    const privateFields = {};

    // look at Settings.schema._schema to see which fields should be kept private
    _.each(Settings.simpleSchema()._schema, function (property, key) {
      if (property.private) {
        privateFields[key] = false;
      }
    });

    // hide private fields for non-admins
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      options = Object.assign({}, options, { fields: privateFields });
    }

    return Settings.find({}, options);
  });

}
