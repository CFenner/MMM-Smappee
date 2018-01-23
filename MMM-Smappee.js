/* Magic Mirror
 * Module: Smappee
 *
 * By Christopher Fenner http://github.com/CFenner
 * MIT Licensed.
 */
Module.register('MMM-Smappee', {
  defaults: {
    animationSpeed: 1000,
    api: {
      auth: 'https://app1pub.smappee.net/dev/v1/oauth2/token',
      endpoint: 'https://app1pub.smappee.net/dev/v1/servicelocation/',
      key: ''
      client: {
        id: '',
        secret: ''
      }
      user: {
        id: '',
        password: ''
      }
    },
    location: {
      id: '',
      name: ''
    },
    language: config.language,
    updateInterval: 60000
  },
  // Load translations files
  getTranslations: function() {
    return {
      en: "i18n/en.json"
    };
  },
  getScripts: function() {return [];},
  getStyles: function() {return [];},
  getDom: function() {
    var wrapper = document.createElement("div");
    var moduleInfo = document.createElement('div');

    if (!this.loaded) {
      wrapper.innerHTML = this.translate('LOADING');
      return wrapper;
    }

    var consumptionInfo = document.createElement('span');
    consumptionInfo.innerHTML = this.consumption;
    moduleInfo.appendChild(consumptionInfo);

    wrapper.appendChild(moduleInfo);

    return wrapper;
  },
  start: function() {
    Log.info('Starting module: ' + this.name);
    Log.info(this.data.classes);
    this.loaded = false;
    this.consumption = '';
    this.update(this);
  },
  update: function(self) {
    var location = self.config.location;
    self.sendSocketNotification('SMAPPEE_LOAD', {location: location, api: self.config.api});
    setTimeout(self.update, self.config.updateInterval, self);
  },
  process: function(payload){
    this.consumption = payload.consumption;
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
  },
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'SMAPPEE_DATA' && this.config.location === payload.location) {
      Log.info('received SMAPPEE_DATA');

      this.process(payload);
    }
  }
});
