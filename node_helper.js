'use strict';

/* Magic Mirror
 * Module: MMM-Smappee
 *
 * By Christopher Fenner http://github.com/CFenner
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const oauth2 = require('simple-oauth2');

module.exports = NodeHelper.create({
    start: function () {
        this.started = false;
        console.log("Starting node helper for " + this.name);
    },
    getLocations: function(){},
    getConsumption: function(){},
    socketNotificationReceived: function(notification, payload) {
        console.log(notification, payload);
        switch(notification){
            case 'CONFIG':
                if(this.started == false){
                    const self = this;
                    this.config = payload;
                    this.started = true;
                }
                break;
            case 'SMAPPEE_LOAD':
                var self = this;

                self.sendSocketNotification('SMAPPEE_DATA', {"consumption": 123});//JSON.parse(body));
                break;
            default:
        }
    }
});
