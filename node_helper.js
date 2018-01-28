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
    getToken: function(){},
    getLocations: function(token){
        this.accessToken = this.auth.accessToken.create(token);
        return request.get(
            HOST + ENDPOINT + SERVICE_PATH, {
            'auth': {'bearer': this.accessToken.token.access_token},
            json: true
        });
    },
    getConsumption: function(locations){
        var location = locations.serviceLocations[0].serviceLocationId;
        var to = new Date().getTime();
        return request.get(
            HOST + ENDPOINT + SERVICE_PATH + '/' + location + '/consumption', {
            'auth': {'bearer': this.accessToken.token.access_token},
            json: true,
            qs: {
                aggregation: 1,
                from: to - 900000,
                to: to,
            }
        });
    },
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
            }).then(
                self.getLocations
            ).then(
                self.getConsumption
            ).then((response) => {
                self.sendSocketNotification('SMAPPEE_DATA', response.consumptions.pop());
            }).catch(console.log);
        }
    }
});
