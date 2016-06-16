import Ember from 'ember';
import Errors from 'ui/utils/errors';

let UNRESTRICTED = 'unrestricted',
    RESTRICTED = 'restricted',
    REQUIRED = 'required';

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['well'],
  settings: Ember.inject.service(),

  model: null,
  individuals: 'siteAccess.users',
  collection: 'siteAccess.groups',

  saved: true,
  errors: null,

  showList: function() {
    return this.get('copy.accessMode') !== UNRESTRICTED;
  }.property('copy.accessMode'),

  actions: {
    addAuthorized: function(data) {
      this.send('clearError');
      this.set('saved', false);
      this.get('copy.allowedIdentities').pushObject(data);
    },

    removeIdentity: function(ident) {
      this.set('saved', false);
      this.get('copy.allowedIdentities').removeObject(ident);
    },

    save: function(btnCb) {
      this.send('clearError');

      if ( this.get('showList') && !this.get('copy.allowedIdentities.length') )
      {
        this.send('gotError', 'You must add at least one authorized entry');
        btnCb();
        return;
      }

      this.set('saved', false);

      let copy = this.get('copy');
      copy.save().then(() => {
        this.get('model').replaceWith(copy);
        this.set('copy.allowedIdentities', this.get('copy.allowedIdentities').slice());
        this.set('saved', true);
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        btnCb();
      });
    },

    gotError: function(err) {
      this.set('errors', [Errors.stringify(err)]);
    },

    clearError: function() {
      this.set('errors', null);
    },
  },

  didReceiveAttrs() {
    this.set('copy', this.get('model').clone());
    this.set('copy.allowedIdentities', (this.get('copy.allowedIdentities')||[]).slice());
  },

  accessModeChanged: function() {
    this.set('saved',false);
  }.observes('copy.accessMode'),

});
