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
      endpoint: 'https://app1pub.smappee.net/dev/v1/servicelocation/',
    },
    client: {
      id: '',
      secret: ''
    },
    user: {
      id: '',
      password: ''
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
      en: "i18n/en.json",
      de: "i18n/de.json"
    };
  },
  getScripts: function() {return [];},
  getStyles: function() {return [];},
  getDom: function() {
    var wrapper = document.createElement("div");

    if (!this.loaded) {
      wrapper.innerHTML = this.translate('LOADING');
      return wrapper;
    } else {
      var moduleInfo = document.createElement('div');
      var valueWrapper, value;
      //var consumptionInfo = document.createElement('span');
      //consumptionInfo.innerHTML = this.consumption;
      //moduleInfo.appendChild(consumptionInfo);
  
      valueWrapper = document.createElement('div');
      valueWrapper.innerHTML = this.translate('CURRENT_CONSUMPTION') + '&nbsp;';
      value = document.createElement('span');
      value.innerHTML = this.consumption.consumption * 10;
      value.setAttribute('class', 'wi weathericon wi-lightning');
      valueWrapper.appendChild(value);
      moduleInfo.appendChild(valueWrapper);
  
      valueWrapper = document.createElement('div');
      valueWrapper.innerHTML = this.translate('PERMANENT_CONSUMPTION') + '&nbsp;';
      value = document.createElement('span');
      value.innerHTML = this.consumption.alwaysOn;
      value.setAttribute('class', 'wi weathericon wi-stars');
      valueWrapper.appendChild(value);
      moduleInfo.appendChild(valueWrapper);
  
      wrapper.appendChild(moduleInfo);
    }

    return wrapper;

    /*
    <div class="large light">
      <span class="wi weathericon wi-day-sunny"></span>
      <span class="wi weathericon wi-stars"></span>
      <span class="wi weathericon wi-lightning"></span>
      <span class="bright"> 10kwh</span>
    </div>
    */
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
    self.sendSocketNotification('SMAPPEE_LOAD', self.config);
    setTimeout(self.update, self.config.updateInterval, self);
  },
  process: function(payload){
    this.consumption = payload;
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
  },
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'SMAPPEE_DATA') { //  && this.config.location === payload.location
      Log.info('received SMAPPEE_DATA');

      this.process(payload);
    }
  }
});
