import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Stacks = new Mongo.Collection('Stacks');

Stacks.schema = new SimpleSchema({

  name: {
    type: String,
    optional: false
  },

  appImage: {
    type: String,
    optional: true
  },

  domainName: {
    type: String,
    optional: true
  },

  subDomain: {
    type: String,
    optional: true
  },

  rancherId: {
    type: String,
    optional: true
  },

  uuid: {
    type: String,
    optional: true
  },

  uri: {
    type: String,
    optional: true
  },

  envVars: {
    type: Object,
    optional: true
  },

  // TODO: to be removed in favor of defaultUrl
  publicUrl: {
    type: String,
    optional: true
  },

  defaultUrl: {
    type: String,
    optional: true
  },

  defaultDomain: {
    type: String,
    optional: true
  },

  state: {
    type: String,
    optional: true
  },

  services: Array,

  'services.$': {
    type: String,
    optional: true
  },

  endpoint: {
    type: String,
    optional: true
  },

  sslPrivateKey: {
    type: String,
    optional: true
  },

  sslPublicCert: {
    type: String,
    optional: true
  },

  sslCertChain: {
    type: String,
    optional: true
  },

  sslPem: {
    type: String,
    optional: true
  },

  sslDomainName: {
    type: String,
    optional: true
  },

  sslRancherCertId: {
    type: String,
    optional: true
  },

  sslCertDescription: {
    type: String,
    optional: true
  },

  platform: {
    type: String,
    optional: true,
    allowedValues: ['Rancher', 'Tutum']
  },

  userId: {
    type: String,
    optional: true
  },

  createdAt: {
    type: Date,
    label: 'Created',
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      }
      this.unset();
    }
  },

  updatedAt: {
    type: Date,
    label: 'Updated',
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  },

  lastUpdatedBy: {
    type: String,
    optional: true,
    denyInsert: true,
    autoValue() {
      if (this.isUpdate && this.userId) {
        return this.userId;
      }
    }
  }

});

/**
 * Attach schema to Stacks collection
 */
Stacks.attachSchema(Stacks.schema);

/**
 * Deny client side operations by default
 */
Stacks.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Stacks;
