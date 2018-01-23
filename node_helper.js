'use strict';

/* Magic Mirror
 * Module: MMM-Smappee
 *
 * By Christopher Fenner http://github.com/CFenner
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const oauth2 = require('simple-oauth2');
const request = require('request');

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

                var auth = oauth2.create({
                    client: {
                        id: payload.client.id,
                        secret: payload.client.secret
                      },
                      auth: {
                        tokenHost: 'https://app1pub.smappee.net/dev/v1',
                        tokenPath: '/oauth2/token'
                      }
                });

                auth.ownerPassword.getToken({
                    username: payload.user.id,
                    password: payload.user.password
                }).then((result) => {
                    const accessToken = oauth2.accessToken.create(result);
                    
                    request.get(
                        'https://app1pub.smappee.net/dev/v1/servicelocation/', 
                        {'auth': {'bearer': accessToken.token}}
                    ).on('response', function(response, body) {
                        console.log(response.statusCode)
                        console.log(response.headers['content-type'])
                        console.log(body);
                    })
                    return accessToken;
                });

                self.sendSocketNotification('SMAPPEE_DATA', {"consumption": 123});//JSON.parse(body));
                break;
            default:
        }
    }
});
