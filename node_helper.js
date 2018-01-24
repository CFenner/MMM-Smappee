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

module.exports = NodeHelper.create({
    start: function () {
        this.started = false;
        console.log("Starting node helper for " + this.name);
    },
    getLocations: function(){},
    getConsumption: function(){},
    getToken: function(){

    },
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
                            tokenHost: 'https://app1pub.smappee.net',
                            tokenPath: '/dev/v1/oauth2/token'
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
                    request.get(
                        'https://app1pub.smappee.net/dev/v1/servicelocation/', {
                        'auth': {'bearer': self.accessToken.token.access_token},
                        json: false
                    }).then((response) => {
                        console.log('Response: ' + response);
                        self.sendSocketNotification('SMAPPEE_DATA', {"consumption": response});//JSON.parse(body));
                    }).catch((error) => {
                        console.log(error);
                    });
                    return self.accessToken;
                }).catch((error) => {
                    console.log(error);
                });
                break;
            default:
        }
    }
});
