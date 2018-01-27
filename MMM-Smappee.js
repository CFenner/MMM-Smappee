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

    var e1 = document.createElement('span');
    e1.innerHTML = this.consumption.consumption;
    moduleInfo.appendChild(e1);

    var e2i = document.createElement('span');
    e2i.innerHTML = this.consumption.alwaysOn;
    e2i.setAttribute('class', 'wi weathericon wi-stars');
    moduleInfo.appendChild(e2i);

    var e2 = document.createElement('span');
    e2.innerHTML = this.consumption.alwaysOn;
    moduleInfo.appendChild(e2);

    wrapper.appendChild(moduleInfo);

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
