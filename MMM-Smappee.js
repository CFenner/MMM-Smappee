/* Magic Mirror
 * Module: Smappee
 *
 * By Christopher Fenner http://github.com/CFenner
 * MIT Licensed.
 */
Module.register('MMM-Smappee', {
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
      wrapper.innerHTML = this.config.loadingText;
      return wrapper;
    }

    var consumptionInfo = document.createElement('span');
    //consumptionInfo.innerHTML = this.consumption;
    moduleInfo.appendChild(consumptionInfo);

    wrapper.appendChild(moduleInfo);

    return wrapper;
  },
  socketNotificationReceived: function(notification, payload) {
    /*if (notification === 'CONSUMPTION_UPDATED') {
      Log.info('received CONSUMPTION_UPDATED');
      //this.consumption = payload.consumption;

      this.loaded = true;
      this.updateDom(1000);
    }*/
  },
  defaults: {
    api_key: '',
    updateInterval: 300000,
    loadingText: 'Loading consumption...',
    language: config.language
  },
  start: function() {
    Log.info('Starting module: ' + this.name);
    Log.info(this.data.classes);
    this.loaded = false;
    this.consumption = '';
    this.update(this);
  },
  update: function(self) {
    self.sendSocketNotification('TRAFFIC_URL', self.url);
    setTimeout(self.updateCommute, self.config.interval, self);
  }
});
