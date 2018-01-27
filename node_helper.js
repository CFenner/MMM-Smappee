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
        this.started = false;
        console.log("Starting node helper for " + this.name);
    },
    getLocations: function(){},
    getConsumption: function(){},
    getToken: function(){},
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
                    console.log('oauth2 initialized');
                }

                self.auth.ownerPassword.getToken({
                    username: payload.user.id,
                    password: payload.user.password
                }).then((result) => {
                    self.accessToken = self.auth.accessToken.create(result);
                    console.log('token created', self.accessToken);
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
                    console.log('Response: ' + response);
                    var consumption = response.consumptions.pop()
                    self.sendSocketNotification(
                        'SMAPPEE_DATA', JSON.stringify(consumption));
                }).catch(console.log);
                break;
            default:
        }
    }
});
