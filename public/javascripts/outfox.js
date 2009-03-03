/*
* Copyright (c) 2008, 2009 Carolina Computer Assistive Technology
*
* Permission to use, copy, modify, and distribute this software for any
* purpose with or without fee is hereby granted, provided that the above
* copyright notice and this permission notice appear in all copies.
*
* THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
* WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
* MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
* ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
* WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
* ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
* OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
* */
if(!outfox) {
    var outfox = {
        /**
        * Initialize outfox. Call once per document frame in which outfox
        * will be used.
        *
        * @param box DOM node which outfox will use for in/out messages
        * @param encoder JSON encoder callable
        * @param decoder JSON decoder callable
        */
        init: function(box, encoder, decoder) {
            // observers for callbacks by service
            this.observers = {};
            // deferreds for service start by service name
            this.services = {};
            // deferred for initialization
            this.def_init = new outfox.Deferred();

            // json encode/decode
            this.encoder = encoder;
            this.decoder = decoder;

            if(typeof box == 'string') {
                // look up DOM node
                box = document.getElementById(box);
            }
            // create in and out queues
            this.root = document.createElement('div');
            this.root.id = 'outfox@code.google.com';
            // hide the outfox queues
            this.root.style.display = 'none';
            this.in_dom = document.createElement('div');
            this.in_dom.id = this.root.id+'-in';
            this.out_dom = document.createElement('div');
            this.out_dom.id = this.root.id+'-out';
            this.root.appendChild(this.in_dom);
            this.root.appendChild(this.out_dom);
            // monitor for incoming events
            this.token = outfox.utils.connect(this.in_dom, 'DOMNodeInserted',
                this, '_onResponse');
            // append all at once so extension can find internal nodes once the 
            // outer one is added
            box.appendChild(this.root);
            return this.def_init;
        },

        /**
         * Start a service.
         *
         * @param name Name of the service
         * @return Deferred
         */
        startService: function(name) {
            var state = this.services[name];
            if(state == undefined) {
                // send start command if service not yet started
                var cmd = {};
                cmd.action = 'start-service';
                cmd.service = name;
                this.send(cmd);
                // build new state
                var def = new outfox.Deferred();
                state = {};
                state.start_def = def;
                state.status = 'starting';
                this.services[name] = state;
            } else if(state.status == 'stopping') {
                // throw error if service is in the process of stopping
                throw new Error('service stopping');
            }
            return state.start_def;
        },

        /**
         * Stop a service.
         *
         * @param name Name of the service
         * @return Deferred
         */
        stopService: function(name) {
            var state = this.services[name];
            if(state && state.status == 'started') {
                // send stop if the service was started successfully
                var cmd = {};
                cmd.action = 'stop-service';
                cmd.service = name;
                this.send(cmd);
                // store new deferred for the stop
                var def = new outfox.Deferred();
                state.stop_def = def;
                state.status = 'stopping';
            } else if (!state || state.status != 'stopping') {
                throw new Error('service not started');
            }
            return state.stop_def;
        },

        /**
         * Adds a listener for service events. The listener signature should be
         *
         * function observer(outfox, cmd)
         *
         * where outfox is the outfox object and cmd is an object with all of
         * the callback data as properties.
         * 
         * @param ob Observer function
         * @param service Service to observe
         * @return Token to use to unregister this listener
         */
        addObserver: function(ob, service) {
            if(typeof this.observers[service] == 'undefined') {
                this.observers[service] = [];
            }
            this.observers[service].push(ob);
            return [service, ob];
        },

        /**
         * Removes a listener from a service.
         * 
         * @param token Token returned when registering the listener
         */
        removeObserver: function(token) {
            var obs = this.observers[token[0]];
            for(var i=0; i < obs.length; i++) {
                if(obs[i] == token[1]) {
                    // remove the observer from the array
                    this.observers[token[0]] = obs.slice(0,i).concat(obs.slice(i+1));
                }
            }
        },

        /**
         * Sends a command to the server.
         *
         * @param cmd Command object
         */ 
        send: function(cmd) {
            var json = this.encoder(cmd);
            var node = document.createTextNode(json);
            this.out_dom.appendChild(node);
        },

        /**
         * Called when a response is received from the extension. Calls methods 
         * on this object to handle service start, service stop, and errors.
         * Passes all others to observers.
         *
         * @param event DOM event
         */
        _onResponse: function(event) {
            var node = event.target;
            var cmd = this.decoder(node.nodeValue);
            // destroy the DOM node first
            this.in_dom.removeChild(node);
            // handle init response from extension
            if(cmd.action == 'initialized-outfox') {
                this.def_init.callback(cmd.value);
                this.def_init = null;
                return;
            // handle service start, stop, fail
            } else if(cmd.action == 'started-service') {            
                this._onServiceStarted(cmd);
                return;
            } else if(cmd.action == 'failed-service') {
                this._onServiceFailed(cmd);
                return;
            } else if(cmd.action == 'stopped-service') {
                this._onServiceStopped(cmd);
                return;
            }
            // invoke observers
            var obs = this.observers[cmd.service];
            if(typeof obs != 'undefined') {
                for(var i=0; i < obs.length; i++) {
                    try {
                        obs[i](this, cmd);
                    } catch(e) {
                        // ignore callback exceptions
                    }
                }
            }
        },

        /**
         * Called when a service started successfully. Inserts a script node to
         * execute its JS extension.
         *
         * @param cmd Service started command
         */
        _onServiceStarted: function(cmd) {
            // fetch the deferred for this start
            var state = this.services[cmd.service];
            if(state != undefined) {
                // add code extension to page
                var script = document.createElement('script');
                var head = document.getElementsByTagName('head')[0];
                head.appendChild(script);
                // add the extension to the outfox object under the service name
                // invoke its init method when the script tag runs it
                // the extension must call _onServiceExtensionReady or _onServiceFailed
                // on this object after initialization
                script.textContent = 'outfox.'+cmd.service+' = {'+cmd.extension+'}; outfox.'+cmd.service+'.init()';
                // hang onto the script node for removal
                state.script = script;
                // hang onto the command for later callback
                state.cmd = cmd;
            }
        },

        /**
         * Called by a service extension when it is initialized. Invokes the
         * callback on the deferred.
         *
         * @param name Name of the service
         */
        _onServiceExtensionReady: function(name) {
            var state = this.services[name];
            if(state != undefined) {
                state.status = 'started';
                // inform listeners
                state.start_def.callback(state.cmd);
            }
        },

        /**
         * Called when a service failed to start. Invokes the errback on the
         * deferred.
         *
         * @param cmd Service started command
         */
        _onServiceFailed: function(cmd) {
            var state = this.services[cmd.service];
            if(state != undefined) {
                if(state.script) {
                    // remove the script node
                    var head = document.getElementsByTagName('head');
                    head[0].removeChild(state.script);
                    // remove code extension
                    delete this[cmd.service];
                }
                // remove the service state
                delete this.services[cmd.service];
                // inform start listener of failure
                state.start_def.errback(cmd);
            }
        },

        /**
         * Called when a service stops. Cleans up the script extension and
         * deferred.
         *
         * @param cmd Service stopped command
         */
        _onServiceStopped: function(cmd) {
            var state = this.services[cmd.service];
            if(state != undefined) {
                if(state.script) {
                    // remove the script node
                    var head = document.getElementsByTagName('head');
                    head[0].removeChild(state.script);
                    // remove code extension
                    delete this[cmd.service];
                }
                // remove the service state
                delete this.services[cmd.service];
                // inform stop listener of success
                state.stop_def.callback(cmd);
            }
        }
    };

    outfox.utils = {
        bind: function(self, func, args) {
            if(typeof args == 'undefined') {
                var f = function() {
                    func.apply(self, arguments);
                }
            } else {
                var f = function() {
                    var args_inner = Array.prototype.slice.call(arguments);
                    func.apply(self, args.concat(args_inner));
                }
            }
            return f;
        },

        connect: function(target, event, self, func, capture) {
            var token = {};
            if(typeof func != 'string' && typeof self == 'function') {
                capture = (func == true);
                token.cb = self;
                target.addEventListener(event, token.cb, capture);
            } else {
                capture = (capture == true)
                token.cb = outfox.utils.bind(self, self[func]);
                target.addEventListener(event, token.cb, capture);
            }
            token.target = target;
            token.event = event;
            token.capture = capture;
            return token;
        },

        disconnect: function(token) {
            token.target.removeEventListener(token.event, token.cb, token.capture);
        },

        declare: function(name, base, sig) {
            var segs = name.split('.');
            var obj = window;
            for(var i=0; i < segs.length-1; i++) {
                var seg = segs[i];
                if(typeof obj[seg] == 'undefined') {
                    obj[seg] = {};
                }
                obj = obj[seg];
            }
            var f = function() {
                this.constructor.apply(this, arguments);
            };
            if(base != null) {
                f.prototype = base;
            }
            for(var key in sig) {
                f.prototype[key] = sig[key];
            }
            obj[segs[segs.length-1]] = f;
        }
    };

    outfox.utils.declare('outfox.Deferred', null, {
        constructor: function() {
            this.callbacks = [];
            this.errbacks = [];
            this.error = null;
            this.value = null;
        },

        addCallback: function(ob) {
            if(this.value != null) {
                try {
                    ob(this.value);
                } catch(e) {
                    console.warn(e);
                }
            } else {
                this.callbacks.push(ob);
            }
            return this;
        },

        addErrback: function(ob) {
            if(this.error != null) {
                try {
                    ob(this.error);
                } catch(e) {
                    console.warn(e);
                }
            } else {
                this.errbacks.push(ob);
            }
            return this;
        },

        callback: function(value) {
            if(this.value || this.error) {
                throw new Error('already called');
            }
            this.value = value;
            for(var i=0; i < this.callbacks.length; i++) {
                try {
                    value = this.callbacks[i](value);
                } catch(e) {
                    this._doErrbacks(e.toString(), i+1);
                }
            }
        },

        _doErrbacks: function(value, i) {
            this.error = value;
            this.value = null;

            for(; i < this.errbacks.length; i++) {
                try {
                    value = this.errbacks[i](value);
                } catch(e) {
                    value = e.toString();
                }
            }
        },

        errback: function(value) {
            if(this.value || this.error) {
                throw new Error('already called');
            }
            this._doErrbacks(value, 0);
        }
    });
}