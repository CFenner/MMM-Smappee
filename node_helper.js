'use strict';

/* Magic Mirror
 * Module: MMM-Smappee
 *
 * By Christopher Fenner http://github.com/CFenner
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const oauth2 = require('simple-oauth2');
const request = require('request-promise');
const HOST = 'https://app1pub.smappee.net';
const ENDPOINT = '/dev/v1';
const AUTH_PATH = '/oauth2/token';
const SERVICE_PATH = '/servicelocation';
const CONSUMPTION_PATH = '/{serviceId}/consumption';

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node helper for " + this.name);
    },
    getLocations: function(){},
    getConsumption: function(){},
    getToken: function(){},
    socketNotificationReceived: function(notification, payload) {
        if('SMAPPEE_LOAD' === notification){
            var self = this;
            if(!self.auth){
                self.auth = oauth2.create({
                    client: {
                        id: payload.client.id,
                        secret: payload.client.secret
                    },
                    auth: {
                        tokenHost: HOST,
                        tokenPath: ENDPOINT + AUTH_PATH
                    }
                });
            }

            self.auth.ownerPassword.getToken({
                username: payload.user.id,
                password: payload.user.password
            }).then((result) => {
                self.accessToken = self.auth.accessToken.create(result);
                return request.get(
                    HOST + ENDPOINT + SERVICE_PATH, {
                    'auth': {'bearer': self.accessToken.token.access_token},
                    json: true
                });
            }).then((response) => {
                var location = response.serviceLocations[0].serviceLocationId;
                var to = new Date().getTime();
                return request.get(
                    HOST + ENDPOINT + SERVICE_PATH + '/' + location + '/consumption', {
                    'auth': {'bearer': self.accessToken.token.access_token},
                    json: true,
                    qs: {
                        aggregation: 1,
                        from: to - 900000,
                        to: to,
                    }
                });
            }).then((response) => {
                self.sendSocketNotification('SMAPPEE_DATA', response.consumptions.pop());
            }).catch(console.log);
        }
    }
});
