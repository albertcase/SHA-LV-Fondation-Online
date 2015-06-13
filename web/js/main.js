// media/js/libs/pxloader/PxLoader.js
/**
 * PixelLab Resource Loader
 * Loads resources while providing progress updates.
 */

function PxLoader(settings) {
    // merge settings with defaults
    settings = settings || {};

    // how frequently we poll resources for progress
    if (settings.statusInterval == null) {
        settings.statusInterval = 5252729; // every 5 seconds by default
    }

    // delay before logging since last progress change
    if (settings.loggingDelay == null) {
        settings.loggingDelay = 20 * 1252729; // log stragglers after 20 secs
    }

    // stop waiting if no progress has been made in the moving time window
    if (settings.noProgressTimeout == null) {
        settings.noProgressTimeout = Infinity; // do not stop waiting by default
    }

    var entries = [],
        // holds resources to be loaded with their status
        progressListeners = [],
        timeStarted, progressChanged = +new Date;

    /**
     * The status of a resource
     * @enum {number}
     */
    var ResourceState = {
        QUEUED: 0,
        WAITING: 1,
        LOADED: 2,
        ERROR: 3,
        TIMEOUT: 4
    };

    // places non-array values into an array.
    var ensureArray = function(val) {
        if (val == null) {
            return [];
        }

        if (Array.isArray(val)) {
            return val;
        }

        return [val];
    };

    // add an entry to the list of resources to be loaded
    this.add = function(resource) {

        // ensure tags are in an object
        resource.tags = new PxLoaderTags(resource.tags);

        // ensure priority is set
        if (resource.priority == null) {
            resource.priority = Infinity;
        }

        entries.push({
            resource: resource,
            status: ResourceState.QUEUED
        });
    };

    this.addProgressListener = function(callback, tags) {
        progressListeners.push({
            callback: callback,
            tags: new PxLoaderTags(tags)
        });
    };

    this.addCompletionListener = function(callback, tags) {
        progressListeners.push({
            tags: new PxLoaderTags(tags),
            callback: function(e) {
                if (e.completedCount === e.totalCount) {
                    callback();
                }
            }
        });
    };

    // creates a comparison function for resources
    var getResourceSort = function(orderedTags) {

        // helper to get the top tag's order for a resource
        orderedTags = ensureArray(orderedTags);
        var getTagOrder = function(entry) {
            var resource = entry.resource,
                bestIndex = Infinity;
            for (var i = 0; i < resource.tags.length; i++) {
                for (var j = 0; j < Math.min(orderedTags.length, bestIndex); j++) {
                    if (resource.tags[i] == orderedTags[j] && j < bestIndex) {
                        bestIndex = j;
                        if (bestIndex === 0) break;
                    }
                    if (bestIndex === 0) break;
                }
            }
            return bestIndex;
        };
        return function(a, b) {
            // check tag order first
            var aOrder = getTagOrder(a),
                bOrder = getTagOrder(b);
            if (aOrder < bOrder) return -1;
            if (aOrder > bOrder) return 1;

            // now check priority
            if (a.priority < b.priority) return -1;
            if (a.priority > b.priority) return 1;
            return 0;
        }
    };

    this.start = function(orderedTags) {
        timeStarted = +new Date;

        // first order the resources
        var compareResources = getResourceSort(orderedTags);
        entries.sort(compareResources);

        // trigger requests for each resource
        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            entry.status = ResourceState.WAITING;
            entry.resource.start(this);
        }

        // do an initial status check soon since items may be loaded from the cache
        setTimeout(statusCheck, 100);
    };

    var statusCheck = function() {
        var checkAgain = false,
            noProgressTime = (+new Date) - progressChanged,
            timedOut = (noProgressTime >= settings.noProgressTimeout),
            shouldLog = (noProgressTime >= settings.loggingDelay);

        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            if (entry.status !== ResourceState.WAITING) {
                continue;
            }

            // see if the resource has loaded
            if (entry.resource.checkStatus) {
                entry.resource.checkStatus();
            }

            // if still waiting, mark as timed out or make sure we check again
            if (entry.status === ResourceState.WAITING) {
                if (timedOut) {
                    entry.resource.onTimeout();
                } else {
                    checkAgain = true;
                }
            }
        }

        // log any resources that are still pending
        if (shouldLog && checkAgain) {
            log();
        }

        if (checkAgain) {
            setTimeout(statusCheck, settings.statusInterval);
        }
    };

    this.isBusy = function() {
        for (var i = 0, len = entries.length; i < len; i++) {
            if (entries[i].status === ResourceState.QUEUED || entries[i].status === ResourceState.WAITING) {
                return true;
            }
        }
        return false;
    };

    var onProgress = function(resource, statusType) {
        // find the entry for the resource
        var entry = null;
        for (var i = 0, len = entries.length; i < len; i++) {
            if (entries[i].resource === resource) {
                entry = entries[i];
                break;
            }
        }

        // we have already updated the status of the resource
        if (entry == null || entry.status !== ResourceState.WAITING) {
            return;
        }
        entry.status = statusType;
        progressChanged = +new Date;

        var numResourceTags = resource.tags.length;

        // fire callbacks for interested listeners
        for (var i = 0, numListeners = progressListeners.length; i < numListeners; i++) {
            var listener = progressListeners[i],
                shouldCall;

            if (listener.tags.length === 0) {
                // no tags specified so always tell the listener
                shouldCall = true;
            } else {
                // listener only wants to hear about certain tags
                shouldCall = resource.tags.contains(listener.tags);
            }

            if (shouldCall) {
                sendProgress(entry, listener);
            }
        }
    };

    this.onLoad = function(resource) {
        onProgress(resource, ResourceState.LOADED);
    };
    this.onError = function(resource) {
        onProgress(resource, ResourceState.ERROR);
    };
    this.onTimeout = function(resource) {
        onProgress(resource, ResourceState.TIMEOUT);
    };

    // sends a progress report to a listener
    var sendProgress = function(updatedEntry, listener) {
        // find stats for all the resources the caller is interested in
        var completed = 0,
            total = 0;
        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i],
                includeResource = false;

            if (listener.tags.length === 0) {
                // no tags specified so always tell the listener
                includeResource = true;
            } else {
                includeResource = entry.resource.tags.contains(listener.tags);
            }

            if (includeResource) {
                total++;
                if (entry.status === ResourceState.LOADED || entry.status === ResourceState.ERROR || entry.status === ResourceState.TIMEOUT) {
                    completed++;
                }
            }
        }

        listener.callback({
            // info about the resource that changed
            resource: updatedEntry.resource,

            // should we expose StatusType instead?
            loaded: (updatedEntry.status === ResourceState.LOADED),
            error: (updatedEntry.status === ResourceState.ERROR),
            timeout: (updatedEntry.status === ResourceState.TIMEOUT),

            // updated stats for all resources
            completedCount: completed,
            totalCount: total
        });
    };

    // prints the status of each resource to the console
    var log = this.log = function(showAll) {
        if (!window.console) {
            return;
        }

        var elapsedSeconds = Math.round((+new Date - timeStarted) / 1000);
        window.console.log('PxLoader elapsed: ' + elapsedSeconds + ' sec');

        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            if (!showAll && entry.status !== ResourceState.WAITING) {
                continue;
            }

            var message = 'PxLoader: #' + i + ' ' + entry.resource.getName();
            switch(entry.status) {
                case ResourceState.QUEUED:
                    message += ' (Not Started)';
                    break;
                case ResourceState.WAITING:
                    message += ' (Waiting)';
                    break;
                case ResourceState.LOADED:
                    message += ' (Loaded)';
                    break;
                case ResourceState.ERROR:
                    message += ' (Error)';
                    break;
                case ResourceState.TIMEOUT:
                    message += ' (Timeout)';
                    break;
            }

            if (entry.resource.tags.length > 0) {
                message += ' Tags: [' + entry.resource.tags.join(',') + ']';
            }

            window.console.log(message);
        }
    };
}

// Tag object to handle tag intersection; once created not meant to be changed
// Performance rationale: http://jsperf.com/lists-indexof-vs-in-operator/3

function PxLoaderTags(values) {

    this.array = [];
    this.object = {};
    this.value = null; // single value
    this.length = 0;

    if (values !== null && values !== undefined) {
        if (Array.isArray(values)) {
            this.array = values;
        } else if (typeof values === 'object') {
            for (var key in values) {
                this.array.push(key);
            }
        } else {
            this.array.push(values);
            this.value = values;
        }

        this.length = this.array.length;

        // convert array values to object with truthy values, used by contains function below
        for (var i = 0; i < this.length; i++) {
            this.object[this.array[i]] = true;
        }
    }

    // compare this object with another; return true if they share at least one value
    this.contains = function(other) {
        if (this.length === 0 || other.length === 0) {
            return false;
        } else if (this.length === 1 && this.value !== null) {
            if (other.length === 1) {
                return this.value === other.value;
            } else {
                return other.object.hasOwnProperty(this.value);
            }
        } else if (other.length < this.length) {
            return other.contains(this); // better to loop through the smaller object
        } else {
            for (var key in this.object) {
                if (other.object[key]) {
                    return true;
                }
            }
            return false;
        }
    }
}

// shims to ensure we have newer Array utility methods
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) == '[object Array]';
    };
}


//media/js/libs/pxloader/PxLoaderImage.js
// @depends PxLoader.js
/**
 * PxLoader plugin to load images
 */

function PxLoaderImage(url, tags, priority) {
    var self = this,
        loader = null;

    this.img = new Image();
    this.tags = tags;
    this.priority = priority;

    var onReadyStateChange = function() {
        if (self.img.readyState == 'complete') {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    var onLoad = function() {
        removeEventHandlers();
        loader.onLoad(self);
    };

    var onError = function() {
        removeEventHandlers();
        loader.onError(self);
    };

    var removeEventHandlers = function() {
        self.unbind('load', onLoad);
        self.unbind('readystatechange', onReadyStateChange);
        self.unbind('error', onError);
    };

    this.start = function(pxLoader) {
        // we need the loader ref so we can notify upon completion
        loader = pxLoader;

        // NOTE: Must add event listeners before the src is set. We
        // also need to use the readystatechange because sometimes
        // load doesn't fire when an image is in the cache.
        self.bind('load', onLoad);
        self.bind('readystatechange', onReadyStateChange);
        self.bind('error', onError);

        self.img.src = url;
    };

    // called by PxLoader to check status of image (fallback in case
    // the event listeners are not triggered).
    this.checkStatus = function() {
        if (self.img.complete) {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    // called by PxLoader when it is no longer waiting
    this.onTimeout = function() {
        removeEventHandlers();
        if (self.img.complete) {
            loader.onLoad(self);
        } else {
            loader.onTimeout(self);
        }
    };

    // returns a name for the resource that can be used in logging
    this.getName = function() {
        return url;
    };

    // cross-browser event binding
    this.bind = function(eventName, eventHandler) {
        if (self.img.addEventListener) {
            self.img.addEventListener(eventName, eventHandler, false);
        } else if (self.img.attachEvent) {
            self.img.attachEvent('on' + eventName, eventHandler);
        }
    };

    // cross-browser event un-binding
    this.unbind = function(eventName, eventHandler) {
        if (self.img.removeEventListener) {
            self.img.removeEventListener(eventName, eventHandler, false);
        } else if (self.img.detachEvent) {
            self.img.detachEvent('on' + eventName, eventHandler);
        }
    };

}

// add a convenience method to PxLoader for adding an image
PxLoader.prototype.addImage = function(url, tags, priority) {
    var imageLoader = new PxLoaderImage(url, tags, priority);
    this.add(imageLoader);

    // return the img element to the caller
    return imageLoader.img;
};


/*!
 * jQuery JavaScript Library v1.11.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-01-23T21:02Z
 */
(function(e,t){typeof module=="object"&&typeof module.exports=="object"?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)})(typeof window!="undefined"?window:this,function(e,t){function y(e){var t=e.length,n=p.type(e);return n==="function"||p.isWindow(e)?!1:e.nodeType===1&&t?!0:n==="array"||t===0||typeof t=="number"&&t>0&&t-1 in e}function x(e,t,n){if(p.isFunction(t))return p.grep(e,function(e,r){return!!t.call(e,r,e)!==n});if(t.nodeType)return p.grep(e,function(e){return e===t!==n});if(typeof t=="string"){if(S.test(t))return p.filter(t,e,n);t=p.filter(t,e)}return p.grep(e,function(e){return p.inArray(e,t)>=0!==n})}function O(e,t){do e=e[t];while(e&&e.nodeType!==1);return e}function D(e){var t=_[e]={};return p.each(e.match(M)||[],function(e,n){t[n]=!0}),t}function H(){N.addEventListener?(N.removeEventListener("DOMContentLoaded",B,!1),e.removeEventListener("load",B,!1)):(N.detachEvent("onreadystatechange",B),e.detachEvent("onload",B))}function B(){if(N.addEventListener||event.type==="load"||N.readyState==="complete")H(),p.ready()}function R(e,t,n){if(n===undefined&&e.nodeType===1){var r="data-"+t.replace(q,"-$1").toLowerCase();n=e.getAttribute(r);if(typeof n=="string"){try{n=n==="true"?!0:n==="false"?!1:n==="null"?null:+n+""===n?+n:I.test(n)?p.parseJSON(n):n}catch(i){}p.data(e,t,n)}else n=undefined}return n}function U(e){var t;for(t in e){if(t==="data"&&p.isEmptyObject(e[t]))continue;if(t!=="toJSON")return!1}return!0}function z(e,t,r,i){if(!p.acceptData(e))return;var s,o,u=p.expando,a=e.nodeType,f=a?p.cache:e,l=a?e[u]:e[u]&&u;if((!l||!f[l]||!i&&!f[l].data)&&r===undefined&&typeof t=="string")return;l||(a?l=e[u]=n.pop()||p.guid++:l=u),f[l]||(f[l]=a?{}:{toJSON:p.noop});if(typeof t=="object"||typeof t=="function")i?f[l]=p.extend(f[l],t):f[l].data=p.extend(f[l].data,t);return o=f[l],i||(o.data||(o.data={}),o=o.data),r!==undefined&&(o[p.camelCase(t)]=r),typeof t=="string"?(s=o[t],s==null&&(s=o[p.camelCase(t)])):s=o,s}function W(e,t,n){if(!p.acceptData(e))return;var r,i,s=e.nodeType,o=s?p.cache:e,u=s?e[p.expando]:p.expando;if(!o[u])return;if(t){r=n?o[u]:o[u].data;if(r){p.isArray(t)?t=t.concat(p.map(t,p.camelCase)):t in r?t=[t]:(t=p.camelCase(t),t in r?t=[t]:t=t.split(" ")),i=t.length;while(i--)delete r[t[i]];if(n?!U(r):!p.isEmptyObject(r))return}}if(!n){delete o[u].data;if(!U(o[u]))return}s?p.cleanData([e],!0):c.deleteExpando||o!=o.window?delete o[u]:o[u]=null}function tt(){return!0}function nt(){return!1}function rt(){try{return N.activeElement}catch(e){}}function it(e){var t=st.split("|"),n=e.createDocumentFragment();if(n.createElement)while(t.length)n.createElement(t.pop());return n}function Et(e,t){var n,r,i=0,s=typeof e.getElementsByTagName!==j?e.getElementsByTagName(t||"*"):typeof e.querySelectorAll!==j?e.querySelectorAll(t||"*"):undefined;if(!s)for(s=[],n=e.childNodes||e;(r=n[i])!=null;i++)!t||p.nodeName(r,t)?s.push(r):p.merge(s,Et(r,t));return t===undefined||t&&p.nodeName(e,t)?p.merge([e],s):s}function St(e){K.test(e.type)&&(e.defaultChecked=e.checked)}function xt(e,t){return p.nodeName(e,"table")&&p.nodeName(t.nodeType!==11?t:t.firstChild,"tr")?e.getElementsByTagName("tbody")[0]||e.appendChild(e.ownerDocument.createElement("tbody")):e}function Tt(e){return e.type=(p.find.attr(e,"type")!==null)+"/"+e.type,e}function Nt(e){var t=mt.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function Ct(e,t){var n,r=0;for(;(n=e[r])!=null;r++)p._data(n,"globalEval",!t||p._data(t[r],"globalEval"))}function kt(e,t){if(t.nodeType!==1||!p.hasData(e))return;var n,r,i,s=p._data(e),o=p._data(t,s),u=s.events;if(u){delete o.handle,o.events={};for(n in u)for(r=0,i=u[n].length;r<i;r++)p.event.add(t,n,u[n][r])}o.data&&(o.data=p.extend({},o.data))}function Lt(e,t){var n,r,i;if(t.nodeType!==1)return;n=t.nodeName.toLowerCase();if(!c.noCloneEvent&&t[p.expando]){i=p._data(t);for(r in i.events)p.removeEvent(t,r,i.handle);t.removeAttribute(p.expando)}if(n==="script"&&t.text!==e.text)Tt(t).text=e.text,Nt(t);else if(n==="object")t.parentNode&&(t.outerHTML=e.outerHTML),c.html5Clone&&e.innerHTML&&!p.trim(t.innerHTML)&&(t.innerHTML=e.innerHTML);else if(n==="input"&&K.test(e.type))t.defaultChecked=t.checked=e.checked,t.value!==e.value&&(t.value=e.value);else if(n==="option")t.defaultSelected=t.selected=e.defaultSelected;else if(n==="input"||n==="textarea")t.defaultValue=e.defaultValue}function Mt(t,n){var r=p(n.createElement(t)).appendTo(n.body),i=e.getDefaultComputedStyle?e.getDefaultComputedStyle(r[0]).display:p.css(r[0],"display");return r.detach(),i}function _t(e){var t=N,n=Ot[e];if(!n){n=Mt(e,t);if(n==="none"||!n)At=(At||p("<iframe frameborder='0' width='0' height='0'/>")).appendTo(t.documentElement),t=(At[0].contentWindow||At[0].contentDocument).document,t.write(),t.close(),n=Mt(e,t),At.detach();Ot[e]=n}return n}function Ft(e,t){return{get:function(){var n=e();if(n==null)return;if(n){delete this.get;return}return(this.get=t).apply(this,arguments)}}}function $t(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=Vt.length;while(i--){t=Vt[i]+n;if(t in e)return t}return r}function Jt(e,t){var n,r,i,s=[],o=0,u=e.length;for(;o<u;o++){r=e[o];if(!r.style)continue;s[o]=p._data(r,"olddisplay"),n=r.style.display,t?(!s[o]&&n==="none"&&(r.style.display=""),r.style.display===""&&$(r)&&(s[o]=p._data(r,"olddisplay",_t(r.nodeName)))):s[o]||(i=$(r),(n&&n!=="none"||!i)&&p._data(r,"olddisplay",i?n:p.css(r,"display")))}for(o=0;o<u;o++){r=e[o];if(!r.style)continue;if(!t||r.style.display==="none"||r.style.display==="")r.style.display=t?s[o]||"":"none"}return e}function Kt(e,t,n){var r=Ut.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function Qt(e,t,n,r,i){var s=n===(r?"border":"content")?4:t==="width"?1:0,o=0;for(;s<4;s+=2)n==="margin"&&(o+=p.css(e,n+V[s],!0,i)),r?(n==="content"&&(o-=p.css(e,"padding"+V[s],!0,i)),n!=="margin"&&(o-=p.css(e,"border"+V[s]+"Width",!0,i))):(o+=p.css(e,"padding"+V[s],!0,i),n!=="padding"&&(o+=p.css(e,"border"+V[s]+"Width",!0,i)));return o}function Gt(e,t,n){var r=!0,i=t==="width"?e.offsetWidth:e.offsetHeight,s=Ht(e),o=c.boxSizing()&&p.css(e,"boxSizing",!1,s)==="border-box";if(i<=0||i==null){i=Bt(e,t,s);if(i<0||i==null)i=e.style[t];if(Pt.test(i))return i;r=o&&(c.boxSizingReliable()||i===e.style[t]),i=parseFloat(i)||0}return i+Qt(e,t,n||(o?"border":"content"),r,s)+"px"}function Yt(e,t,n,r,i){return new Yt.prototype.init(e,t,n,r,i)}function un(){return setTimeout(function(){Zt=undefined}),Zt=p.now()}function an(e,t){var n,r={height:e},i=0;t=t?1:0;for(;i<4;i+=2-t)n=V[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}function fn(e,t,n){var r,i=(on[t]||[]).concat(on["*"]),s=0,o=i.length;for(;s<o;s++)if(r=i[s].call(n,t,e))return r}function ln(e,t,n){var r,i,s,o,u,a,f,l,h=this,d={},v=e.style,m=e.nodeType&&$(e),g=p._data(e,"fxshow");n.queue||(u=p._queueHooks(e,"fx"),u.unqueued==null&&(u.unqueued=0,a=u.empty.fire,u.empty.fire=function(){u.unqueued||a()}),u.unqueued++,h.always(function(){h.always(function(){u.unqueued--,p.queue(e,"fx").length||u.empty.fire()})})),e.nodeType===1&&("height"in t||"width"in t)&&(n.overflow=[v.overflow,v.overflowX,v.overflowY],f=p.css(e,"display"),l=_t(e.nodeName),f==="none"&&(f=l),f==="inline"&&p.css(e,"float")==="none"&&(!c.inlineBlockNeedsLayout||l==="inline"?v.display="inline-block":v.zoom=1)),n.overflow&&(v.overflow="hidden",c.shrinkWrapBlocks()||h.always(function(){v.overflow=n.overflow[0],v.overflowX=n.overflow[1],v.overflowY=n.overflow[2]}));for(r in t){i=t[r];if(tn.exec(i)){delete t[r],s=s||i==="toggle";if(i===(m?"hide":"show")){if(i!=="show"||!g||g[r]===undefined)continue;m=!0}d[r]=g&&g[r]||p.style(e,r)}}if(!p.isEmptyObject(d)){g?"hidden"in g&&(m=g.hidden):g=p._data(e,"fxshow",{}),s&&(g.hidden=!m),m?p(e).show():h.done(function(){p(e).hide()}),h.done(function(){var t;p._removeData(e,"fxshow");for(t in d)p.style(e,t,d[t])});for(r in d)o=fn(m?g[r]:0,r,h),r in g||(g[r]=o.start,m&&(o.end=o.start,o.start=r==="width"||r==="height"?1:0))}}function cn(e,t){var n,r,i,s,o;for(n in e){r=p.camelCase(n),i=t[r],s=e[n],p.isArray(s)&&(i=s[1],s=e[n]=s[0]),n!==r&&(e[r]=s,delete e[n]),o=p.cssHooks[r];if(o&&"expand"in o){s=o.expand(s),delete e[r];for(n in s)n in e||(e[n]=s[n],t[n]=i)}else t[r]=i}}function hn(e,t,n){var r,i,s=0,o=sn.length,u=p.Deferred().always(function(){delete a.elem}),a=function(){if(i)return!1;var t=Zt||un(),n=Math.max(0,f.startTime+f.duration-t),r=n/f.duration||0,s=1-r,o=0,a=f.tweens.length;for(;o<a;o++)f.tweens[o].run(s);return u.notifyWith(e,[f,s,n]),s<1&&a?n:(u.resolveWith(e,[f]),!1)},f=u.promise({elem:e,props:p.extend({},t),opts:p.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:Zt||un(),duration:n.duration,tweens:[],createTween:function(t,n){var r=p.Tween(e,f.opts,t,n,f.opts.specialEasing[t]||f.opts.easing);return f.tweens.push(r),r},stop:function(t){var n=0,r=t?f.tweens.length:0;if(i)return this;i=!0;for(;n<r;n++)f.tweens[n].run(1);return t?u.resolveWith(e,[f,t]):u.rejectWith(e,[f,t]),this}}),l=f.props;cn(l,f.opts.specialEasing);for(;s<o;s++){r=sn[s].call(f,e,l,f.opts);if(r)return r}return p.map(l,fn,f),p.isFunction(f.opts.start)&&f.opts.start.call(e,f),p.fx.timer(p.extend(a,{elem:e,anim:f,queue:f.opts.queue})),f.progress(f.opts.progress).done(f.opts.done,f.opts.complete).fail(f.opts.fail).always(f.opts.always)}function In(e){return function(t,n){typeof t!="string"&&(n=t,t="*");var r,i=0,s=t.toLowerCase().match(M)||[];if(p.isFunction(n))while(r=s[i++])r.charAt(0)==="+"?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function qn(e,t,n,r){function o(u){var a;return i[u]=!0,p.each(e[u]||[],function(e,u){var f=u(t,n,r);if(typeof f=="string"&&!s&&!i[f])return t.dataTypes.unshift(f),o(f),!1;if(s)return!(a=f)}),a}var i={},s=e===Bn;return o(t.dataTypes[0])||!i["*"]&&o("*")}function Rn(e,t){var n,r,i=p.ajaxSettings.flatOptions||{};for(r in t)t[r]!==undefined&&((i[r]?e:n||(n={}))[r]=t[r]);return n&&p.extend(!0,e,n),e}function Un(e,t,n){var r,i,s,o,u=e.contents,a=e.dataTypes;while(a[0]==="*")a.shift(),i===undefined&&(i=e.mimeType||t.getResponseHeader("Content-Type"));if(i)for(o in u)if(u[o]&&u[o].test(i)){a.unshift(o);break}if(a[0]in n)s=a[0];else{for(o in n){if(!a[0]||e.converters[o+" "+a[0]]){s=o;break}r||(r=o)}s=s||r}if(s)return s!==a[0]&&a.unshift(s),n[s]}function zn(e,t,n,r){var i,s,o,u,a,f={},l=e.dataTypes.slice();if(l[1])for(o in e.converters)f[o.toLowerCase()]=e.converters[o];s=l.shift();while(s){e.responseFields[s]&&(n[e.responseFields[s]]=t),!a&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),a=s,s=l.shift();if(s)if(s==="*")s=a;else if(a!=="*"&&a!==s){o=f[a+" "+s]||f["* "+s];if(!o)for(i in f){u=i.split(" ");if(u[1]===s){o=f[a+" "+u[0]]||f["* "+u[0]];if(o){o===!0?o=f[i]:f[i]!==!0&&(s=u[0],l.unshift(u[1]));break}}}if(o!==!0)if(o&&e["throws"])t=o(t);else try{t=o(t)}catch(c){return{state:"parsererror",error:o?c:"No conversion from "+a+" to "+s}}}}return{state:"success",data:t}}function Kn(e,t,n,r){var i;if(p.isArray(t))p.each(t,function(t,i){n||Xn.test(e)?r(e,i):Kn(e+"["+(typeof i=="object"?t:"")+"]",i,n,r)});else if(!n&&p.type(t)==="object")for(i in t)Kn(e+"["+i+"]",t[i],n,r);else r(e,t)}function Zn(){try{return new e.XMLHttpRequest}catch(t){}}function er(){try{return new e.ActiveXObject("Microsoft.XMLHTTP")}catch(t){}}function sr(e){return p.isWindow(e)?e:e.nodeType===9?e.defaultView||e.parentWindow:!1}var n=[],r=n.slice,i=n.concat,s=n.push,o=n.indexOf,u={},a=u.toString,f=u.hasOwnProperty,l="".trim,c={},h="1.11.0",p=function(e,t){return new p.fn.init(e,t)},d=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,v=/^-ms-/,m=/-([\da-z])/gi,g=function(e,t){return t.toUpperCase()};p.fn=p.prototype={jquery:h,constructor:p,selector:"",length:0,toArray:function(){return r.call(this)},get:function(e){return e!=null?e<0?this[e+this.length]:this[e]:r.call(this)},pushStack:function(e){var t=p.merge(this.constructor(),e);return t.prevObject=this,t.context=this.context,t},each:function(e,t){return p.each(this,e,t)},map:function(e){return this.pushStack(p.map(this,function(t,n){return e.call(t,n,t)}))},slice:function(){return this.pushStack(r.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(n>=0&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:s,sort:n.sort,splice:n.splice},p.extend=p.fn.extend=function(){var e,t,n,r,i,s,o=arguments[0]||{},u=1,a=arguments.length,f=!1;typeof o=="boolean"&&(f=o,o=arguments[u]||{},u++),typeof o!="object"&&!p.isFunction(o)&&(o={}),u===a&&(o=this,u--);for(;u<a;u++)if((i=arguments[u])!=null)for(r in i){e=o[r],n=i[r];if(o===n)continue;f&&n&&(p.isPlainObject(n)||(t=p.isArray(n)))?(t?(t=!1,s=e&&p.isArray(e)?e:[]):s=e&&p.isPlainObject(e)?e:{},o[r]=p.extend(f,s,n)):n!==undefined&&(o[r]=n)}return o},p.extend({expando:"jQuery"+(h+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isFunction:function(e){return p.type(e)==="function"},isArray:Array.isArray||function(e){return p.type(e)==="array"},isWindow:function(e){return e!=null&&e==e.window},isNumeric:function(e){return e-parseFloat(e)>=0},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},isPlainObject:function(e){var t;if(!e||p.type(e)!=="object"||e.nodeType||p.isWindow(e))return!1;try{if(e.constructor&&!f.call(e,"constructor")&&!f.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(n){return!1}if(c.ownLast)for(t in e)return f.call(e,t);for(t in e);return t===undefined||f.call(e,t)},type:function(e){return e==null?e+"":typeof e=="object"||typeof e=="function"?u[a.call(e)]||"object":typeof e},globalEval:function(t){t&&p.trim(t)&&(e.execScript||function(t){e.eval.call(e,t)})(t)},camelCase:function(e){return e.replace(v,"ms-").replace(m,g)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,t,n){var r,i=0,s=e.length,o=y(e);if(n)if(o)for(;i<s;i++){r=t.apply(e[i],n);if(r===!1)break}else for(i in e){r=t.apply(e[i],n);if(r===!1)break}else if(o)for(;i<s;i++){r=t.call(e[i],i,e[i]);if(r===!1)break}else for(i in e){r=t.call(e[i],i,e[i]);if(r===!1)break}return e},trim:l&&!l.call("")?function(e){return e==null?"":l.call(e)}:function(e){return e==null?"":(e+"").replace(d,"")},makeArray:function(e,t){var n=t||[];return e!=null&&(y(Object(e))?p.merge(n,typeof e=="string"?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){var r;if(t){if(o)return o.call(t,e,n);r=t.length,n=n?n<0?Math.max(0,r+n):n:0;for(;n<r;n++)if(n in t&&t[n]===e)return n}return-1},merge:function(e,t){var n=+t.length,r=0,i=e.length;while(r<n)e[i++]=t[r++];if(n!==n)while(t[r]!==undefined)e[i++]=t[r++];return e.length=i,e},grep:function(e,t,n){var r,i=[],s=0,o=e.length,u=!n;for(;s<o;s++)r=!t(e[s],s),r!==u&&i.push(e[s]);return i},map:function(e,t,n){var r,s=0,o=e.length,u=y(e),a=[];if(u)for(;s<o;s++)r=t(e[s],s,n),r!=null&&a.push(r);else for(s in e)r=t(e[s],s,n),r!=null&&a.push(r);return i.apply([],a)},guid:1,proxy:function(e,t){var n,i,s;return typeof t=="string"&&(s=e[t],t=e,e=s),p.isFunction(e)?(n=r.call(arguments,2),i=function(){return e.apply(t||this,n.concat(r.call(arguments)))},i.guid=e.guid=e.guid||p.guid++,i):undefined},now:function(){return+(new Date)},support:c}),p.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(e,t){u["[object "+t+"]"]=t.toLowerCase()});var b=function(e){function rt(e,t,r,i){var s,o,u,a,f,h,v,m,w,E;(t?t.ownerDocument||t:b)!==c&&l(t),t=t||c,r=r||[];if(!e||typeof e!="string")return r;if((a=t.nodeType)!==1&&a!==9)return[];if(p&&!i){if(s=G.exec(e))if(u=s[1]){if(a===9){o=t.getElementById(u);if(!o||!o.parentNode)return r;if(o.id===u)return r.push(o),r}else if(t.ownerDocument&&(o=t.ownerDocument.getElementById(u))&&g(t,o)&&o.id===u)return r.push(o),r}else{if(s[2])return _.apply(r,t.getElementsByTagName(e)),r;if((u=s[3])&&n.getElementsByClassName&&t.getElementsByClassName)return _.apply(r,t.getElementsByClassName(u)),r}if(n.qsa&&(!d||!d.test(e))){m=v=y,w=t,E=a===9&&e;if(a===1&&t.nodeName.toLowerCase()!=="object"){h=dt(e),(v=t.getAttribute("id"))?m=v.replace(Z,"\\$&"):t.setAttribute("id",m),m="[id='"+m+"'] ",f=h.length;while(f--)h[f]=m+vt(h[f]);w=Y.test(e)&&ht(t.parentNode)||t,E=h.join(",")}if(E)try{return _.apply(r,w.querySelectorAll(E)),r}catch(S){}finally{v||t.removeAttribute("id")}}}return xt(e.replace(R,"$1"),t,r,i)}function it(){function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}var e=[];return t}function st(e){return e[y]=!0,e}function ot(e){var t=c.createElement("div");try{return!!e(t)}catch(n){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function ut(e,t){var n=e.split("|"),i=e.length;while(i--)r.attrHandle[n[i]]=t}function at(e,t){var n=t&&e,r=n&&e.nodeType===1&&t.nodeType===1&&(~t.sourceIndex||k)-(~e.sourceIndex||k);if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function ft(e){return function(t){var n=t.nodeName.toLowerCase();return n==="input"&&t.type===e}}function lt(e){return function(t){var n=t.nodeName.toLowerCase();return(n==="input"||n==="button")&&t.type===e}}function ct(e){return st(function(t){return t=+t,st(function(n,r){var i,s=e([],n.length,t),o=s.length;while(o--)n[i=s[o]]&&(n[i]=!(r[i]=n[i]))})})}function ht(e){return e&&typeof e.getElementsByTagName!==C&&e}function pt(){}function dt(e,t){var n,i,s,o,u,a,f,l=x[e+" "];if(l)return t?0:l.slice(0);u=e,a=[],f=r.preFilter;while(u){if(!n||(i=U.exec(u)))i&&(u=u.slice(i[0].length)||u),a.push(s=[]);n=!1;if(i=z.exec(u))n=i.shift(),s.push({value:n,type:i[0].replace(R," ")}),u=u.slice(n.length);for(o in r.filter)(i=$[o].exec(u))&&(!f[o]||(i=f[o](i)))&&(n=i.shift(),s.push({value:n,type:o,matches:i}),u=u.slice(n.length));if(!n)break}return t?u.length:u?rt.error(e):x(e,a).slice(0)}function vt(e){var t=0,n=e.length,r="";for(;t<n;t++)r+=e[t].value;return r}function mt(e,t,n){var r=t.dir,i=n&&r==="parentNode",s=E++;return t.first?function(t,n,s){while(t=t[r])if(t.nodeType===1||i)return e(t,n,s)}:function(t,n,o){var u,a,f=[w,s];if(o){while(t=t[r])if(t.nodeType===1||i)if(e(t,n,o))return!0}else while(t=t[r])if(t.nodeType===1||i){a=t[y]||(t[y]={});if((u=a[r])&&u[0]===w&&u[1]===s)return f[2]=u[2];a[r]=f;if(f[2]=e(t,n,o))return!0}}}function gt(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function yt(e,t,n,r,i){var s,o=[],u=0,a=e.length,f=t!=null;for(;u<a;u++)if(s=e[u])if(!n||n(s,r,i))o.push(s),f&&t.push(u);return o}function bt(e,t,n,r,i,s){return r&&!r[y]&&(r=bt(r)),i&&!i[y]&&(i=bt(i,s)),st(function(s,o,u,a){var f,l,c,h=[],p=[],d=o.length,v=s||St(t||"*",u.nodeType?[u]:u,[]),m=e&&(s||!t)?yt(v,h,e,u,a):v,g=n?i||(s?e:d||r)?[]:o:m;n&&n(m,g,u,a);if(r){f=yt(g,p),r(f,[],u,a),l=f.length;while(l--)if(c=f[l])g[p[l]]=!(m[p[l]]=c)}if(s){if(i||e){if(i){f=[],l=g.length;while(l--)(c=g[l])&&f.push(m[l]=c);i(null,g=[],f,a)}l=g.length;while(l--)(c=g[l])&&(f=i?P.call(s,c):h[l])>-1&&(s[f]=!(o[f]=c))}}else g=yt(g===o?g.splice(d,g.length):g),i?i(null,o,g,a):_.apply(o,g)})}function wt(e){var t,n,i,s=e.length,o=r.relative[e[0].type],a=o||r.relative[" "],f=o?1:0,l=mt(function(e){return e===t},a,!0),c=mt(function(e){return P.call(t,e)>-1},a,!0),h=[function(e,n,r){return!o&&(r||n!==u)||((t=n).nodeType?l(e,n,r):c(e,n,r))}];for(;f<s;f++)if(n=r.relative[e[f].type])h=[mt(gt(h),n)];else{n=r.filter[e[f].type].apply(null,e[f].matches);if(n[y]){i=++f;for(;i<s;i++)if(r.relative[e[i].type])break;return bt(f>1&&gt(h),f>1&&vt(e.slice(0,f-1).concat({value:e[f-2].type===" "?"*":""})).replace(R,"$1"),n,f<i&&wt(e.slice(f,i)),i<s&&wt(e=e.slice(i)),i<s&&vt(e))}h.push(n)}return gt(h)}function Et(e,t){var n=t.length>0,i=e.length>0,s=function(s,o,a,f,l){var h,p,d,v=0,m="0",g=s&&[],y=[],b=u,E=s||i&&r.find.TAG("*",l),S=w+=b==null?1:Math.random()||.1,x=E.length;l&&(u=o!==c&&o);for(;m!==x&&(h=E[m])!=null;m++){if(i&&h){p=0;while(d=e[p++])if(d(h,o,a)){f.push(h);break}l&&(w=S)}n&&((h=!d&&h)&&v--,s&&g.push(h))}v+=m;if(n&&m!==v){p=0;while(d=t[p++])d(g,y,o,a);if(s){if(v>0)while(m--)!g[m]&&!y[m]&&(y[m]=O.call(f));y=yt(y)}_.apply(f,y),l&&!s&&y.length>0&&v+t.length>1&&rt.uniqueSort(f)}return l&&(w=S,u=b),g};return n?st(s):s}function St(e,t,n){var r=0,i=t.length;for(;r<i;r++)rt(e,t[r],n);return n}function xt(e,t,i,s){var u,a,f,l,c,h=dt(e);if(!s&&h.length===1){a=h[0]=h[0].slice(0);if(a.length>2&&(f=a[0]).type==="ID"&&n.getById&&t.nodeType===9&&p&&r.relative[a[1].type]){t=(r.find.ID(f.matches[0].replace(et,tt),t)||[])[0];if(!t)return i;e=e.slice(a.shift().value.length)}u=$.needsContext.test(e)?0:a.length;while(u--){f=a[u];if(r.relative[l=f.type])break;if(c=r.find[l])if(s=c(f.matches[0].replace(et,tt),Y.test(a[0].type)&&ht(t.parentNode)||t)){a.splice(u,1),e=s.length&&vt(a);if(!e)return _.apply(i,s),i;break}}}return o(e,h)(s,t,!p,i,Y.test(e)&&ht(t.parentNode)||t),i}var t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y="sizzle"+ -(new Date),b=e.document,w=0,E=0,S=it(),x=it(),T=it(),N=function(e,t){return e===t&&(f=!0),0},C=typeof undefined,k=1<<31,L={}.hasOwnProperty,A=[],O=A.pop,M=A.push,_=A.push,D=A.slice,P=A.indexOf||function(e){var t=0,n=this.length;for(;t<n;t++)if(this[t]===e)return t;return-1},H="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",B="[\\x20\\t\\r\\n\\f]",j="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",F=j.replace("w","w#"),I="\\["+B+"*("+j+")"+B+"*(?:([*^$|!~]?=)"+B+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+F+")|)|)"+B+"*\\]",q=":("+j+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+I.replace(3,8)+")*)|.*)\\)|)",R=new RegExp("^"+B+"+|((?:^|[^\\\\])(?:\\\\.)*)"+B+"+$","g"),U=new RegExp("^"+B+"*,"+B+"*"),z=new RegExp("^"+B+"*([>+~]|"+B+")"+B+"*"),W=new RegExp("="+B+"*([^\\]'\"]*?)"+B+"*\\]","g"),X=new RegExp(q),V=new RegExp("^"+F+"$"),$={ID:new RegExp("^#("+j+")"),CLASS:new RegExp("^\\.("+j+")"),TAG:new RegExp("^("+j.replace("w","w*")+")"),ATTR:new RegExp("^"+I),PSEUDO:new RegExp("^"+q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+B+"*(even|odd|(([+-]|)(\\d*)n|)"+B+"*(?:([+-]|)"+B+"*(\\d+)|))"+B+"*\\)|)","i"),bool:new RegExp("^(?:"+H+")$","i"),needsContext:new RegExp("^"+B+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+B+"*((?:-\\d)?\\d*)"+B+"*\\)|)(?=[^-]|$)","i")},J=/^(?:input|select|textarea|button)$/i,K=/^h\d$/i,Q=/^[^{]+\{\s*\[native \w/,G=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,Y=/[+~]/,Z=/'|\\/g,et=new RegExp("\\\\([\\da-f]{1,6}"+B+"?|("+B+")|.)","ig"),tt=function(e,t,n){var r="0x"+t-65536;return r!==r||n?t:r<0?String.fromCharCode(r+65536):String.fromCharCode(r>>10|55296,r&1023|56320)};try{_.apply(A=D.call(b.childNodes),b.childNodes),A[b.childNodes.length].nodeType}catch(nt){_={apply:A.length?function(e,t){M.apply(e,D.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}n=rt.support={},s=rt.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?t.nodeName!=="HTML":!1},l=rt.setDocument=function(e){var t,i=e?e.ownerDocument||e:b,o=i.defaultView;if(i===c||i.nodeType!==9||!i.documentElement)return c;c=i,h=i.documentElement,p=!s(i),o&&o!==o.top&&(o.addEventListener?o.addEventListener("unload",function(){l()},!1):o.attachEvent&&o.attachEvent("onunload",function(){l()})),n.attributes=ot(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=ot(function(e){return e.appendChild(i.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Q.test(i.getElementsByClassName)&&ot(function(e){return e.innerHTML="<div class='a'></div><div class='a i'></div>",e.firstChild.className="i",e.getElementsByClassName("i").length===2}),n.getById=ot(function(e){return h.appendChild(e).id=y,!i.getElementsByName||!i.getElementsByName(y).length}),n.getById?(r.find.ID=function(e,t){if(typeof t.getElementById!==C&&p){var n=t.getElementById(e);return n&&n.parentNode?[n]:[]}},r.filter.ID=function(e){var t=e.replace(et,tt);return function(e){return e.getAttribute("id")===t}}):(delete r.find.ID,r.filter.ID=function(e){var t=e.replace(et,tt);return function(e){var n=typeof e.getAttributeNode!==C&&e.getAttributeNode("id");return n&&n.value===t}}),r.find.TAG=n.getElementsByTagName?function(e,t){if(typeof t.getElementsByTagName!==C)return t.getElementsByTagName(e)}:function(e,t){var n,r=[],i=0,s=t.getElementsByTagName(e);if(e==="*"){while(n=s[i++])n.nodeType===1&&r.push(n);return r}return s},r.find.CLASS=n.getElementsByClassName&&function(e,t){if(typeof t.getElementsByClassName!==C&&p)return t.getElementsByClassName(e)},v=[],d=[];if(n.qsa=Q.test(i.querySelectorAll))ot(function(e){e.innerHTML="<select t=''><option selected=''></option></select>",e.querySelectorAll("[t^='']").length&&d.push("[*^$]="+B+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||d.push("\\["+B+"*(?:value|"+H+")"),e.querySelectorAll(":checked").length||d.push(":checked")}),ot(function(e){var t=i.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&d.push("name"+B+"*[*^$|!~]?="),e.querySelectorAll(":enabled").length||d.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),d.push(",.*:")});return(n.matchesSelector=Q.test(m=h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&ot(function(e){n.disconnectedMatch=m.call(e,"div"),m.call(e,"[s!='']:x"),v.push("!=",q)}),d=d.length&&new RegExp(d.join("|")),v=v.length&&new RegExp(v.join("|")),t=Q.test(h.compareDocumentPosition),g=t||Q.test(h.contains)?function(e,t){var n=e.nodeType===9?e.documentElement:e,r=t&&t.parentNode;return e===r||!!r&&r.nodeType===1&&!!(n.contains?n.contains(r):e.compareDocumentPosition&&e.compareDocumentPosition(r)&16)}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},N=t?function(e,t){if(e===t)return f=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r?r:(r=(e.ownerDocument||e)===(t.ownerDocument||t)?e.compareDocumentPosition(t):1,r&1||!n.sortDetached&&t.compareDocumentPosition(e)===r?e===i||e.ownerDocument===b&&g(b,e)?-1:t===i||t.ownerDocument===b&&g(b,t)?1:a?P.call(a,e)-P.call(a,t):0:r&4?-1:1)}:function(e,t){if(e===t)return f=!0,0;var n,r=0,s=e.parentNode,o=t.parentNode,u=[e],l=[t];if(!s||!o)return e===i?-1:t===i?1:s?-1:o?1:a?P.call(a,e)-P.call(a,t):0;if(s===o)return at(e,t);n=e;while(n=n.parentNode)u.unshift(n);n=t;while(n=n.parentNode)l.unshift(n);while(u[r]===l[r])r++;return r?at(u[r],l[r]):u[r]===b?-1:l[r]===b?1:0},i},rt.matches=function(e,t){return rt(e,null,null,t)},rt.matchesSelector=function(e,t){(e.ownerDocument||e)!==c&&l(e),t=t.replace(W,"='$1']");if(n.matchesSelector&&p&&(!v||!v.test(t))&&(!d||!d.test(t)))try{var r=m.call(e,t);if(r||n.disconnectedMatch||e.document&&e.document.nodeType!==11)return r}catch(i){}return rt(t,c,null,[e]).length>0},rt.contains=function(e,t){return(e.ownerDocument||e)!==c&&l(e),g(e,t)},rt.attr=function(e,t){(e.ownerDocument||e)!==c&&l(e);var i=r.attrHandle[t.toLowerCase()],s=i&&L.call(r.attrHandle,t.toLowerCase())?i(e,t,!p):undefined;return s!==undefined?s:n.attributes||!p?e.getAttribute(t):(s=e.getAttributeNode(t))&&s.specified?s.value:null},rt.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},rt.uniqueSort=function(e){var t,r=[],i=0,s=0;f=!n.detectDuplicates,a=!n.sortStable&&e.slice(0),e.sort(N);if(f){while(t=e[s++])t===e[s]&&(i=r.push(s));while(i--)e.splice(r[i],1)}return a=null,e},i=rt.getText=function(e){var t,n="",r=0,s=e.nodeType;if(!s)while(t=e[r++])n+=i(t);else if(s===1||s===9||s===11){if(typeof e.textContent=="string")return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e)}else if(s===3||s===4)return e.nodeValue;return n},r=rt.selectors={cacheLength:50,createPseudo:st,match:$,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(et,tt),e[3]=(e[4]||e[5]||"").replace(et,tt),e[2]==="~="&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),e[1].slice(0,3)==="nth"?(e[3]||rt.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*(e[3]==="even"||e[3]==="odd")),e[5]=+(e[7]+e[8]||e[3]==="odd")):e[3]&&rt.error(e[0]),e},PSEUDO:function(e){var t,n=!e[5]&&e[2];return $.CHILD.test(e[0])?null:(e[3]&&e[4]!==undefined?e[2]=e[4]:n&&X.test(n)&&(t=dt(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(et,tt).toLowerCase();return e==="*"?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=S[e+" "];return t||(t=new RegExp("(^|"+B+")"+e+"("+B+"|$)"))&&S(e,function(e){return t.test(typeof e.className=="string"&&e.className||typeof e.getAttribute!==C&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=rt.attr(r,e);return i==null?t==="!=":t?(i+="",t==="="?i===n:t==="!="?i!==n:t==="^="?n&&i.indexOf(n)===0:t==="*="?n&&i.indexOf(n)>-1:t==="$="?n&&i.slice(-n.length)===n:t==="~="?(" "+i+" ").indexOf(n)>-1:t==="|="?i===n||i.slice(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r,i){var s=e.slice(0,3)!=="nth",o=e.slice(-4)!=="last",u=t==="of-type";return r===1&&i===0?function(e){return!!e.parentNode}:function(t,n,a){var f,l,c,h,p,d,v=s!==o?"nextSibling":"previousSibling",m=t.parentNode,g=u&&t.nodeName.toLowerCase(),b=!a&&!u;if(m){if(s){while(v){c=t;while(c=c[v])if(u?c.nodeName.toLowerCase()===g:c.nodeType===1)return!1;d=v=e==="only"&&!d&&"nextSibling"}return!0}d=[o?m.firstChild:m.lastChild];if(o&&b){l=m[y]||(m[y]={}),f=l[e]||[],p=f[0]===w&&f[1],h=f[0]===w&&f[2],c=p&&m.childNodes[p];while(c=++p&&c&&c[v]||(h=p=0)||d.pop())if(c.nodeType===1&&++h&&c===t){l[e]=[w,p,h];break}}else if(b&&(f=(t[y]||(t[y]={}))[e])&&f[0]===w)h=f[1];else while(c=++p&&c&&c[v]||(h=p=0)||d.pop())if((u?c.nodeName.toLowerCase()===g:c.nodeType===1)&&++h){b&&((c[y]||(c[y]={}))[e]=[w,h]);if(c===t)break}return h-=i,h===r||h%r===0&&h/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||rt.error("unsupported pseudo: "+e);return i[y]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?st(function(e,n){var r,s=i(e,t),o=s.length;while(o--)r=P.call(e,s[o]),e[r]=!(n[r]=s[o])}):function(e){return i(e,0,n)}):i}},pseudos:{not:st(function(e){var t=[],n=[],r=o(e.replace(R,"$1"));return r[y]?st(function(e,t,n,i){var s,o=r(e,null,i,[]),u=e.length;while(u--)if(s=o[u])e[u]=!(t[u]=s)}):function(e,i,s){return t[0]=e,r(t,null,s,n),!n.pop()}}),has:st(function(e){return function(t){return rt(e,t).length>0}}),contains:st(function(e){return function(t){return(t.textContent||t.innerText||i(t)).indexOf(e)>-1}}),lang:st(function(e){return V.test(e||"")||rt.error("unsupported lang: "+e),e=e.replace(et,tt).toLowerCase(),function(t){var n;do if(n=p?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return n=n.toLowerCase(),n===e||n.indexOf(e+"-")===0;while((t=t.parentNode)&&t.nodeType===1);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===c.activeElement&&(!c.hasFocus||c.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return t==="input"&&!!e.checked||t==="option"&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!r.pseudos.empty(e)},header:function(e){return K.test(e.nodeName)},input:function(e){return J.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return t==="input"&&e.type==="button"||t==="button"},text:function(e){var t;return e.nodeName.toLowerCase()==="input"&&e.type==="text"&&((t=e.getAttribute("type"))==null||t.toLowerCase()==="text")},first:ct(function(){return[0]}),last:ct(function(e,t){return[t-1]}),eq:ct(function(e,t,n){return[n<0?n+t:n]}),even:ct(function(e,t){var n=0;for(;n<t;n+=2)e.push(n);return e}),odd:ct(function(e,t){var n=1;for(;n<t;n+=2)e.push(n);return e}),lt:ct(function(e,t,n){var r=n<0?n+t:n;for(;--r>=0;)e.push(r);return e}),gt:ct(function(e,t,n){var r=n<0?n+t:n;for(;++r<t;)e.push(r);return e})}},r
.pseudos.nth=r.pseudos.eq;for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=ft(t);for(t in{submit:!0,reset:!0})r.pseudos[t]=lt(t);return pt.prototype=r.filters=r.pseudos,r.setFilters=new pt,o=rt.compile=function(e,t){var n,r=[],i=[],s=T[e+" "];if(!s){t||(t=dt(e)),n=t.length;while(n--)s=wt(t[n]),s[y]?r.push(s):i.push(s);s=T(e,Et(i,r))}return s},n.sortStable=y.split("").sort(N).join("")===y,n.detectDuplicates=!!f,l(),n.sortDetached=ot(function(e){return e.compareDocumentPosition(c.createElement("div"))&1}),ot(function(e){return e.innerHTML="<a href='#'></a>",e.firstChild.getAttribute("href")==="#"})||ut("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,t.toLowerCase()==="type"?1:2)}),(!n.attributes||!ot(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),e.firstChild.getAttribute("value")===""}))&&ut("value",function(e,t,n){if(!n&&e.nodeName.toLowerCase()==="input")return e.defaultValue}),ot(function(e){return e.getAttribute("disabled")==null})||ut(H,function(e,t,n){var r;if(!n)return e[t]===!0?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null}),rt}(e);p.find=b,p.expr=b.selectors,p.expr[":"]=p.expr.pseudos,p.unique=b.uniqueSort,p.text=b.getText,p.isXMLDoc=b.isXML,p.contains=b.contains;var w=p.expr.match.needsContext,E=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,S=/^.[^:#\[\.,]*$/;p.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),t.length===1&&r.nodeType===1?p.find.matchesSelector(r,e)?[r]:[]:p.find.matches(e,p.grep(t,function(e){return e.nodeType===1}))},p.fn.extend({find:function(e){var t,n=[],r=this,i=r.length;if(typeof e!="string")return this.pushStack(p(e).filter(function(){for(t=0;t<i;t++)if(p.contains(r[t],this))return!0}));for(t=0;t<i;t++)p.find(e,r[t],n);return n=this.pushStack(i>1?p.unique(n):n),n.selector=this.selector?this.selector+" "+e:e,n},filter:function(e){return this.pushStack(x(this,e||[],!1))},not:function(e){return this.pushStack(x(this,e||[],!0))},is:function(e){return!!x(this,typeof e=="string"&&w.test(e)?p(e):e||[],!1).length}});var T,N=e.document,C=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,k=p.fn.init=function(e,t){var n,r;if(!e)return this;if(typeof e=="string"){e.charAt(0)==="<"&&e.charAt(e.length-1)===">"&&e.length>=3?n=[null,e,null]:n=C.exec(e);if(n&&(n[1]||!t)){if(n[1]){t=t instanceof p?t[0]:t,p.merge(this,p.parseHTML(n[1],t&&t.nodeType?t.ownerDocument||t:N,!0));if(E.test(n[1])&&p.isPlainObject(t))for(n in t)p.isFunction(this[n])?this[n](t[n]):this.attr(n,t[n]);return this}r=N.getElementById(n[2]);if(r&&r.parentNode){if(r.id!==n[2])return T.find(e);this.length=1,this[0]=r}return this.context=N,this.selector=e,this}return!t||t.jquery?(t||T).find(e):this.constructor(t).find(e)}return e.nodeType?(this.context=this[0]=e,this.length=1,this):p.isFunction(e)?typeof T.ready!="undefined"?T.ready(e):e(p):(e.selector!==undefined&&(this.selector=e.selector,this.context=e.context),p.makeArray(e,this))};k.prototype=p.fn,T=p(N);var L=/^(?:parents|prev(?:Until|All))/,A={children:!0,contents:!0,next:!0,prev:!0};p.extend({dir:function(e,t,n){var r=[],i=e[t];while(i&&i.nodeType!==9&&(n===undefined||i.nodeType!==1||!p(i).is(n)))i.nodeType===1&&r.push(i),i=i[t];return r},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)e.nodeType===1&&e!==t&&n.push(e);return n}}),p.fn.extend({has:function(e){var t,n=p(e,this),r=n.length;return this.filter(function(){for(t=0;t<r;t++)if(p.contains(this,n[t]))return!0})},closest:function(e,t){var n,r=0,i=this.length,s=[],o=w.test(e)||typeof e!="string"?p(e,t||this.context):0;for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(o?o.index(n)>-1:n.nodeType===1&&p.find.matchesSelector(n,e))){s.push(n);break}return this.pushStack(s.length>1?p.unique(s):s)},index:function(e){return e?typeof e=="string"?p.inArray(this[0],p(e)):p.inArray(e.jquery?e[0]:e,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(p.unique(p.merge(this.get(),p(e,t))))},addBack:function(e){return this.add(e==null?this.prevObject:this.prevObject.filter(e))}}),p.each({parent:function(e){var t=e.parentNode;return t&&t.nodeType!==11?t:null},parents:function(e){return p.dir(e,"parentNode")},parentsUntil:function(e,t,n){return p.dir(e,"parentNode",n)},next:function(e){return O(e,"nextSibling")},prev:function(e){return O(e,"previousSibling")},nextAll:function(e){return p.dir(e,"nextSibling")},prevAll:function(e){return p.dir(e,"previousSibling")},nextUntil:function(e,t,n){return p.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return p.dir(e,"previousSibling",n)},siblings:function(e){return p.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return p.sibling(e.firstChild)},contents:function(e){return p.nodeName(e,"iframe")?e.contentDocument||e.contentWindow.document:p.merge([],e.childNodes)}},function(e,t){p.fn[e]=function(n,r){var i=p.map(this,t,n);return e.slice(-5)!=="Until"&&(r=n),r&&typeof r=="string"&&(i=p.filter(r,i)),this.length>1&&(A[e]||(i=p.unique(i)),L.test(e)&&(i=i.reverse())),this.pushStack(i)}});var M=/\S+/g,_={};p.Callbacks=function(e){e=typeof e=="string"?_[e]||D(e):p.extend({},e);var t,n,r,i,s,o,u=[],a=!e.once&&[],f=function(c){n=e.memory&&c,r=!0,s=o||0,o=0,i=u.length,t=!0;for(;u&&s<i;s++)if(u[s].apply(c[0],c[1])===!1&&e.stopOnFalse){n=!1;break}t=!1,u&&(a?a.length&&f(a.shift()):n?u=[]:l.disable())},l={add:function(){if(u){var r=u.length;(function s(t){p.each(t,function(t,n){var r=p.type(n);r==="function"?(!e.unique||!l.has(n))&&u.push(n):n&&n.length&&r!=="string"&&s(n)})})(arguments),t?i=u.length:n&&(o=r,f(n))}return this},remove:function(){return u&&p.each(arguments,function(e,n){var r;while((r=p.inArray(n,u,r))>-1)u.splice(r,1),t&&(r<=i&&i--,r<=s&&s--)}),this},has:function(e){return e?p.inArray(e,u)>-1:!!u&&!!u.length},empty:function(){return u=[],i=0,this},disable:function(){return u=a=n=undefined,this},disabled:function(){return!u},lock:function(){return a=undefined,n||l.disable(),this},locked:function(){return!a},fireWith:function(e,n){return u&&(!r||a)&&(n=n||[],n=[e,n.slice?n.slice():n],t?a.push(n):f(n)),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!r}};return l},p.extend({Deferred:function(e){var t=[["resolve","done",p.Callbacks("once memory"),"resolved"],["reject","fail",p.Callbacks("once memory"),"rejected"],["notify","progress",p.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return p.Deferred(function(n){p.each(t,function(t,s){var o=p.isFunction(e[t])&&e[t];i[s[1]](function(){var e=o&&o.apply(this,arguments);e&&p.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[s[0]+"With"](this===r?n.promise():this,o?[e]:arguments)})}),e=null}).promise()},promise:function(e){return e!=null?p.extend(e,r):r}},i={};return r.pipe=r.then,p.each(t,function(e,s){var o=s[2],u=s[3];r[s[1]]=o.add,u&&o.add(function(){n=u},t[e^1][2].disable,t[2][2].lock),i[s[0]]=function(){return i[s[0]+"With"](this===i?r:this,arguments),this},i[s[0]+"With"]=o.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=r.call(arguments),i=n.length,s=i!==1||e&&p.isFunction(e.promise)?i:0,o=s===1?e:p.Deferred(),u=function(e,t,n){return function(i){t[e]=this,n[e]=arguments.length>1?r.call(arguments):i,n===a?o.notifyWith(t,n):--s||o.resolveWith(t,n)}},a,f,l;if(i>1){a=new Array(i),f=new Array(i),l=new Array(i);for(;t<i;t++)n[t]&&p.isFunction(n[t].promise)?n[t].promise().done(u(t,l,n)).fail(o.reject).progress(u(t,f,a)):--s}return s||o.resolveWith(l,n),o.promise()}});var P;p.fn.ready=function(e){return p.ready.promise().done(e),this},p.extend({isReady:!1,readyWait:1,holdReady:function(e){e?p.readyWait++:p.ready(!0)},ready:function(e){if(e===!0?--p.readyWait:p.isReady)return;if(!N.body)return setTimeout(p.ready);p.isReady=!0;if(e!==!0&&--p.readyWait>0)return;P.resolveWith(N,[p]),p.fn.trigger&&p(N).trigger("ready").off("ready")}}),p.ready.promise=function(t){if(!P){P=p.Deferred();if(N.readyState==="complete")setTimeout(p.ready);else if(N.addEventListener)N.addEventListener("DOMContentLoaded",B,!1),e.addEventListener("load",B,!1);else{N.attachEvent("onreadystatechange",B),e.attachEvent("onload",B);var n=!1;try{n=e.frameElement==null&&N.documentElement}catch(r){}n&&n.doScroll&&function i(){if(!p.isReady){try{n.doScroll("left")}catch(e){return setTimeout(i,50)}H(),p.ready()}}()}}return P.promise(t)};var j=typeof undefined,F;for(F in p(c))break;c.ownLast=F!=="0",c.inlineBlockNeedsLayout=!1,p(function(){var e,t,n=N.getElementsByTagName("body")[0];if(!n)return;e=N.createElement("div"),e.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",t=N.createElement("div"),n.appendChild(e).appendChild(t);if(typeof t.style.zoom!==j){t.style.cssText="border:0;margin:0;width:1px;padding:1px;display:inline;zoom:1";if(c.inlineBlockNeedsLayout=t.offsetWidth===3)n.style.zoom=1}n.removeChild(e),e=t=null}),function(){var e=N.createElement("div");if(c.deleteExpando==null){c.deleteExpando=!0;try{delete e.test}catch(t){c.deleteExpando=!1}}e=null}(),p.acceptData=function(e){var t=p.noData[(e.nodeName+" ").toLowerCase()],n=+e.nodeType||1;return n!==1&&n!==9?!1:!t||t!==!0&&e.getAttribute("classid")===t};var I=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,q=/([A-Z])/g;p.extend({cache:{},noData:{"applet ":!0,"embed ":!0,"object ":"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"},hasData:function(e){return e=e.nodeType?p.cache[e[p.expando]]:e[p.expando],!!e&&!U(e)},data:function(e,t,n){return z(e,t,n)},removeData:function(e,t){return W(e,t)},_data:function(e,t,n){return z(e,t,n,!0)},_removeData:function(e,t){return W(e,t,!0)}}),p.fn.extend({data:function(e,t){var n,r,i,s=this[0],o=s&&s.attributes;if(e===undefined){if(this.length){i=p.data(s);if(s.nodeType===1&&!p._data(s,"parsedAttrs")){n=o.length;while(n--)r=o[n].name,r.indexOf("data-")===0&&(r=p.camelCase(r.slice(5)),R(s,r,i[r]));p._data(s,"parsedAttrs",!0)}}return i}return typeof e=="object"?this.each(function(){p.data(this,e)}):arguments.length>1?this.each(function(){p.data(this,e,t)}):s?R(s,e,p.data(s,e)):undefined},removeData:function(e){return this.each(function(){p.removeData(this,e)})}}),p.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=p._data(e,t),n&&(!r||p.isArray(n)?r=p._data(e,t,p.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=p.queue(e,t),r=n.length,i=n.shift(),s=p._queueHooks(e,t),o=function(){p.dequeue(e,t)};i==="inprogress"&&(i=n.shift(),r--),i&&(t==="fx"&&n.unshift("inprogress"),delete s.stop,i.call(e,o,s)),!r&&s&&s.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return p._data(e,n)||p._data(e,n,{empty:p.Callbacks("once memory").add(function(){p._removeData(e,t+"queue"),p._removeData(e,n)})})}}),p.fn.extend({queue:function(e,t){var n=2;return typeof e!="string"&&(t=e,e="fx",n--),arguments.length<n?p.queue(this[0],e):t===undefined?this:this.each(function(){var n=p.queue(this,e,t);p._queueHooks(this,e),e==="fx"&&n[0]!=="inprogress"&&p.dequeue(this,e)})},dequeue:function(e){return this.each(function(){p.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=p.Deferred(),s=this,o=this.length,u=function(){--r||i.resolveWith(s,[s])};typeof e!="string"&&(t=e,e=undefined),e=e||"fx";while(o--)n=p._data(s[o],e+"queueHooks"),n&&n.empty&&(r++,n.empty.add(u));return u(),i.promise(t)}});var X=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,V=["Top","Right","Bottom","Left"],$=function(e,t){return e=t||e,p.css(e,"display")==="none"||!p.contains(e.ownerDocument,e)},J=p.access=function(e,t,n,r,i,s,o){var u=0,a=e.length,f=n==null;if(p.type(n)==="object"){i=!0;for(u in n)p.access(e,t,u,n[u],!0,s,o)}else if(r!==undefined){i=!0,p.isFunction(r)||(o=!0),f&&(o?(t.call(e,r),t=null):(f=t,t=function(e,t,n){return f.call(p(e),n)}));if(t)for(;u<a;u++)t(e[u],n,o?r:r.call(e[u],u,t(e[u],n)))}return i?e:f?t.call(e):a?t(e[0],n):s},K=/^(?:checkbox|radio)$/i;(function(){var e=N.createDocumentFragment(),t=N.createElement("div"),n=N.createElement("input");t.setAttribute("className","t"),t.innerHTML="  <link/><table></table><a href='/a'>a</a>",c.leadingWhitespace=t.firstChild.nodeType===3,c.tbody=!t.getElementsByTagName("tbody").length,c.htmlSerialize=!!t.getElementsByTagName("link").length,c.html5Clone=N.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",n.type="checkbox",n.checked=!0,e.appendChild(n),c.appendChecked=n.checked,t.innerHTML="<textarea>x</textarea>",c.noCloneChecked=!!t.cloneNode(!0).lastChild.defaultValue,e.appendChild(t),t.innerHTML="<input type='radio' checked='checked' name='t'/>",c.checkClone=t.cloneNode(!0).cloneNode(!0).lastChild.checked,c.noCloneEvent=!0,t.attachEvent&&(t.attachEvent("onclick",function(){c.noCloneEvent=!1}),t.cloneNode(!0).click());if(c.deleteExpando==null){c.deleteExpando=!0;try{delete t.test}catch(r){c.deleteExpando=!1}}e=t=n=null})(),function(){var t,n,r=N.createElement("div");for(t in{submit:!0,change:!0,focusin:!0})n="on"+t,(c[t+"Bubbles"]=n in e)||(r.setAttribute(n,"t"),c[t+"Bubbles"]=r.attributes[n].expando===!1);r=null}();var Q=/^(?:input|select|textarea)$/i,G=/^key/,Y=/^(?:mouse|contextmenu)|click/,Z=/^(?:focusinfocus|focusoutblur)$/,et=/^([^.]*)(?:\.(.+)|)$/;p.event={global:{},add:function(e,t,n,r,i){var s,o,u,a,f,l,c,h,d,v,m,g=p._data(e);if(!g)return;n.handler&&(a=n,n=a.handler,i=a.selector),n.guid||(n.guid=p.guid++),(o=g.events)||(o=g.events={}),(l=g.handle)||(l=g.handle=function(e){return typeof p===j||!!e&&p.event.triggered===e.type?undefined:p.event.dispatch.apply(l.elem,arguments)},l.elem=e),t=(t||"").match(M)||[""],u=t.length;while(u--){s=et.exec(t[u])||[],d=m=s[1],v=(s[2]||"").split(".").sort();if(!d)continue;f=p.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=p.event.special[d]||{},c=p.extend({type:d,origType:m,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&p.expr.match.needsContext.test(i),namespace:v.join(".")},a);if(!(h=o[d])){h=o[d]=[],h.delegateCount=0;if(!f.setup||f.setup.call(e,r,v,l)===!1)e.addEventListener?e.addEventListener(d,l,!1):e.attachEvent&&e.attachEvent("on"+d,l)}f.add&&(f.add.call(e,c),c.handler.guid||(c.handler.guid=n.guid)),i?h.splice(h.delegateCount++,0,c):h.push(c),p.event.global[d]=!0}e=null},remove:function(e,t,n,r,i){var s,o,u,a,f,l,c,h,d,v,m,g=p.hasData(e)&&p._data(e);if(!g||!(l=g.events))return;t=(t||"").match(M)||[""],f=t.length;while(f--){u=et.exec(t[f])||[],d=m=u[1],v=(u[2]||"").split(".").sort();if(!d){for(d in l)p.event.remove(e,d+t[f],n,r,!0);continue}c=p.event.special[d]||{},d=(r?c.delegateType:c.bindType)||d,h=l[d]||[],u=u[2]&&new RegExp("(^|\\.)"+v.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=s=h.length;while(s--)o=h[s],(i||m===o.origType)&&(!n||n.guid===o.guid)&&(!u||u.test(o.namespace))&&(!r||r===o.selector||r==="**"&&o.selector)&&(h.splice(s,1),o.selector&&h.delegateCount--,c.remove&&c.remove.call(e,o));a&&!h.length&&((!c.teardown||c.teardown.call(e,v,g.handle)===!1)&&p.removeEvent(e,d,g.handle),delete l[d])}p.isEmptyObject(l)&&(delete g.handle,p._removeData(e,"events"))},trigger:function(t,n,r,i){var s,o,u,a,l,c,h,d=[r||N],v=f.call(t,"type")?t.type:t,m=f.call(t,"namespace")?t.namespace.split("."):[];u=c=r=r||N;if(r.nodeType===3||r.nodeType===8)return;if(Z.test(v+p.event.triggered))return;v.indexOf(".")>=0&&(m=v.split("."),v=m.shift(),m.sort()),o=v.indexOf(":")<0&&"on"+v,t=t[p.expando]?t:new p.Event(v,typeof t=="object"&&t),t.isTrigger=i?2:3,t.namespace=m.join("."),t.namespace_re=t.namespace?new RegExp("(^|\\.)"+m.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=undefined,t.target||(t.target=r),n=n==null?[t]:p.makeArray(n,[t]),l=p.event.special[v]||{};if(!i&&l.trigger&&l.trigger.apply(r,n)===!1)return;if(!i&&!l.noBubble&&!p.isWindow(r)){a=l.delegateType||v,Z.test(a+v)||(u=u.parentNode);for(;u;u=u.parentNode)d.push(u),c=u;c===(r.ownerDocument||N)&&d.push(c.defaultView||c.parentWindow||e)}h=0;while((u=d[h++])&&!t.isPropagationStopped())t.type=h>1?a:l.bindType||v,s=(p._data(u,"events")||{})[t.type]&&p._data(u,"handle"),s&&s.apply(u,n),s=o&&u[o],s&&s.apply&&p.acceptData(u)&&(t.result=s.apply(u,n),t.result===!1&&t.preventDefault());t.type=v;if(!i&&!t.isDefaultPrevented()&&(!l._default||l._default.apply(d.pop(),n)===!1)&&p.acceptData(r)&&o&&r[v]&&!p.isWindow(r)){c=r[o],c&&(r[o]=null),p.event.triggered=v;try{r[v]()}catch(g){}p.event.triggered=undefined,c&&(r[o]=c)}return t.result},dispatch:function(e){e=p.event.fix(e);var t,n,i,s,o,u=[],a=r.call(arguments),f=(p._data(this,"events")||{})[e.type]||[],l=p.event.special[e.type]||{};a[0]=e,e.delegateTarget=this;if(l.preDispatch&&l.preDispatch.call(this,e)===!1)return;u=p.event.handlers.call(this,e,f),t=0;while((s=u[t++])&&!e.isPropagationStopped()){e.currentTarget=s.elem,o=0;while((i=s.handlers[o++])&&!e.isImmediatePropagationStopped())if(!e.namespace_re||e.namespace_re.test(i.namespace))e.handleObj=i,e.data=i.data,n=((p.event.special[i.origType]||{}).handle||i.handler).apply(s.elem,a),n!==undefined&&(e.result=n)===!1&&(e.preventDefault(),e.stopPropagation())}return l.postDispatch&&l.postDispatch.call(this,e),e.result},handlers:function(e,t){var n,r,i,s,o=[],u=t.delegateCount,a=e.target;if(u&&a.nodeType&&(!e.button||e.type!=="click"))for(;a!=this;a=a.parentNode||this)if(a.nodeType===1&&(a.disabled!==!0||e.type!=="click")){i=[];for(s=0;s<u;s++)r=t[s],n=r.selector+" ",i[n]===undefined&&(i[n]=r.needsContext?p(n,this).index(a)>=0:p.find(n,this,null,[a]).length),i[n]&&i.push(r);i.length&&o.push({elem:a,handlers:i})}return u<t.length&&o.push({elem:this,handlers:t.slice(u)}),o},fix:function(e){if(e[p.expando])return e;var t,n,r,i=e.type,s=e,o=this.fixHooks[i];o||(this.fixHooks[i]=o=Y.test(i)?this.mouseHooks:G.test(i)?this.keyHooks:{}),r=o.props?this.props.concat(o.props):this.props,e=new p.Event(s),t=r.length;while(t--)n=r[t],e[n]=s[n];return e.target||(e.target=s.srcElement||N),e.target.nodeType===3&&(e.target=e.target.parentNode),e.metaKey=!!e.metaKey,o.filter?o.filter(e,s):e},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return e.which==null&&(e.which=t.charCode!=null?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,t){var n,r,i,s=t.button,o=t.fromElement;return e.pageX==null&&t.clientX!=null&&(r=e.target.ownerDocument||N,i=r.documentElement,n=r.body,e.pageX=t.clientX+(i&&i.scrollLeft||n&&n.scrollLeft||0)-(i&&i.clientLeft||n&&n.clientLeft||0),e.pageY=t.clientY+(i&&i.scrollTop||n&&n.scrollTop||0)-(i&&i.clientTop||n&&n.clientTop||0)),!e.relatedTarget&&o&&(e.relatedTarget=o===e.target?t.toElement:o),!e.which&&s!==undefined&&(e.which=s&1?1:s&2?3:s&4?2:0),e}},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==rt()&&this.focus)try{return this.focus(),!1}catch(e){}},delegateType:"focusin"},blur:{trigger:function(){if(this===rt()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if(p.nodeName(this,"input")&&this.type==="checkbox"&&this.click)return this.click(),!1},_default:function(e){return p.nodeName(e.target,"a")}},beforeunload:{postDispatch:function(e){e.result!==undefined&&(e.originalEvent.returnValue=e.result)}}},simulate:function(e,t,n,r){var i=p.extend(new p.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?p.event.trigger(i,null,t):p.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},p.removeEvent=N.removeEventListener?function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)}:function(e,t,n){var r="on"+t;e.detachEvent&&(typeof e[r]===j&&(e[r]=null),e.detachEvent(r,n))},p.Event=function(e,t){if(!(this instanceof p.Event))return new p.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.defaultPrevented===undefined&&(e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault())?tt:nt):this.type=e,t&&p.extend(this,t),this.timeStamp=e&&e.timeStamp||p.now(),this[p.expando]=!0},p.Event.prototype={isDefaultPrevented:nt,isPropagationStopped:nt,isImmediatePropagationStopped:nt,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=tt;if(!e)return;e.preventDefault?e.preventDefault():e.returnValue=!1},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=tt;if(!e)return;e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=tt,this.stopPropagation()}},p.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){p.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,s=e.handleObj;if(!i||i!==r&&!p.contains(r,i))e.type=s.origType,n=s.handler.apply(this,arguments),e.type=t;return n}}}),c.submitBubbles||(p.event.special.submit={setup:function(){if(p.nodeName(this,"form"))return!1;p.event.add(this,"click._submit keypress._submit",function(e){var t=e.target,n=p.nodeName(t,"input")||p.nodeName(t,"button")?t.form:undefined;n&&!p._data(n,"submitBubbles")&&(p.event.add(n,"submit._submit",function(e){e._submit_bubble=!0}),p._data(n,"submitBubbles",!0))})},postDispatch:function(e){e._submit_bubble&&(delete e._submit_bubble,this.parentNode&&!e.isTrigger&&p.event.simulate("submit",this.parentNode,e,!0))},teardown:function(){if(p.nodeName(this,"form"))return!1;p.event.remove(this,"._submit")}}),c.changeBubbles||(p.event.special.change={setup:function(){if(Q.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")p.event.add(this,"propertychange._change",function(e){e.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),p.event.add(this,"click._change",function(e){this._just_changed&&!e.isTrigger&&(this._just_changed=!1),p.event.simulate("change",this,e,!0)});return!1}p.event.add(this,"beforeactivate._change",function(e){var t=e.target;Q.test(t.nodeName)&&!p._data(t,"changeBubbles")&&(p.event.add(t,"change._change",function(e){this.parentNode&&!e.isSimulated&&!e.isTrigger&&p.event.simulate("change",this.parentNode,e,!0)}),p._data(t,"changeBubbles",!0))})},handle:function(e){var t=e.target;if(this!==t||e.isSimulated||e.isTrigger||t.type!=="radio"&&t.type!=="checkbox")return e.handleObj.handler.apply(this,arguments)},teardown:function(){return p.event.remove(this,"._change"),!Q.test(this.nodeName)}}),c.focusinBubbles||p.each({focus:"focusin",blur:"focusout"},function(e,t){var n=function(e){p.event.simulate(t,e.target,p.event.fix(e),!0)};p.event.special[t]={setup:function(){var r=this.ownerDocument||this,i=p._data(r,t);i||r.addEventListener(e,n,!0),p._data(r,t,(i||0)+1)},teardown:function(){var r=this.ownerDocument||this,i=p._data(r,t)-1;i?p._data(r,t,i):(r.removeEventListener(e,n,!0),p._removeData(r,t))}}}),p.fn.extend({on:function(e,t,n,r,i){var s,o;if(typeof e=="object"){typeof t!="string"&&(n=n||t,t=undefined);for(s in e)this.on(s,t,n,e[s],i);return this}n==null&&r==null?(r=t,n=t=undefined):r==null&&(typeof t=="string"?(r=n,n=undefined):(r=n,n=t,t=undefined));if(r===!1)r=nt;else if(!r)return this;return i===1&&(o=r,r=function(e){return p().off(e),o.apply(this,arguments)},r.guid=o.guid||(o.guid=p.guid++)),this.each(function(){p.event.add(this,e,r,n,t)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,p(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if(typeof e=="object"){for(i in e)this.off(i,t,e[i]);return this}if(t===!1||typeof t=="function")n=t,t=undefined;return n===!1&&(n=nt),this.each(function(){p.event.remove(this,e,n,t)})},trigger:function(e,t){return this.each(function(){p.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return p.event.trigger(e,t,n,!0)}});var st="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",ot=/ jQuery\d+="(?:null|\d+)"/g,ut=new RegExp("<(?:"+st+")[\\s/>]","i"),at=/^\s+/,ft=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,lt=/<([\w:]+)/,ct=/<tbody/i,ht=/<|&#?\w+;/,pt=/<(?:script|style|link)/i,dt=/checked\s*(?:[^=]|=\s*.checked.)/i,vt=/^$|\/(?:java|ecma)script/i,mt=/^true\/(.*)/,gt=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,yt={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:c.htmlSerialize?[0,"",""]:[1,"X<div>","</div>"]},bt=it(N),wt=bt.appendChild(N.createElement("div"));yt.optgroup=yt.option,yt.tbody=yt.tfoot=yt.colgroup=yt.caption=yt.thead,yt.th=yt.td,p.extend({clone:function(e,t,n){var r,i,s,o,u,a=p.contains(e.ownerDocument,e);c.html5Clone||p.isXMLDoc(e)||!ut.test("<"+e.nodeName+">")?s=e.cloneNode(!0):(wt.innerHTML=e.outerHTML,wt.removeChild(s=wt.firstChild));if((!c.noCloneEvent||!c.noCloneChecked)&&(e.nodeType===1||e.nodeType===11)&&!p.isXMLDoc(e)){r=Et(s),u=Et(e);for(o=0;(i=u[o])!=null;++o)r[o]&&Lt(i,r[o])}if(t)if(n){u=u||Et(e),r=r||Et(s);for(o=0;(i=u[o])!=null;o++)kt(i,r[o])}else kt(e,s);return r=Et(s,"script"),r.length>0&&Ct(r,!a&&Et(e,"script")),r=u=i=null,s},buildFragment:function(e,t,n,r){var i,s,o,u,a,f,l,h=e.length,d=it(t),v=[],m=0;for(;m<h;m++){s=e[m];if(s||s===0)if(p.type(s)==="object")p.merge(v,s.nodeType?[s]:s);else if(!ht.test(s))v.push(t.createTextNode(s));else{u=u||d.appendChild(t.createElement("div")),a=(lt.exec(s)||["",""])[1].toLowerCase(),l=yt[a]||yt._default,u.innerHTML=l[1]+s.replace(ft,"<$1></$2>")+l[2],i=l[0];while(i--)u=u.lastChild;!c.leadingWhitespace&&at.test(s)&&v.push(t.createTextNode(at.exec(s)[0]));if(!c.tbody){s=a==="table"&&!ct.test(s)?u.firstChild:l[1]==="<table>"&&!ct.test(s)?u:0,i=s&&s.childNodes.length;while(i--)p.nodeName(f=s.childNodes[i],"tbody")&&!f.childNodes.length&&s.removeChild(f)}p.merge(v,u.childNodes),u.textContent="";while(u.firstChild)u.removeChild(u.firstChild);u=d.lastChild}}u&&d.removeChild(u),c.appendChecked||p.grep(Et(v,"input"),St),m=0;while(s=v[m++]){if(r&&p.inArray(s,r)!==-1)continue;o=p.contains(s.ownerDocument,s),u=Et(d.appendChild(s),"script"),o&&Ct(u);if(n){i=0;while(s=u[i++])vt.test(s.type||"")&&n.push(s)}}return u=null,d},cleanData:function(e,t){var r,i,s,o,u=0,a=p.expando,f=p.cache,l=c.deleteExpando,h=p.event.special;for(;(r=e[u])!=null;u++)if(t||p.acceptData(r)){s=r[a],o=s&&f[s];if(o){if(o.events)for(i in o.events)h[i]?p.event.remove(r,i):p.removeEvent(r,i,o.handle);f[s]&&(delete f[s],l?delete r[a]:typeof r.removeAttribute!==j?r.removeAttribute(a):r[a]=null,n.push(s))}}}}),p.fn.extend({text:function(e){return J(this,function(e){return e===undefined?p.text(this):this.empty().append((this[0]&&this[0].ownerDocument||N).createTextNode(e))},null,e,arguments.length)},append:function(){return this.domManip(arguments,function(e){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var t=xt(this,e);t.appendChild(e)}})},prepend:function(){return this.domManip(arguments,function(e){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var t=xt(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},remove:function(e,t){var n,r=e?p.filter(e,this):this,i=0;for(;(n=r[i])!=null;i++)!t&&n.nodeType===1&&p.cleanData(Et(n)),n.parentNode&&(t&&p.contains(n.ownerDocument,n)&&Ct(Et(n,"script")),n.parentNode.removeChild(n));return this},empty:function(){var e,t=0;for(;(e=this[t])!=null;t++){e.nodeType===1&&p.cleanData(Et(e,!1));while(e.firstChild)e.removeChild(e.firstChild);e.options&&p.nodeName(e,"select")&&(e.options.length=0)}return this},clone:function(e,t){return e=e==null?!1:e,t=t==null?e:t,this.map(function(){return p.clone(this,e,t)})},html:function(e){return J(this,function(e){var t=this[0]||{},n=0,r=this.length;if(e===undefined)return t.nodeType===1?t.innerHTML.replace(ot,""):undefined;if(typeof e=="string"&&!pt.test(e)&&(c.htmlSerialize||!ut.test(e))&&(c.leadingWhitespace||!at.test(e))&&!yt[(lt.exec(e)||["",""])[1].toLowerCase()]){e=e.replace(ft,"<$1></$2>");try{for(;n<r;n++)t=this[n]||{},t.nodeType===1&&(p.cleanData(Et(t,!1)),t.innerHTML=e);t=0}catch(i){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=arguments[0];return this.domManip(arguments,function(t){e=this.parentNode,p.cleanData(Et(this)),e&&e.replaceChild(t,this)}),e&&(e.length||e.nodeType)?this:this.remove()},detach:function(e){return this.remove(e,!0)},domManip:function(e,t){e=i.apply([],e);var n,r,s,o,u,a,f=0,l=this.length,h=this,d=l-1,v=e[0],m=p.isFunction(v);if(m||l>1&&typeof v=="string"&&!c.checkClone&&dt.test(v))return this.each(function(n){var r=h.eq(n);m&&(e[0]=v.call(this,n,r.html())),r.domManip(e,t)});if(l){a=p.buildFragment(e,this[0].ownerDocument,!1,this),n=a.firstChild,a.childNodes.length===1&&(a=n);if(n){o=p.map(Et(a,"script"),Tt),s=o.length;for(;f<l;f++)r=a,f!==d&&(r=p.clone(r,!0,!0),s&&p.merge(o,Et(r,"script"))),t.call(this[f],r,f);if(s){u=o[o.length-1].ownerDocument,p.map(o,Nt);for(f=0;f<s;f++)r=o[f],vt.test(r.type||"")&&!p._data(r,"globalEval")&&p.contains(u,r)&&(r.src?p._evalUrl&&p._evalUrl(r.src):p.globalEval((r.text||r.textContent||r.innerHTML||"").replace(gt,"")))}a=n=null}}return this}}),p.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){p.fn[e]=function(e){var n,r=0,i=[],o=p(e),u=o.length-1;for(;r<=u;r++)n=r===u?this:this.clone(!0),p(o[r])[t](n),s.apply(i,n.get());return this.pushStack(i)}});var At,Ot={};(function(){var e,t,n=N.createElement("div"),r="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;padding:0;margin:0;border:0";n.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",e=n.getElementsByTagName("a")[0],e.style.cssText="float:left;opacity:.5",c.opacity=/^0.5/.test(e.style.opacity),c.cssFloat=!!e.style.cssFloat,n.style.backgroundClip="content-box",n.cloneNode(!0).style.backgroundClip="",c.clearCloneStyle=n.style.backgroundClip==="content-box",e=n=null,c.shrinkWrapBlocks=function(){var e,n,i,s;if(t==null){e=N.getElementsByTagName("body")[0];if(!e)return;s="border:0;width:0;height:0;position:absolute;top:0;left:-9999px",n=N.createElement("div"),i=N.createElement("div"),e.appendChild(n).appendChild(i),t=!1,typeof i.style.zoom!==j&&(i.style.cssText=r+";width:1px;padding:1px;zoom:1",i.innerHTML="<div></div>",i.firstChild.style.width="5px",t=i.offsetWidth!==3),e.removeChild(n),e=n=i=null}return t}})();var Dt=/^margin/,Pt=new RegExp("^("+X+")(?!px)[a-z%]+$","i"),Ht,Bt,jt=/^(top|right|bottom|left)$/;e.getComputedStyle?(Ht=function(e){return e.ownerDocument.defaultView.getComputedStyle(e,null)},Bt=function(e,t,n){var r,i,s,o,u=e.style;return n=n||Ht(e),o=n?n.getPropertyValue(t)||n[t]:undefined,n&&(o===""&&!p.contains(e.ownerDocument,e)&&(o=p.style(e,t)),Pt.test(o)&&Dt.test(t)&&(r=u.width,i=u.minWidth,s=u.maxWidth,u.minWidth=u.maxWidth=u.width=o,o=n.width,u.width=r,u.minWidth=i,u.maxWidth=s)),o===undefined?o:o+""}):N.documentElement.currentStyle&&(Ht=function(e){return e.currentStyle},Bt=function(e,t,n){var r,i,s,o,u=e.style;return n=n||Ht(e),o=n?n[t]:undefined,o==null&&u&&u[t]&&(o=u[t]),Pt.test(o)&&!jt.test(t)&&(r=u.left,i=e.runtimeStyle,s=i&&i.left,s&&(i.left=e.currentStyle.left),u.left=t==="fontSize"?"1em":o,o=u.pixelLeft+"px",u.left=r,s&&(i.left=s)),o===undefined?o:o+""||"auto"}),function(){function l(){var t,n,u=N.getElementsByTagName("body")[0];if(!u)return;t=N.createElement("div"),n=N.createElement("div"),t.style.cssText=a,u.appendChild(t).appendChild(n),n.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;display:block;padding:1px;border:1px;width:4px;margin-top:1%;top:1%",p.swap(u,u.style.zoom!=null?{zoom:1}:{},function(){r=n.offsetWidth===4}),i=!0,s=!1,o=!0,e.getComputedStyle&&(s=(e.getComputedStyle(n,null)||{}).top!=="1%",i=(e.getComputedStyle(n,null)||{width:"4px"}).width==="4px"),u.removeChild(t),n=u=null}var t,n,r,i,s,o,u=N.createElement("div"),a="border:0;width:0;height:0;position:absolute;top:0;left:-9999px",f="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;padding:0;margin:0;border:0"
;u.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",t=u.getElementsByTagName("a")[0],t.style.cssText="float:left;opacity:.5",c.opacity=/^0.5/.test(t.style.opacity),c.cssFloat=!!t.style.cssFloat,u.style.backgroundClip="content-box",u.cloneNode(!0).style.backgroundClip="",c.clearCloneStyle=u.style.backgroundClip==="content-box",t=u=null,p.extend(c,{reliableHiddenOffsets:function(){if(n!=null)return n;var e,t,r,i=N.createElement("div"),s=N.getElementsByTagName("body")[0];if(!s)return;return i.setAttribute("className","t"),i.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",e=N.createElement("div"),e.style.cssText=a,s.appendChild(e).appendChild(i),i.innerHTML="<table><tr><td></td><td>t</td></tr></table>",t=i.getElementsByTagName("td"),t[0].style.cssText="padding:0;margin:0;border:0;display:none",r=t[0].offsetHeight===0,t[0].style.display="",t[1].style.display="none",n=r&&t[0].offsetHeight===0,s.removeChild(e),i=s=null,n},boxSizing:function(){return r==null&&l(),r},boxSizingReliable:function(){return i==null&&l(),i},pixelPosition:function(){return s==null&&l(),s},reliableMarginRight:function(){var t,n,r,i;if(o==null&&e.getComputedStyle){t=N.getElementsByTagName("body")[0];if(!t)return;n=N.createElement("div"),r=N.createElement("div"),n.style.cssText=a,t.appendChild(n).appendChild(r),i=r.appendChild(N.createElement("div")),i.style.cssText=r.style.cssText=f,i.style.marginRight=i.style.width="0",r.style.width="1px",o=!parseFloat((e.getComputedStyle(i,null)||{}).marginRight),t.removeChild(n)}return o}})}(),p.swap=function(e,t,n,r){var i,s,o={};for(s in t)o[s]=e.style[s],e.style[s]=t[s];i=n.apply(e,r||[]);for(s in t)e.style[s]=o[s];return i};var It=/alpha\([^)]*\)/i,qt=/opacity\s*=\s*([^)]*)/,Rt=/^(none|table(?!-c[ea]).+)/,Ut=new RegExp("^("+X+")(.*)$","i"),zt=new RegExp("^([+-])=("+X+")","i"),Wt={position:"absolute",visibility:"hidden",display:"block"},Xt={letterSpacing:0,fontWeight:400},Vt=["Webkit","O","Moz","ms"];p.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Bt(e,"opacity");return n===""?"1":n}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":c.cssFloat?"cssFloat":"styleFloat"},style:function(e,t,n,r){if(!e||e.nodeType===3||e.nodeType===8||!e.style)return;var i,s,o,u=p.camelCase(t),a=e.style;t=p.cssProps[u]||(p.cssProps[u]=$t(a,u)),o=p.cssHooks[t]||p.cssHooks[u];if(n===undefined)return o&&"get"in o&&(i=o.get(e,!1,r))!==undefined?i:a[t];s=typeof n,s==="string"&&(i=zt.exec(n))&&(n=(i[1]+1)*i[2]+parseFloat(p.css(e,t)),s="number");if(n==null||n!==n)return;s==="number"&&!p.cssNumber[u]&&(n+="px"),!c.clearCloneStyle&&n===""&&t.indexOf("background")===0&&(a[t]="inherit");if(!o||!("set"in o)||(n=o.set(e,n,r))!==undefined)try{a[t]="",a[t]=n}catch(f){}},css:function(e,t,n,r){var i,s,o,u=p.camelCase(t);return t=p.cssProps[u]||(p.cssProps[u]=$t(e.style,u)),o=p.cssHooks[t]||p.cssHooks[u],o&&"get"in o&&(s=o.get(e,!0,n)),s===undefined&&(s=Bt(e,t,r)),s==="normal"&&t in Xt&&(s=Xt[t]),n===""||n?(i=parseFloat(s),n===!0||p.isNumeric(i)?i||0:s):s}}),p.each(["height","width"],function(e,t){p.cssHooks[t]={get:function(e,n,r){if(n)return e.offsetWidth===0&&Rt.test(p.css(e,"display"))?p.swap(e,Wt,function(){return Gt(e,t,r)}):Gt(e,t,r)},set:function(e,n,r){var i=r&&Ht(e);return Kt(e,n,r?Qt(e,t,r,c.boxSizing()&&p.css(e,"boxSizing",!1,i)==="border-box",i):0)}}}),c.opacity||(p.cssHooks.opacity={get:function(e,t){return qt.test((t&&e.currentStyle?e.currentStyle.filter:e.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":t?"1":""},set:function(e,t){var n=e.style,r=e.currentStyle,i=p.isNumeric(t)?"alpha(opacity="+t*100+")":"",s=r&&r.filter||n.filter||"";n.zoom=1;if((t>=1||t==="")&&p.trim(s.replace(It,""))===""&&n.removeAttribute){n.removeAttribute("filter");if(t===""||r&&!r.filter)return}n.filter=It.test(s)?s.replace(It,i):s+" "+i}}),p.cssHooks.marginRight=Ft(c.reliableMarginRight,function(e,t){if(t)return p.swap(e,{display:"inline-block"},Bt,[e,"marginRight"])}),p.each({margin:"",padding:"",border:"Width"},function(e,t){p.cssHooks[e+t]={expand:function(n){var r=0,i={},s=typeof n=="string"?n.split(" "):[n];for(;r<4;r++)i[e+V[r]+t]=s[r]||s[r-2]||s[0];return i}},Dt.test(e)||(p.cssHooks[e+t].set=Kt)}),p.fn.extend({css:function(e,t){return J(this,function(e,t,n){var r,i,s={},o=0;if(p.isArray(t)){r=Ht(e),i=t.length;for(;o<i;o++)s[t[o]]=p.css(e,t[o],!1,r);return s}return n!==undefined?p.style(e,t,n):p.css(e,t)},e,t,arguments.length>1)},show:function(){return Jt(this,!0)},hide:function(){return Jt(this)},toggle:function(e){return typeof e=="boolean"?e?this.show():this.hide():this.each(function(){$(this)?p(this).show():p(this).hide()})}}),p.Tween=Yt,Yt.prototype={constructor:Yt,init:function(e,t,n,r,i,s){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=s||(p.cssNumber[n]?"":"px")},cur:function(){var e=Yt.propHooks[this.prop];return e&&e.get?e.get(this):Yt.propHooks._default.get(this)},run:function(e){var t,n=Yt.propHooks[this.prop];return this.options.duration?this.pos=t=p.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):Yt.propHooks._default.set(this),this}},Yt.prototype.init.prototype=Yt.prototype,Yt.propHooks={_default:{get:function(e){var t;return e.elem[e.prop]==null||!!e.elem.style&&e.elem.style[e.prop]!=null?(t=p.css(e.elem,e.prop,""),!t||t==="auto"?0:t):e.elem[e.prop]},set:function(e){p.fx.step[e.prop]?p.fx.step[e.prop](e):e.elem.style&&(e.elem.style[p.cssProps[e.prop]]!=null||p.cssHooks[e.prop])?p.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},Yt.propHooks.scrollTop=Yt.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},p.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},p.fx=Yt.prototype.init,p.fx.step={};var Zt,en,tn=/^(?:toggle|show|hide)$/,nn=new RegExp("^(?:([+-])=|)("+X+")([a-z%]*)$","i"),rn=/queueHooks$/,sn=[ln],on={"*":[function(e,t){var n=this.createTween(e,t),r=n.cur(),i=nn.exec(t),s=i&&i[3]||(p.cssNumber[e]?"":"px"),o=(p.cssNumber[e]||s!=="px"&&+r)&&nn.exec(p.css(n.elem,e)),u=1,a=20;if(o&&o[3]!==s){s=s||o[3],i=i||[],o=+r||1;do u=u||".5",o/=u,p.style(n.elem,e,o+s);while(u!==(u=n.cur()/r)&&u!==1&&--a)}return i&&(o=n.start=+o||+r||0,n.unit=s,n.end=i[1]?o+(i[1]+1)*i[2]:+i[2]),n}]};p.Animation=p.extend(hn,{tweener:function(e,t){p.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;r<i;r++)n=e[r],on[n]=on[n]||[],on[n].unshift(t)},prefilter:function(e,t){t?sn.unshift(e):sn.push(e)}}),p.speed=function(e,t,n){var r=e&&typeof e=="object"?p.extend({},e):{complete:n||!n&&t||p.isFunction(e)&&e,duration:e,easing:n&&t||t&&!p.isFunction(t)&&t};r.duration=p.fx.off?0:typeof r.duration=="number"?r.duration:r.duration in p.fx.speeds?p.fx.speeds[r.duration]:p.fx.speeds._default;if(r.queue==null||r.queue===!0)r.queue="fx";return r.old=r.complete,r.complete=function(){p.isFunction(r.old)&&r.old.call(this),r.queue&&p.dequeue(this,r.queue)},r},p.fn.extend({fadeTo:function(e,t,n,r){return this.filter($).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=p.isEmptyObject(e),s=p.speed(t,n,r),o=function(){var t=hn(this,p.extend({},e),s);(i||p._data(this,"finish"))&&t.stop(!0)};return o.finish=o,i||s.queue===!1?this.each(o):this.queue(s.queue,o)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return typeof e!="string"&&(n=t,t=e,e=undefined),t&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=e!=null&&e+"queueHooks",s=p.timers,o=p._data(this);if(i)o[i]&&o[i].stop&&r(o[i]);else for(i in o)o[i]&&o[i].stop&&rn.test(i)&&r(o[i]);for(i=s.length;i--;)s[i].elem===this&&(e==null||s[i].queue===e)&&(s[i].anim.stop(n),t=!1,s.splice(i,1));(t||!n)&&p.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=p._data(this),r=n[e+"queue"],i=n[e+"queueHooks"],s=p.timers,o=r?r.length:0;n.finish=!0,p.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0);for(t=s.length;t--;)s[t].elem===this&&s[t].queue===e&&(s[t].anim.stop(!0),s.splice(t,1));for(t=0;t<o;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}}),p.each(["toggle","show","hide"],function(e,t){var n=p.fn[t];p.fn[t]=function(e,r,i){return e==null||typeof e=="boolean"?n.apply(this,arguments):this.animate(an(t,!0),e,r,i)}}),p.each({slideDown:an("show"),slideUp:an("hide"),slideToggle:an("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){p.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),p.timers=[],p.fx.tick=function(){var e,t=p.timers,n=0;Zt=p.now();for(;n<t.length;n++)e=t[n],!e()&&t[n]===e&&t.splice(n--,1);t.length||p.fx.stop(),Zt=undefined},p.fx.timer=function(e){p.timers.push(e),e()?p.fx.start():p.timers.pop()},p.fx.interval=13,p.fx.start=function(){en||(en=setInterval(p.fx.tick,p.fx.interval))},p.fx.stop=function(){clearInterval(en),en=null},p.fx.speeds={slow:600,fast:200,_default:400},p.fn.delay=function(e,t){return e=p.fx?p.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},function(){var e,t,n,r,i=N.createElement("div");i.setAttribute("className","t"),i.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",e=i.getElementsByTagName("a")[0],n=N.createElement("select"),r=n.appendChild(N.createElement("option")),t=i.getElementsByTagName("input")[0],e.style.cssText="top:1px",c.getSetAttribute=i.className!=="t",c.style=/top/.test(e.getAttribute("style")),c.hrefNormalized=e.getAttribute("href")==="/a",c.checkOn=!!t.value,c.optSelected=r.selected,c.enctype=!!N.createElement("form").enctype,n.disabled=!0,c.optDisabled=!r.disabled,t=N.createElement("input"),t.setAttribute("value",""),c.input=t.getAttribute("value")==="",t.value="t",t.setAttribute("type","radio"),c.radioValue=t.value==="t",e=t=n=r=i=null}();var pn=/\r/g;p.fn.extend({val:function(e){var t,n,r,i=this[0];if(!arguments.length){if(i)return t=p.valHooks[i.type]||p.valHooks[i.nodeName.toLowerCase()],t&&"get"in t&&(n=t.get(i,"value"))!==undefined?n:(n=i.value,typeof n=="string"?n.replace(pn,""):n==null?"":n);return}return r=p.isFunction(e),this.each(function(n){var i;if(this.nodeType!==1)return;r?i=e.call(this,n,p(this).val()):i=e,i==null?i="":typeof i=="number"?i+="":p.isArray(i)&&(i=p.map(i,function(e){return e==null?"":e+""})),t=p.valHooks[this.type]||p.valHooks[this.nodeName.toLowerCase()];if(!t||!("set"in t)||t.set(this,i,"value")===undefined)this.value=i})}}),p.extend({valHooks:{option:{get:function(e){var t=p.find.attr(e,"value");return t!=null?t:p.text(e)}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,s=e.type==="select-one"||i<0,o=s?null:[],u=s?i+1:r.length,a=i<0?u:s?i:0;for(;a<u;a++){n=r[a];if((n.selected||a===i)&&(c.optDisabled?!n.disabled:n.getAttribute("disabled")===null)&&(!n.parentNode.disabled||!p.nodeName(n.parentNode,"optgroup"))){t=p(n).val();if(s)return t;o.push(t)}}return o},set:function(e,t){var n,r,i=e.options,s=p.makeArray(t),o=i.length;while(o--){r=i[o];if(p.inArray(p.valHooks.option.get(r),s)>=0)try{r.selected=n=!0}catch(u){r.scrollHeight}else r.selected=!1}return n||(e.selectedIndex=-1),i}}}}),p.each(["radio","checkbox"],function(){p.valHooks[this]={set:function(e,t){if(p.isArray(t))return e.checked=p.inArray(p(e).val(),t)>=0}},c.checkOn||(p.valHooks[this].get=function(e){return e.getAttribute("value")===null?"on":e.value})});var dn,vn,mn=p.expr.attrHandle,gn=/^(?:checked|selected)$/i,yn=c.getSetAttribute,bn=c.input;p.fn.extend({attr:function(e,t){return J(this,p.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){p.removeAttr(this,e)})}}),p.extend({attr:function(e,t,n){var r,i,s=e.nodeType;if(!e||s===3||s===8||s===2)return;if(typeof e.getAttribute===j)return p.prop(e,t,n);if(s!==1||!p.isXMLDoc(e))t=t.toLowerCase(),r=p.attrHooks[t]||(p.expr.match.bool.test(t)?vn:dn);if(n===undefined)return r&&"get"in r&&(i=r.get(e,t))!==null?i:(i=p.find.attr(e,t),i==null?undefined:i);if(n!==null)return r&&"set"in r&&(i=r.set(e,n,t))!==undefined?i:(e.setAttribute(t,n+""),n);p.removeAttr(e,t)},removeAttr:function(e,t){var n,r,i=0,s=t&&t.match(M);if(s&&e.nodeType===1)while(n=s[i++])r=p.propFix[n]||n,p.expr.match.bool.test(n)?bn&&yn||!gn.test(n)?e[r]=!1:e[p.camelCase("default-"+n)]=e[r]=!1:p.attr(e,n,""),e.removeAttribute(yn?n:r)},attrHooks:{type:{set:function(e,t){if(!c.radioValue&&t==="radio"&&p.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}}}),vn={set:function(e,t,n){return t===!1?p.removeAttr(e,n):bn&&yn||!gn.test(n)?e.setAttribute(!yn&&p.propFix[n]||n,n):e[p.camelCase("default-"+n)]=e[n]=!0,n}},p.each(p.expr.match.bool.source.match(/\w+/g),function(e,t){var n=mn[t]||p.find.attr;mn[t]=bn&&yn||!gn.test(t)?function(e,t,r){var i,s;return r||(s=mn[t],mn[t]=i,i=n(e,t,r)!=null?t.toLowerCase():null,mn[t]=s),i}:function(e,t,n){if(!n)return e[p.camelCase("default-"+t)]?t.toLowerCase():null}});if(!bn||!yn)p.attrHooks.value={set:function(e,t,n){if(!p.nodeName(e,"input"))return dn&&dn.set(e,t,n);e.defaultValue=t}};yn||(dn={set:function(e,t,n){var r=e.getAttributeNode(n);r||e.setAttributeNode(r=e.ownerDocument.createAttribute(n)),r.value=t+="";if(n==="value"||t===e.getAttribute(n))return t}},mn.id=mn.name=mn.coords=function(e,t,n){var r;if(!n)return(r=e.getAttributeNode(t))&&r.value!==""?r.value:null},p.valHooks.button={get:function(e,t){var n=e.getAttributeNode(t);if(n&&n.specified)return n.value},set:dn.set},p.attrHooks.contenteditable={set:function(e,t,n){dn.set(e,t===""?!1:t,n)}},p.each(["width","height"],function(e,t){p.attrHooks[t]={set:function(e,n){if(n==="")return e.setAttribute(t,"auto"),n}}})),c.style||(p.attrHooks.style={get:function(e){return e.style.cssText||undefined},set:function(e,t){return e.style.cssText=t+""}});var wn=/^(?:input|select|textarea|button|object)$/i,En=/^(?:a|area)$/i;p.fn.extend({prop:function(e,t){return J(this,p.prop,e,t,arguments.length>1)},removeProp:function(e){return e=p.propFix[e]||e,this.each(function(){try{this[e]=undefined,delete this[e]}catch(t){}})}}),p.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(e,t,n){var r,i,s,o=e.nodeType;if(!e||o===3||o===8||o===2)return;return s=o!==1||!p.isXMLDoc(e),s&&(t=p.propFix[t]||t,i=p.propHooks[t]),n!==undefined?i&&"set"in i&&(r=i.set(e,n,t))!==undefined?r:e[t]=n:i&&"get"in i&&(r=i.get(e,t))!==null?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=p.find.attr(e,"tabindex");return t?parseInt(t,10):wn.test(e.nodeName)||En.test(e.nodeName)&&e.href?0:-1}}}}),c.hrefNormalized||p.each(["href","src"],function(e,t){p.propHooks[t]={get:function(e){return e.getAttribute(t,4)}}}),c.optSelected||(p.propHooks.selected={get:function(e){var t=e.parentNode;return t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex),null}}),p.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){p.propFix[this.toLowerCase()]=this}),c.enctype||(p.propFix.enctype="encoding");var Sn=/[\t\r\n\f]/g;p.fn.extend({addClass:function(e){var t,n,r,i,s,o,u=0,a=this.length,f=typeof e=="string"&&e;if(p.isFunction(e))return this.each(function(t){p(this).addClass(e.call(this,t,this.className))});if(f){t=(e||"").match(M)||[];for(;u<a;u++){n=this[u],r=n.nodeType===1&&(n.className?(" "+n.className+" ").replace(Sn," "):" ");if(r){s=0;while(i=t[s++])r.indexOf(" "+i+" ")<0&&(r+=i+" ");o=p.trim(r),n.className!==o&&(n.className=o)}}}return this},removeClass:function(e){var t,n,r,i,s,o,u=0,a=this.length,f=arguments.length===0||typeof e=="string"&&e;if(p.isFunction(e))return this.each(function(t){p(this).removeClass(e.call(this,t,this.className))});if(f){t=(e||"").match(M)||[];for(;u<a;u++){n=this[u],r=n.nodeType===1&&(n.className?(" "+n.className+" ").replace(Sn," "):"");if(r){s=0;while(i=t[s++])while(r.indexOf(" "+i+" ")>=0)r=r.replace(" "+i+" "," ");o=e?p.trim(r):"",n.className!==o&&(n.className=o)}}}return this},toggleClass:function(e,t){var n=typeof e;return typeof t=="boolean"&&n==="string"?t?this.addClass(e):this.removeClass(e):p.isFunction(e)?this.each(function(n){p(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if(n==="string"){var t,r=0,i=p(this),s=e.match(M)||[];while(t=s[r++])i.hasClass(t)?i.removeClass(t):i.addClass(t)}else if(n===j||n==="boolean")this.className&&p._data(this,"__className__",this.className),this.className=this.className||e===!1?"":p._data(this,"__className__")||""})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;n<r;n++)if(this[n].nodeType===1&&(" "+this[n].className+" ").replace(Sn," ").indexOf(t)>=0)return!0;return!1}}),p.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){p.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),p.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return arguments.length===1?this.off(e,"**"):this.off(t,e||"**",n)}});var xn=p.now(),Tn=/\?/,Nn=/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;p.parseJSON=function(t){if(e.JSON&&e.JSON.parse)return e.JSON.parse(t+"");var n,r=null,i=p.trim(t+"");return i&&!p.trim(i.replace(Nn,function(e,t,i,s){return n&&t&&(r=0),r===0?e:(n=i||t,r+=!s-!i,"")}))?Function("return "+i)():p.error("Invalid JSON: "+t)},p.parseXML=function(t){var n,r;if(!t||typeof t!="string")return null;try{e.DOMParser?(r=new DOMParser,n=r.parseFromString(t,"text/xml")):(n=new ActiveXObject("Microsoft.XMLDOM"),n.async="false",n.loadXML(t))}catch(i){n=undefined}return(!n||!n.documentElement||n.getElementsByTagName("parsererror").length)&&p.error("Invalid XML: "+t),n};var Cn,kn,Ln=/#.*$/,An=/([?&])_=[^&]*/,On=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,Mn=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,_n=/^(?:GET|HEAD)$/,Dn=/^\/\//,Pn=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,Hn={},Bn={},jn="*/".concat("*");try{kn=location.href}catch(Fn){kn=N.createElement("a"),kn.href="",kn=kn.href}Cn=Pn.exec(kn.toLowerCase())||[],p.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:kn,type:"GET",isLocal:Mn.test(Cn[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":jn,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":p.parseJSON,"text xml":p.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Rn(Rn(e,p.ajaxSettings),t):Rn(p.ajaxSettings,e)},ajaxPrefilter:In(Hn),ajaxTransport:In(Bn),ajax:function(e,t){function x(e,t,n,r){var f,g,y,w,S,x=t;if(b===2)return;b=2,o&&clearTimeout(o),a=undefined,s=r||"",E.readyState=e>0?4:0,f=e>=200&&e<300||e===304,n&&(w=Un(l,E,n)),w=zn(l,w,E,f);if(f)l.ifModified&&(S=E.getResponseHeader("Last-Modified"),S&&(p.lastModified[i]=S),S=E.getResponseHeader("etag"),S&&(p.etag[i]=S)),e===204||l.type==="HEAD"?x="nocontent":e===304?x="notmodified":(x=w.state,g=w.data,y=w.error,f=!y);else{y=x;if(e||!x)x="error",e<0&&(e=0)}E.status=e,E.statusText=(t||x)+"",f?d.resolveWith(c,[g,x,E]):d.rejectWith(c,[E,x,y]),E.statusCode(m),m=undefined,u&&h.trigger(f?"ajaxSuccess":"ajaxError",[E,l,f?g:y]),v.fireWith(c,[E,x]),u&&(h.trigger("ajaxComplete",[E,l]),--p.active||p.event.trigger("ajaxStop"))}typeof e=="object"&&(t=e,e=undefined),t=t||{};var n,r,i,s,o,u,a,f,l=p.ajaxSetup({},t),c=l.context||l,h=l.context&&(c.nodeType||c.jquery)?p(c):p.event,d=p.Deferred(),v=p.Callbacks("once memory"),m=l.statusCode||{},g={},y={},b=0,w="canceled",E={readyState:0,getResponseHeader:function(e){var t;if(b===2){if(!f){f={};while(t=On.exec(s))f[t[1].toLowerCase()]=t[2]}t=f[e.toLowerCase()]}return t==null?null:t},getAllResponseHeaders:function(){return b===2?s:null},setRequestHeader:function(e,t){var n=e.toLowerCase();return b||(e=y[n]=y[n]||e,g[e]=t),this},overrideMimeType:function(e){return b||(l.mimeType=e),this},statusCode:function(e){var t;if(e)if(b<2)for(t in e)m[t]=[m[t],e[t]];else E.always(e[E.status]);return this},abort:function(e){var t=e||w;return a&&a.abort(t),x(0,t),this}};d.promise(E).complete=v.add,E.success=E.done,E.error=E.fail,l.url=((e||l.url||kn)+"").replace(Ln,"").replace(Dn,Cn[1]+"//"),l.type=t.method||t.type||l.method||l.type,l.dataTypes=p.trim(l.dataType||"*").toLowerCase().match(M)||[""],l.crossDomain==null&&(n=Pn.exec(l.url.toLowerCase()),l.crossDomain=!(!n||n[1]===Cn[1]&&n[2]===Cn[2]&&(n[3]||(n[1]==="http:"?"80":"443"))===(Cn[3]||(Cn[1]==="http:"?"80":"443")))),l.data&&l.processData&&typeof l.data!="string"&&(l.data=p.param(l.data,l.traditional)),qn(Hn,l,t,E);if(b===2)return E;u=l.global,u&&p.active++===0&&p.event.trigger("ajaxStart"),l.type=l.type.toUpperCase(),l.hasContent=!_n.test(l.type),i=l.url,l.hasContent||(l.data&&(i=l.url+=(Tn.test(i)?"&":"?")+l.data,delete l.data),l.cache===!1&&(l.url=An.test(i)?i.replace(An,"$1_="+xn++):i+(Tn.test(i)?"&":"?")+"_="+xn++)),l.ifModified&&(p.lastModified[i]&&E.setRequestHeader("If-Modified-Since",p.lastModified[i]),p.etag[i]&&E.setRequestHeader("If-None-Match",p.etag[i])),(l.data&&l.hasContent&&l.contentType!==!1||t.contentType)&&E.setRequestHeader("Content-Type",l.contentType),E.setRequestHeader("Accept",l.dataTypes[0]&&l.accepts[l.dataTypes[0]]?l.accepts[l.dataTypes[0]]+(l.dataTypes[0]!=="*"?", "+jn+"; q=0.01":""):l.accepts["*"]);for(r in l.headers)E.setRequestHeader(r,l.headers[r]);if(!l.beforeSend||l.beforeSend.call(c,E,l)!==!1&&b!==2){w="abort";for(r in{success:1,error:1,complete:1})E[r](l[r]);a=qn(Bn,l,t,E);if(!a)x(-1,"No Transport");else{E.readyState=1,u&&h.trigger("ajaxSend",[E,l]),l.async&&l.timeout>0&&(o=setTimeout(function(){E.abort("timeout")},l.timeout));try{b=1,a.send(g,x)}catch(S){if(!(b<2))throw S;x(-1,S)}}return E}return E.abort()},getJSON:function(e,t,n){return p.get(e,t,n,"json")},getScript:function(e,t){return p.get(e,undefined,t,"script")}}),p.each(["get","post"],function(e,t){p[t]=function(e,n,r,i){return p.isFunction(n)&&(i=i||r,r=n,n=undefined),p.ajax({url:e,type:t,dataType:i,data:n,success:r})}}),p.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){p.fn[t]=function(e){return this.on(t,e)}}),p._evalUrl=function(e){return p.ajax({url:e,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},p.fn.extend({wrapAll:function(e){if(p.isFunction(e))return this.each(function(t){p(this).wrapAll(e.call(this,t))});if(this[0]){var t=p(e,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstChild&&e.firstChild.nodeType===1)e=e.firstChild;return e}).append(this)}return this},wrapInner:function(e){return p.isFunction(e)?this.each(function(t){p(this).wrapInner(e.call(this,t))}):this.each(function(){var t=p(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=p.isFunction(e);return this.each(function(n){p(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){p.nodeName(this,"body")||p(this).replaceWith(this.childNodes)}).end()}}),p.expr.filters.hidden=function(e){return e.offsetWidth<=0&&e.offsetHeight<=0||!c.reliableHiddenOffsets()&&(e.style&&e.style.display||p.css(e,"display"))==="none"},p.expr.filters.visible=function(e){return!p.expr.filters.hidden(e)};var Wn=/%20/g,Xn=/\[\]$/,Vn=/\r?\n/g,$n=/^(?:submit|button|image|reset|file)$/i,Jn=/^(?:input|select|textarea|keygen)/i;p.param=function(e,t){var n,r=[],i=function(e,t){t=p.isFunction(t)?t():t==null?"":t,r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};t===undefined&&(t=p.ajaxSettings&&p.ajaxSettings.traditional);if(p.isArray(e)||e.jquery&&!p.isPlainObject(e))p.each(e,function(){i(this.name,this.value)});else for(n in e)Kn(n,e[n],t,i);return r.join("&").replace(Wn,"+")},p.fn.extend({serialize:function(){return p.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=p.prop(this,"elements");return e?p.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!p(this).is(":disabled")&&Jn.test(this.nodeName)&&!$n.test(e)&&(this.checked||!K.test(e))}).map(function(e,t){var n=p(this).val();return n==null?null:p.isArray(n)?p.map(n,function(e){return{name:t.name,value:e.replace(Vn,"\r\n")}}):{name:t.name,value:n.replace(Vn,"\r\n")}}).get()}}),p.ajaxSettings.xhr=e.ActiveXObject!==undefined?function(){return!this.isLocal&&/^(get|post|head|put|delete|options)$/i.test(this.type)&&Zn()||er()}:Zn;var Qn=0,Gn={},Yn=p.ajaxSettings.xhr();e.ActiveXObject&&p(e).on("unload",function(){for(var e in Gn)Gn[e](undefined,!0)}),c.cors=!!Yn&&"withCredentials"in Yn,Yn=c.ajax=!!Yn,Yn&&p.ajaxTransport(function(e){if(!e.crossDomain||c.cors){var t;return{send:function(n,r){var i,s=e.xhr(),o=++Qn;s.open(e.type,e.url,e.async,e.username,e.password);if(e.xhrFields)for(i in e.xhrFields)s[i]=e.xhrFields[i];e.mimeType&&s.overrideMimeType&&s.overrideMimeType(e.mimeType),!e.crossDomain&&!n["X-Requested-With"]&&(n["X-Requested-With"]="XMLHttpRequest");for(i in n)n[i]!==undefined&&s.setRequestHeader(i,n[i]+"");s.send(e.hasContent&&e.data||null),t=function(n,i){var u,a,f;if(t&&(i||s.readyState===4)){delete Gn[o],t=undefined,s.onreadystatechange=p.noop;if(i)s.readyState!==4&&s.abort();else{f={},u=s.status,typeof s.responseText=="string"&&(f.text=s.responseText);try{a=s.statusText}catch(l){a=""}!u&&e.isLocal&&!e.crossDomain?u=f.text?200:404:u===1223&&(u=204)}}f&&r(u,a,f,s.getAllResponseHeaders())},e.async?s.readyState===4?setTimeout(t):s.onreadystatechange=Gn[o]=t:t()},abort:function(){t&&t(undefined,!0)}}}}),p.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(e){return p.globalEval(e),e}}}),p.ajaxPrefilter("script",function(e){e.cache===undefined&&(e.cache=!1),e.crossDomain&&(e.type="GET",e.global=!1)}),p.ajaxTransport("script",function(e){if(e.crossDomain){var t,n=N.head||p("head")[0]||N.documentElement;return{send:function(r,i){t=N.createElement("script"),t.async=!0,e.scriptCharset&&(t.charset=e.scriptCharset),t.src=e.url,t.onload=t.onreadystatechange=function(e,n){if(n||!t.readyState||/loaded|complete/.test(t.readyState))t.onload=t.onreadystatechange=null,t.parentNode&&t.parentNode.removeChild(t),t=null,n||i(200,"success")},n.insertBefore(t,n.firstChild)},abort:function(){t&&t.onload(undefined,!0)}}}});var tr=[],nr=/(=)\?(?=&|$)|\?\?/;p.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=tr.pop()||p.expando+"_"+xn++;return this[e]=!0,e}}),p.ajaxPrefilter("json jsonp",function(t,n,r){var i,s,o,u=t.jsonp!==!1&&(nr.test(t.url)?"url":typeof t.data=="string"&&!(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&nr.test(t.data)&&"data");if(u||t.dataTypes[0]==="jsonp")return i=t.jsonpCallback=p.isFunction(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,u?t[u]=t[u].replace(nr,"$1"+i):t.jsonp!==!1&&(t.url+=(Tn.test(t.url)?"&":"?")+t.jsonp+"="+i),t.converters["script json"]=function(){return o||p.error(i+" was not called"),o[0]},t.dataTypes[0]="json",s=e[i],e[i]=function(){o=arguments},r.always(function(){e[i]=s,t[i]&&(t.jsonpCallback=n.jsonpCallback,tr.push(i)),o&&p.isFunction(s)&&s(o[0]),o=s=undefined}),"script"}),p.parseHTML=function(e,t,n){if(!e||typeof e!="string")return null;typeof t=="boolean"&&(n=t,t=!1),t=t||N;var r=E.exec(e),i=!n&&[];return r?[t.createElement(r[1])]:(r=p.buildFragment([e],t,i),i&&i.length&&p(i).remove(),p.merge([],r.childNodes))};var rr=p.fn.load;p.fn.load=function(e,t,n){if(typeof e!="string"&&rr)return rr.apply(this,arguments);var r,i,s,o=this,u=e.indexOf(" ");return u>=0&&(r=e.slice(u,e.length),e=e.slice(0,u)),p.isFunction(t)?(n=t,t=undefined):t&&typeof t=="object"&&(s="POST"),o.length>0&&p.ajax({url:e,type:s,dataType:"html",data:t}).done(function(e){i=arguments,o.html(r?p("<div>").append(p.parseHTML(e)).find(r):e)}).complete(n&&function(e,t){o.each(n,i||[e.responseText,t,e])}),this},p.expr.filters.animated=function(e){return p.grep(p.timers,function(t){return e===t.elem}).length};var ir=e.document.documentElement;p.offset={setOffset:function(e,t,n){var r,i,s,o,u,a,f,l=p.css(e,"position"),c=p(e),h={};l==="static"&&(e.style.position="relative"),u=c.offset(),s=p.css(e,"top"),a=p.css(e,"left"),f=(l==="absolute"||l==="fixed")&&p.inArray("auto",[s,a])>-1,f?(r=c.position(),o=r.top,i=r.left):(o=parseFloat(s)||0,i=parseFloat(a)||0),p.isFunction(t)&&(t=t.call(e,n,u)),t.top!=null&&(h.top=t.top-u.top+o),t.left!=null&&(h.left=t.left-u.left+i),"using"in t?t.using.call(e,h):c.css(h)}},p.fn.extend({offset:function(e){if(arguments.length)return e===undefined?this:this.each(function(t){p.offset.setOffset(this,e,t)});var t,n,r={top:0,left:0},i=this[0],s=i&&i.ownerDocument;if(!s)return;return t=s.documentElement,p.contains(t,i)?(typeof i.getBoundingClientRect!==j&&(r=i.getBoundingClientRect()),n=sr(s),{top:r.top+(n.pageYOffset||t.scrollTop)-(t.clientTop||0),left:r.left+(n.pageXOffset||t.scrollLeft)-(t.clientLeft||0)}):r},position:function(){if(!this[0])return;var e,t,n={top:0,left:0},r=this[0];return p.css(r,"position")==="fixed"?t=r.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),p.nodeName(e[0],"html")||(n=e.offset()),n.top+=p.css(e[0],"borderTopWidth",!0),n.left+=p.css(e[0],"borderLeftWidth",!0)),{top:t.top-n.top-p.css(r,"marginTop",!0),left:t.left-n.left-p.css(r,"marginLeft",!0)}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||ir;while(e&&!p.nodeName(e,"html")&&p.css(e,"position")==="static")e=e.offsetParent;return e||ir})}}),p.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var n=/Y/.test(t);p.fn[e]=function(r){return J(this,function(e,r,i){var s=sr(e);if(i===undefined)return s?t in s?s[t]:s.document.documentElement[r]:e[r];s?s.scrollTo(n?p(s).scrollLeft():i,n?i:p(s).scrollTop()):e[r]=i},e,r,arguments.length,null)}}),p.each(["top","left"],function(e,t){p.cssHooks[t]=Ft(c.pixelPosition,function(e,n){if(n)return n=Bt(e,t),Pt.test(n)?p(e).position()[t]+"px":n})}),p.each({Height:"height",Width:"width"},function(e,t){p.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){p.fn[r]=function(r,i){var s=arguments.length&&(n||typeof r!="boolean"),o=n||(r===!0||i===!0?"margin":"border");return J(this,function(t,n,r){var i;return p.isWindow(t)?t.document.documentElement["client"+e]:t.nodeType===9?(i=t.documentElement,Math.max(t.body["scroll"+e],i["scroll"+e],t.body["offset"+e],i["offset"+e],i["client"+e])):r===undefined?p.css(t,n,o):p.style(t,n,r,o)},t,s?r:undefined,s,null)}})}),p.fn.size=function(){return this.length},p.fn.andSelf=p.fn.addBack,typeof define=="function"&&define.amd&&define("jquery",[],function(){return p});var or=e.jQuery,ur=e.$;return p.noConflict=function(t){return e.$===p&&(e.$=ur),t&&e.jQuery===p&&(e.jQuery=or),p},typeof t===j&&(e.jQuery=e.$=p),p});
!function(a,b){"function"==typeof define&&(define.amd||define.cmd)?define(function(){return b(a)}):b(a,!0)}(this,function(a,b){function c(b,c,d){a.WeixinJSBridge?WeixinJSBridge.invoke(b,e(c),function(a){g(b,a,d)}):j(b,d)}function d(b,c,d){a.WeixinJSBridge?WeixinJSBridge.on(b,function(a){d&&d.trigger&&d.trigger(a),g(b,a,c)}):d?j(b,d):j(b,c)}function e(a){return a=a||{},a.appId=z.appId,a.verifyAppId=z.appId,a.verifySignType="sha1",a.verifyTimestamp=z.timestamp+"",a.verifyNonceStr=z.nonceStr,a.verifySignature=z.signature,a}function f(a){return{timeStamp:a.timestamp+"",nonceStr:a.nonceStr,"package":a.package,paySign:a.paySign,signType:a.signType||"SHA1"}}function g(a,b,c){var d,e,f;switch(delete b.err_code,delete b.err_desc,delete b.err_detail,d=b.errMsg,d||(d=b.err_msg,delete b.err_msg,d=h(a,d,c),b.errMsg=d),c=c||{},c._complete&&(c._complete(b),delete c._complete),d=b.errMsg||"",z.debug&&!c.isInnerInvoke&&alert(JSON.stringify(b)),e=d.indexOf(":"),f=d.substring(e+1)){case"ok":c.success&&c.success(b);break;case"cancel":c.cancel&&c.cancel(b);break;default:c.fail&&c.fail(b)}c.complete&&c.complete(b)}function h(a,b){var d,e,f,g;if(b){switch(d=b.indexOf(":"),a){case o.config:e="config";break;case o.openProductSpecificView:e="openProductSpecificView";break;default:e=b.substring(0,d),e=e.replace(/_/g," "),e=e.replace(/\b\w+\b/g,function(a){return a.substring(0,1).toUpperCase()+a.substring(1)}),e=e.substring(0,1).toLowerCase()+e.substring(1),e=e.replace(/ /g,""),-1!=e.indexOf("Wcpay")&&(e=e.replace("Wcpay","WCPay")),f=p[e],f&&(e=f)}g=b.substring(d+1),"confirm"==g&&(g="ok"),"failed"==g&&(g="fail"),-1!=g.indexOf("failed_")&&(g=g.substring(7)),-1!=g.indexOf("fail_")&&(g=g.substring(5)),g=g.replace(/_/g," "),g=g.toLowerCase(),("access denied"==g||"no permission to execute"==g)&&(g="permission denied"),"config"==e&&"function not exist"==g&&(g="ok"),b=e+":"+g}return b}function i(a){var b,c,d,e;if(a){for(b=0,c=a.length;c>b;++b)d=a[b],e=o[d],e&&(a[b]=e);return a}}function j(a,b){if(z.debug&&!b.isInnerInvoke){var c=p[a];c&&(a=c),b&&b._complete&&delete b._complete,console.log('"'+a+'",',b||"")}}function k(){if(!("6.0.2">w||y.systemType<0)){var b=new Image;y.appId=z.appId,y.initTime=x.initEndTime-x.initStartTime,y.preVerifyTime=x.preVerifyEndTime-x.preVerifyStartTime,C.getNetworkType({isInnerInvoke:!0,success:function(a){y.networkType=a.networkType;var c="https://open.weixin.qq.com/sdk/report?v="+y.version+"&o="+y.isPreVerifyOk+"&s="+y.systemType+"&c="+y.clientVersion+"&a="+y.appId+"&n="+y.networkType+"&i="+y.initTime+"&p="+y.preVerifyTime+"&u="+y.url;b.src=c}})}}function l(){return(new Date).getTime()}function m(b){t&&(a.WeixinJSBridge?b():q.addEventListener&&q.addEventListener("WeixinJSBridgeReady",b,!1))}function n(){C.invoke||(C.invoke=function(b,c,d){a.WeixinJSBridge&&WeixinJSBridge.invoke(b,e(c),d)},C.on=function(b,c){a.WeixinJSBridge&&WeixinJSBridge.on(b,c)})}var o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;if(!a.jWeixin)return o={config:"preVerifyJSAPI",onMenuShareTimeline:"menu:share:timeline",onMenuShareAppMessage:"menu:share:appmessage",onMenuShareQQ:"menu:share:qq",onMenuShareWeibo:"menu:share:weiboApp",previewImage:"imagePreview",getLocation:"geoLocation",openProductSpecificView:"openProductViewWithPid",addCard:"batchAddCard",openCard:"batchViewCard",chooseWXPay:"getBrandWCPayRequest"},p=function(){var b,a={};for(b in o)a[o[b]]=b;return a}(),q=a.document,r=q.title,s=navigator.userAgent.toLowerCase(),t=-1!=s.indexOf("micromessenger"),u=-1!=s.indexOf("android"),v=-1!=s.indexOf("iphone")||-1!=s.indexOf("ipad"),w=function(){var a=s.match(/micromessenger\/(\d+\.\d+\.\d+)/)||s.match(/micromessenger\/(\d+\.\d+)/);return a?a[1]:""}(),x={initStartTime:l(),initEndTime:0,preVerifyStartTime:0,preVerifyEndTime:0},y={version:1,appId:"",initTime:0,preVerifyTime:0,networkType:"",isPreVerifyOk:1,systemType:v?1:u?2:-1,clientVersion:w,url:encodeURIComponent(location.href)},z={},A={_completes:[]},B={state:0,res:{}},m(function(){x.initEndTime=l()}),C={config:function(a){z=a,j("config",a);var b=z.check===!1?!1:!0;m(function(){var a,d,e;if(b)c(o.config,{verifyJsApiList:i(z.jsApiList)},function(){A._complete=function(a){x.preVerifyEndTime=l(),B.state=1,B.res=a},A.success=function(){y.isPreVerifyOk=0},A.fail=function(a){A._fail?A._fail(a):B.state=-1};var a=A._completes;return a.push(function(){z.debug||k()}),A.complete=function(){for(var c=0,d=a.length;d>c;++c)a[c]();A._completes=[]},A}()),x.preVerifyStartTime=l();else{for(B.state=1,a=A._completes,d=0,e=a.length;e>d;++d)a[d]();A._completes=[]}}),z.beta&&n()},ready:function(a){0!=B.state?a():(A._completes.push(a),!t&&z.debug&&a())},error:function(a){"6.0.2">w||(-1==B.state?a(B.res):A._fail=a)},checkJsApi:function(a){var b=function(a){var c,d,b=a.checkResult;for(c in b)d=p[c],d&&(b[d]=b[c],delete b[c]);return a};c("checkJsApi",{jsApiList:i(a.jsApiList)},function(){return a._complete=function(a){if(u){var c=a.checkResult;c&&(a.checkResult=JSON.parse(c))}a=b(a)},a}())},onMenuShareTimeline:function(a){d(o.onMenuShareTimeline,{complete:function(){c("shareTimeline",{title:a.title||r,desc:a.title||r,img_url:a.imgUrl,link:a.link||location.href},a)}},a)},onMenuShareAppMessage:function(a){d(o.onMenuShareAppMessage,{complete:function(){c("sendAppMessage",{title:a.title||r,desc:a.desc||"",link:a.link||location.href,img_url:a.imgUrl,type:a.type||"link",data_url:a.dataUrl||""},a)}},a)},onMenuShareQQ:function(a){d(o.onMenuShareQQ,{complete:function(){c("shareQQ",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl,link:a.link||location.href},a)}},a)},onMenuShareWeibo:function(a){d(o.onMenuShareWeibo,{complete:function(){c("shareWeiboApp",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl,link:a.link||location.href},a)}},a)},startRecord:function(a){c("startRecord",{},a)},stopRecord:function(a){c("stopRecord",{},a)},onVoiceRecordEnd:function(a){d("onVoiceRecordEnd",a)},playVoice:function(a){c("playVoice",{localId:a.localId},a)},pauseVoice:function(a){c("pauseVoice",{localId:a.localId},a)},stopVoice:function(a){c("stopVoice",{localId:a.localId},a)},onVoicePlayEnd:function(a){d("onVoicePlayEnd",a)},uploadVoice:function(a){c("uploadVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadVoice:function(a){c("downloadVoice",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},translateVoice:function(a){c("translateVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},chooseImage:function(a){c("chooseImage",{scene:"1|2",count:a.count||9,sizeType:a.sizeType||["original","compressed"]},function(){return a._complete=function(a){if(u){var b=a.localIds;b&&(a.localIds=JSON.parse(b))}},a}())},previewImage:function(a){c(o.previewImage,{current:a.current,urls:a.urls},a)},uploadImage:function(a){c("uploadImage",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadImage:function(a){c("downloadImage",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},getNetworkType:function(a){var b=function(a){var c,d,e,b=a.errMsg;if(a.errMsg="getNetworkType:ok",c=a.subtype,delete a.subtype,c)a.networkType=c;else switch(d=b.indexOf(":"),e=b.substring(d+1)){case"wifi":case"edge":case"wwan":a.networkType=e;break;default:a.errMsg="getNetworkType:fail"}return a};c("getNetworkType",{},function(){return a._complete=function(a){a=b(a)},a}())},openLocation:function(a){c("openLocation",{latitude:a.latitude,longitude:a.longitude,name:a.name||"",address:a.address||"",scale:a.scale||28,infoUrl:a.infoUrl||""},a)},getLocation:function(a){a=a||{},c(o.getLocation,{type:a.type||"wgs84"},function(){return a._complete=function(a){delete a.type},a}())},hideOptionMenu:function(a){c("hideOptionMenu",{},a)},showOptionMenu:function(a){c("showOptionMenu",{},a)},closeWindow:function(a){a=a||{},c("closeWindow",{immediate_close:a.immediateClose||0},a)},hideMenuItems:function(a){c("hideMenuItems",{menuList:a.menuList},a)},showMenuItems:function(a){c("showMenuItems",{menuList:a.menuList},a)},hideAllNonBaseMenuItem:function(a){c("hideAllNonBaseMenuItem",{},a)},showAllNonBaseMenuItem:function(a){c("showAllNonBaseMenuItem",{},a)},scanQRCode:function(a){a=a||{},c("scanQRCode",{needResult:a.needResult||0,scanType:a.scanType||["qrCode","barCode"]},function(){return a._complete=function(a){var b,c;v&&(b=a.resultStr,b&&(c=JSON.parse(b),a.resultStr=c&&c.scan_code&&c.scan_code.scan_result))},a}())},openProductSpecificView:function(a){c(o.openProductSpecificView,{pid:a.productId,view_type:a.viewType||0},a)},addCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,card_ext:g.cardExt},d.push(h);c(o.addCard,{card_list:d},function(){return a._complete=function(a){var c,d,e,b=a.card_list;if(b){for(b=JSON.parse(b),c=0,d=b.length;d>c;++c)e=b[c],e.cardId=e.card_id,e.cardExt=e.card_ext,e.isSuccess=e.is_succ?!0:!1,delete e.card_id,delete e.card_ext,delete e.is_succ;a.cardList=b,delete a.card_list}},a}())},chooseCard:function(a){c("chooseCard",{app_id:z.appId,location_id:a.shopId||"",sign_type:a.signType||"SHA1",card_id:a.cardId||"",card_type:a.cardType||"",card_sign:a.cardSign,time_stamp:a.timestamp+"",nonce_str:a.nonceStr},function(){return a._complete=function(a){a.cardList=a.choose_card_info,delete a.choose_card_info},a}())},openCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,code:g.code},d.push(h);c(o.openCard,{card_list:d},a)},chooseWXPay:function(a){c(o.chooseWXPay,f(a),a)}},b&&(a.wx=a.jWeixin=C),C});

var loadingFun = function(imgSrcArr){

		$("#dreambox img").each(function(){ 
			imgSrcArr.push($(this).attr("sourcesrc")) 
		})

		function LoadFn ( arr , fn , fn2){
				var loader = new PxLoader();
				for( var i = 0 ; i < arr.length; i ++)
				{
					loader.addImage(arr[i]);
				};
				
				loader.addProgressListener(function(e) {
						var percent = Math.round( e.completedCount / e.totalCount * 100 );
						if(fn2) fn2(percent)
				});	
				
				
				loader.addCompletionListener( function(){
					if(fn) fn();	
				});
				loader.start();	
		}



		LoadFn(imgSrcArr , function (){
			$("#dreambox img").each(function(){ 
				$(this).attr("src",$(this).attr("sourcesrc"));
			})
			$(".loading").hide();
			$("#dreambox").animate({"opacity" : 1});	
			wechatFun();
		    console.log("加载完成!");
		} , function ( p ){
			$('.loading_con p').html(p+"%");
		});

};

;(function($){
    $(function(){

		$(".nav_icon").click(function(){
			$("#navLevel").removeClass('page-prev').addClass('page-active page-in');
		})

		$(".close").click(function(){
			$("#navLevel").removeClass('page-active').addClass('page-prev page-out');
		})

	})
})(jQuery);
var shareData = {
    title: '第一章：路易威登基金会▪起航',
    desc: '艺术与建筑的碰撞，一个美梦成真的故事',
    link: window.location.host + "/fondation",
    imgUrl: 'http://' + window.location.host + '/images/share.jpg',
    returnFun: function(){
        //alert(6);
    }
};



function wechatFun(){
    $.ajax({
        type: "GET",
        url: "/same/wechat/jssdk",
        data: {
            "url": window.location.href
        },
        dataType:"json"
    }).done(function(data){
            wechatShare(data.appId,data.time,data.noncestr,data.sign);
    }).fail(function() {
        console.log("请求接口失败！");
    });
}



function wechatShare(appid,timestamp_val,noncestr,signature_val){

  wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: appid, // 必填，公众号的唯一标识
      timestamp: timestamp_val, // 必填，生成签名的时间戳
      nonceStr: noncestr, // 必填，生成签名的随机串
      signature: signature_val,// 必填，签名，见附录1
      jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
      ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  });

  wx.ready(function(){


    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    wx.onMenuShareTimeline({
        title: shareData.title, // 分享标题
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
            if(GetQueryString()!=null && GetQueryString()=="share"){
                if($("#share").attr("data-hasinfo")==1){
                    pagechange.moveClick('view')
                }else{
                    pagechange.moveClick('form');
                } 
            }
            
            shareData.returnFun();
            //alert('分享成功');
        },
        cancel: function () { 
            // 用户取消分享后执行的回调函数
            // alert("分享失败")
        }
    });
    
    
    wx.onMenuShareAppMessage({
        title: shareData.title, // 分享标题
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        desc: shareData.desc,
        success: function () { 
            // 用户确认分享后执行的回调函数

            if(GetQueryString()!=null && GetQueryString()=="share"){
                if($("#share").attr("data-hasinfo")==1){
                    pagechange.moveClick('view')
                }else{
                    pagechange.moveClick('form');
                } 
            }

            shareData.returnFun();
            //alert('分享成功');
        },
        cancel: function () { 
            // 用户取消分享后执行的回调函数
            // alert("分享失败")
        }
    });
      
  });

  wx.error(function(res){
    //alert("无法使用微信JS")
    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

  });

}











function editShare(){   ///demon
     wx.onMenuShareTimeline({
            title: shareData.title, // 分享标题
            link: shareData.link, // 分享链接
            imgUrl: shareData.imgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数

               if(GetQueryString()!=null && GetQueryString()=="share"){
                    if($("#share").attr("data-hasinfo")==1){
                        pagechange.moveClick('view')
                    }else{
                        pagechange.moveClick('form');
                    } 
                }

                shareData.returnFun();
                
                //alert('分享成功');
            },
            cancel: function () { 
                // 用户取消分享后执行的回调函数
                // alert("分享失败")
            }
        });
        
        
        wx.onMenuShareAppMessage({
            title: shareData.title, // 分享标题
            link: shareData.link, // 分享链接
            imgUrl: shareData.imgUrl, // 分享图标
            desc: shareData.desc,
            success: function () { 
                // 用户确认分享后执行的回调函数

                if(GetQueryString()!=null && GetQueryString()=="share"){
                    if($("#share").attr("data-hasinfo")==1){
                        pagechange.moveClick('view')
                    }else{
                        pagechange.moveClick('form');
                    } 
                }

                shareData.returnFun();

                //alert('分享成功');
            },
            cancel: function () { 
                // 用户取消分享后执行的回调函数
               // alert("分享失败")
            }
        });
}

















var glassList = [
        {
            "id": "0",
            "pic_thumbnail": "/images/ugc/glass-0.jpg"
        },
        {
            "id": "1",
            "pic_thumbnail": "/images/ugc/glass-1.jpg"
        },
        {
            "id": "2",
            "pic_thumbnail": "/images/ugc/glass-2.jpg"
        },
        {
            "id": "3",
            "pic_thumbnail": "/images/ugc/glass-3.jpg"
        },
        {
            "id": "4",
            "pic_thumbnail": "/images/ugc/glass-4.jpg"
        },
        {
            "id": "5",
            "pic_thumbnail": "/images/ugc/glass-5.jpg"
        }
]
/**
 * Swiper 3.0.7
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: April 25, 2015
 */
!function(){"use strict";function e(e){e.fn.swiper=function(t){var r;return e(this).each(function(){var e=new a(this,t);r||(r=e)}),r}}var a=function(e,r){function s(){return"horizontal"===g.params.direction}function i(){g.autoplayTimeoutId=setTimeout(function(){g.params.loop?(g.fixLoop(),g._slideNext()):g.isEnd?r.autoplayStopOnLast?g.stopAutoplay():g._slideTo(0):g._slideNext()},g.params.autoplay)}function n(e,a){var t=v(e.target);if(!t.is(a))if("string"==typeof a)t=t.parents(a);else if(a.nodeType){var r;return t.parents().each(function(e,t){t===a&&(r=a)}),r?a:void 0}return 0===t.length?void 0:t[0]}function o(e,a){a=a||{};var t=window.MutationObserver||window.WebkitMutationObserver,r=new t(function(e){e.forEach(function(e){g.onResize(!0),g.emit("onObserverUpdate",g,e)})});r.observe(e,{attributes:"undefined"==typeof a.attributes?!0:a.attributes,childList:"undefined"==typeof a.childList?!0:a.childList,characterData:"undefined"==typeof a.characterData?!0:a.characterData}),g.observers.push(r)}function l(e){e.originalEvent&&(e=e.originalEvent);var a=e.keyCode||e.charCode;if(!g.params.allowSwipeToNext&&(s()&&39===a||!s()&&40===a))return!1;if(!g.params.allowSwipeToPrev&&(s()&&37===a||!s()&&38===a))return!1;if(!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||document.activeElement&&document.activeElement.nodeName&&("input"===document.activeElement.nodeName.toLowerCase()||"textarea"===document.activeElement.nodeName.toLowerCase()))){if(37===a||39===a||38===a||40===a){var t=!1;if(g.container.parents(".swiper-slide").length>0&&0===g.container.parents(".swiper-slide-active").length)return;for(var r={left:window.pageXOffset,top:window.pageYOffset},i=window.innerWidth,n=window.innerHeight,o=g.container.offset(),l=[[o.left,o.top],[o.left+g.width,o.top],[o.left,o.top+g.height],[o.left+g.width,o.top+g.height]],d=0;d<l.length;d++){var p=l[d];p[0]>=r.left&&p[0]<=r.left+i&&p[1]>=r.top&&p[1]<=r.top+n&&(t=!0)}if(!t)return}s()?((37===a||39===a)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),39===a&&g.slideNext(),37===a&&g.slidePrev()):((38===a||40===a)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),40===a&&g.slideNext(),38===a&&g.slidePrev())}}function d(e){e.originalEvent&&(e=e.originalEvent);var a=g._wheelEvent,t=0;if(e.detail)t=-e.detail;else if("mousewheel"===a)if(g.params.mousewheelForceToAxis)if(s()){if(!(Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY)))return;t=e.wheelDeltaX}else{if(!(Math.abs(e.wheelDeltaY)>Math.abs(e.wheelDeltaX)))return;t=e.wheelDeltaY}else t=e.wheelDelta;else if("DOMMouseScroll"===a)t=-e.detail;else if("wheel"===a)if(g.params.mousewheelForceToAxis)if(s()){if(!(Math.abs(e.deltaX)>Math.abs(e.deltaY)))return;t=-e.deltaX}else{if(!(Math.abs(e.deltaY)>Math.abs(e.deltaX)))return;t=-e.deltaY}else t=Math.abs(e.deltaX)>Math.abs(e.deltaY)?-e.deltaX:-e.deltaY;if(g.params.freeMode){var r=g.getWrapperTranslate()+t;if(r>0&&(r=0),r<g.maxTranslate()&&(r=g.maxTranslate()),g.setWrapperTransition(0),g.setWrapperTranslate(r),g.updateProgress(),g.updateActiveIndex(),0===r||r===g.maxTranslate())return}else(new window.Date).getTime()-g._lastWheelScrollTime>60&&(0>t?g.slideNext():g.slidePrev()),g._lastWheelScrollTime=(new window.Date).getTime();return g.params.autoplay&&g.stopAutoplay(),e.preventDefault?e.preventDefault():e.returnValue=!1,!1}function p(e,a){e=v(e);var t,r,i;t=e.attr("data-swiper-parallax")||"0",r=e.attr("data-swiper-parallax-x"),i=e.attr("data-swiper-parallax-y"),r||i?(r=r||"0",i=i||"0"):s()?(r=t,i="0"):(i=t,r="0"),r=r.indexOf("%")>=0?parseInt(r,10)*a+"%":r*a+"px",i=i.indexOf("%")>=0?parseInt(i,10)*a+"%":i*a+"px",e.transform("translate3d("+r+", "+i+",0px)")}function u(e){return 0!==e.indexOf("on")&&(e=e[0]!==e[0].toUpperCase()?"on"+e[0].toUpperCase()+e.substring(1):"on"+e),e}if(!(this instanceof a))return new a(e,r);var c={direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,autoplay:!1,autoplayDisableOnInteraction:!0,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,freeModeSticky:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0},cube:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94},fade:{crossFade:!1},parallax:!1,scrollbar:null,scrollbarHide:!0,keyboardControl:!1,mousewheelControl:!1,mousewheelForceToAxis:!1,hashnav:!1,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,onlyExternal:!1,threshold:0,touchMoveStopPropagation:!0,pagination:null,paginationClickable:!1,paginationHide:!1,paginationBulletRender:null,resistance:!0,resistanceRatio:.85,nextButton:null,prevButton:null,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,lazyLoading:!1,lazyLoadingInPrevNext:!1,lazyLoadingOnTransitionStart:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,control:void 0,controlInverse:!1,allowSwipeToPrev:!0,allowSwipeToNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",slideClass:"swiper-slide",slideActiveClass:"swiper-slide-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slidePrevClass:"swiper-slide-prev",wrapperClass:"swiper-wrapper",bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",buttonDisabledClass:"swiper-button-disabled",paginationHiddenClass:"swiper-pagination-hidden",observer:!1,observeParents:!1,a11y:!1,prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",runCallbacksOnInit:!0},m=r&&r.virtualTranslate;r=r||{};for(var f in c)if("undefined"==typeof r[f])r[f]=c[f];else if("object"==typeof r[f])for(var h in c[f])"undefined"==typeof r[f][h]&&(r[f][h]=c[f][h]);var g=this;g.version="3.0.7",g.params=r,g.classNames=[];var v;if(v="undefined"==typeof t?window.Dom7||window.Zepto||window.jQuery:t,v&&(g.$=v,g.container=v(e),0!==g.container.length)){if(g.container.length>1)return void g.container.each(function(){new a(this,r)});g.container[0].swiper=g,g.container.data("swiper",g),g.classNames.push("swiper-container-"+g.params.direction),g.params.freeMode&&g.classNames.push("swiper-container-free-mode"),g.support.flexbox||(g.classNames.push("swiper-container-no-flexbox"),g.params.slidesPerColumn=1),(g.params.parallax||g.params.watchSlidesVisibility)&&(g.params.watchSlidesProgress=!0),["cube","coverflow"].indexOf(g.params.effect)>=0&&(g.support.transforms3d?(g.params.watchSlidesProgress=!0,g.classNames.push("swiper-container-3d")):g.params.effect="slide"),"slide"!==g.params.effect&&g.classNames.push("swiper-container-"+g.params.effect),"cube"===g.params.effect&&(g.params.resistanceRatio=0,g.params.slidesPerView=1,g.params.slidesPerColumn=1,g.params.slidesPerGroup=1,g.params.centeredSlides=!1,g.params.spaceBetween=0,g.params.virtualTranslate=!0,g.params.setWrapperSize=!1),"fade"===g.params.effect&&(g.params.slidesPerView=1,g.params.slidesPerColumn=1,g.params.slidesPerGroup=1,g.params.watchSlidesProgress=!0,g.params.spaceBetween=0,"undefined"==typeof m&&(g.params.virtualTranslate=!0)),g.params.grabCursor&&g.support.touch&&(g.params.grabCursor=!1),g.wrapper=g.container.children("."+g.params.wrapperClass),g.params.pagination&&(g.paginationContainer=v(g.params.pagination),g.params.paginationClickable&&g.paginationContainer.addClass("swiper-pagination-clickable")),g.rtl=s()&&("rtl"===g.container[0].dir.toLowerCase()||"rtl"===g.container.css("direction")),g.rtl&&g.classNames.push("swiper-container-rtl"),g.rtl&&(g.wrongRTL="-webkit-box"===g.wrapper.css("display")),g.params.slidesPerColumn>1&&g.classNames.push("swiper-container-multirow"),g.device.android&&g.classNames.push("swiper-container-android"),g.container.addClass(g.classNames.join(" ")),g.translate=0,g.progress=0,g.velocity=0,g.lockSwipeToNext=function(){g.params.allowSwipeToNext=!1},g.lockSwipeToPrev=function(){g.params.allowSwipeToPrev=!1},g.lockSwipes=function(){g.params.allowSwipeToNext=g.params.allowSwipeToPrev=!1},g.unlockSwipeToNext=function(){g.params.allowSwipeToNext=!0},g.unlockSwipeToPrev=function(){g.params.allowSwipeToPrev=!0},g.unlockSwipes=function(){g.params.allowSwipeToNext=g.params.allowSwipeToPrev=!0},g.params.grabCursor&&(g.container[0].style.cursor="move",g.container[0].style.cursor="-webkit-grab",g.container[0].style.cursor="-moz-grab",g.container[0].style.cursor="grab"),g.imagesToLoad=[],g.imagesLoaded=0,g.loadImage=function(e,a,t,r){function s(){r&&r()}var i;e.complete&&t?s():a?(i=new window.Image,i.onload=s,i.onerror=s,i.src=a):s()},g.preloadImages=function(){function e(){"undefined"!=typeof g&&null!==g&&(void 0!==g.imagesLoaded&&g.imagesLoaded++,g.imagesLoaded===g.imagesToLoad.length&&(g.params.updateOnImagesReady&&g.update(),g.emit("onImagesReady",g)))}g.imagesToLoad=g.container.find("img");for(var a=0;a<g.imagesToLoad.length;a++)g.loadImage(g.imagesToLoad[a],g.imagesToLoad[a].currentSrc||g.imagesToLoad[a].getAttribute("src"),!0,e)},g.autoplayTimeoutId=void 0,g.autoplaying=!1,g.autoplayPaused=!1,g.startAutoplay=function(){return"undefined"!=typeof g.autoplayTimeoutId?!1:g.params.autoplay?g.autoplaying?!1:(g.autoplaying=!0,g.emit("onAutoplayStart",g),void i()):!1},g.stopAutoplay=function(e){g.autoplayTimeoutId&&(g.autoplayTimeoutId&&clearTimeout(g.autoplayTimeoutId),g.autoplaying=!1,g.autoplayTimeoutId=void 0,g.emit("onAutoplayStop",g))},g.pauseAutoplay=function(e){g.autoplayPaused||(g.autoplayTimeoutId&&clearTimeout(g.autoplayTimeoutId),g.autoplayPaused=!0,0===e?(g.autoplayPaused=!1,i()):g.wrapper.transitionEnd(function(){g&&(g.autoplayPaused=!1,g.autoplaying?i():g.stopAutoplay())}))},g.minTranslate=function(){return-g.snapGrid[0]},g.maxTranslate=function(){return-g.snapGrid[g.snapGrid.length-1]},g.updateContainerSize=function(){var e,a;e="undefined"!=typeof g.params.width?g.params.width:g.container[0].clientWidth,a="undefined"!=typeof g.params.height?g.params.height:g.container[0].clientHeight,0===e&&s()||0===a&&!s()||(g.width=e,g.height=a,g.size=s()?g.width:g.height)},g.updateSlidesSize=function(){g.slides=g.wrapper.children("."+g.params.slideClass),g.snapGrid=[],g.slidesGrid=[],g.slidesSizesGrid=[];var e,a=g.params.spaceBetween,t=0,r=0,i=0;"string"==typeof a&&a.indexOf("%")>=0&&(a=parseFloat(a.replace("%",""))/100*g.size),g.virtualSize=-a,g.slides.css(g.rtl?{marginLeft:"",marginTop:""}:{marginRight:"",marginBottom:""});var n;g.params.slidesPerColumn>1&&(n=Math.floor(g.slides.length/g.params.slidesPerColumn)===g.slides.length/g.params.slidesPerColumn?g.slides.length:Math.ceil(g.slides.length/g.params.slidesPerColumn)*g.params.slidesPerColumn);var o;for(e=0;e<g.slides.length;e++){o=0;var l=g.slides.eq(e);if(g.params.slidesPerColumn>1){var d,p,u,c,m=g.params.slidesPerColumn;"column"===g.params.slidesPerColumnFill?(p=Math.floor(e/m),u=e-p*m,d=p+u*n/m,l.css({"-webkit-box-ordinal-group":d,"-moz-box-ordinal-group":d,"-ms-flex-order":d,"-webkit-order":d,order:d})):(c=n/m,u=Math.floor(e/c),p=e-u*c),l.css({"margin-top":0!==u&&g.params.spaceBetween&&g.params.spaceBetween+"px"}).attr("data-swiper-column",p).attr("data-swiper-row",u)}"none"!==l.css("display")&&("auto"===g.params.slidesPerView?o=s()?l.outerWidth(!0):l.outerHeight(!0):(o=(g.size-(g.params.slidesPerView-1)*a)/g.params.slidesPerView,s()?g.slides[e].style.width=o+"px":g.slides[e].style.height=o+"px"),g.slides[e].swiperSlideSize=o,g.slidesSizesGrid.push(o),g.params.centeredSlides?(t=t+o/2+r/2+a,0===e&&(t=t-g.size/2-a),Math.abs(t)<.001&&(t=0),i%g.params.slidesPerGroup===0&&g.snapGrid.push(t),g.slidesGrid.push(t)):(i%g.params.slidesPerGroup===0&&g.snapGrid.push(t),g.slidesGrid.push(t),t=t+o+a),g.virtualSize+=o+a,r=o,i++)}g.virtualSize=Math.max(g.virtualSize,g.size);var f;if(g.rtl&&g.wrongRTL&&("slide"===g.params.effect||"coverflow"===g.params.effect)&&g.wrapper.css({width:g.virtualSize+g.params.spaceBetween+"px"}),(!g.support.flexbox||g.params.setWrapperSize)&&g.wrapper.css(s()?{width:g.virtualSize+g.params.spaceBetween+"px"}:{height:g.virtualSize+g.params.spaceBetween+"px"}),g.params.slidesPerColumn>1&&(g.virtualSize=(o+g.params.spaceBetween)*n,g.virtualSize=Math.ceil(g.virtualSize/g.params.slidesPerColumn)-g.params.spaceBetween,g.wrapper.css({width:g.virtualSize+g.params.spaceBetween+"px"}),g.params.centeredSlides)){for(f=[],e=0;e<g.snapGrid.length;e++)g.snapGrid[e]<g.virtualSize+g.snapGrid[0]&&f.push(g.snapGrid[e]);g.snapGrid=f}if(!g.params.centeredSlides){for(f=[],e=0;e<g.snapGrid.length;e++)g.snapGrid[e]<=g.virtualSize-g.size&&f.push(g.snapGrid[e]);g.snapGrid=f,Math.floor(g.virtualSize-g.size)>Math.floor(g.snapGrid[g.snapGrid.length-1])&&g.snapGrid.push(g.virtualSize-g.size)}0===g.snapGrid.length&&(g.snapGrid=[0]),0!==g.params.spaceBetween&&g.slides.css(s()?g.rtl?{marginLeft:a+"px"}:{marginRight:a+"px"}:{marginBottom:a+"px"}),g.params.watchSlidesProgress&&g.updateSlidesOffset()},g.updateSlidesOffset=function(){for(var e=0;e<g.slides.length;e++)g.slides[e].swiperSlideOffset=s()?g.slides[e].offsetLeft:g.slides[e].offsetTop},g.updateSlidesProgress=function(e){if("undefined"==typeof e&&(e=g.translate||0),0!==g.slides.length){"undefined"==typeof g.slides[0].swiperSlideOffset&&g.updateSlidesOffset();var a=g.params.centeredSlides?-e+g.size/2:-e;g.rtl&&(a=g.params.centeredSlides?e-g.size/2:e);{g.container[0].getBoundingClientRect(),s()?"left":"top",s()?"right":"bottom"}g.slides.removeClass(g.params.slideVisibleClass);for(var t=0;t<g.slides.length;t++){var r=g.slides[t],i=g.params.centeredSlides===!0?r.swiperSlideSize/2:0,n=(a-r.swiperSlideOffset-i)/(r.swiperSlideSize+g.params.spaceBetween);if(g.params.watchSlidesVisibility){var o=-(a-r.swiperSlideOffset-i),l=o+g.slidesSizesGrid[t],d=o>=0&&o<g.size||l>0&&l<=g.size||0>=o&&l>=g.size;d&&g.slides.eq(t).addClass(g.params.slideVisibleClass)}r.progress=g.rtl?-n:n}}},g.updateProgress=function(e){"undefined"==typeof e&&(e=g.translate||0);var a=g.maxTranslate()-g.minTranslate();0===a?(g.progress=0,g.isBeginning=g.isEnd=!0):(g.progress=(e-g.minTranslate())/a,g.isBeginning=g.progress<=0,g.isEnd=g.progress>=1),g.isBeginning&&g.emit("onReachBeginning",g),g.isEnd&&g.emit("onReachEnd",g),g.params.watchSlidesProgress&&g.updateSlidesProgress(e),g.emit("onProgress",g,g.progress)},g.updateActiveIndex=function(){var e,a,t,r=g.rtl?g.translate:-g.translate;for(a=0;a<g.slidesGrid.length;a++)"undefined"!=typeof g.slidesGrid[a+1]?r>=g.slidesGrid[a]&&r<g.slidesGrid[a+1]-(g.slidesGrid[a+1]-g.slidesGrid[a])/2?e=a:r>=g.slidesGrid[a]&&r<g.slidesGrid[a+1]&&(e=a+1):r>=g.slidesGrid[a]&&(e=a);(0>e||"undefined"==typeof e)&&(e=0),t=Math.floor(e/g.params.slidesPerGroup),t>=g.snapGrid.length&&(t=g.snapGrid.length-1),e!==g.activeIndex&&(g.snapIndex=t,g.previousIndex=g.activeIndex,g.activeIndex=e,g.updateClasses())},g.updateClasses=function(){g.slides.removeClass(g.params.slideActiveClass+" "+g.params.slideNextClass+" "+g.params.slidePrevClass);var e=g.slides.eq(g.activeIndex);if(e.addClass(g.params.slideActiveClass),e.next("."+g.params.slideClass).addClass(g.params.slideNextClass),e.prev("."+g.params.slideClass).addClass(g.params.slidePrevClass),g.bullets&&g.bullets.length>0){g.bullets.removeClass(g.params.bulletActiveClass);var a;g.params.loop?(a=Math.ceil(g.activeIndex-g.loopedSlides)/g.params.slidesPerGroup,a>g.slides.length-1-2*g.loopedSlides&&(a-=g.slides.length-2*g.loopedSlides),a>g.bullets.length-1&&(a-=g.bullets.length)):a="undefined"!=typeof g.snapIndex?g.snapIndex:g.activeIndex||0,g.paginationContainer.length>1?g.bullets.each(function(){v(this).index()===a&&v(this).addClass(g.params.bulletActiveClass)}):g.bullets.eq(a).addClass(g.params.bulletActiveClass)}g.params.loop||(g.params.prevButton&&(g.isBeginning?(v(g.params.prevButton).addClass(g.params.buttonDisabledClass),g.params.a11y&&g.a11y&&g.a11y.disable(v(g.params.prevButton))):(v(g.params.prevButton).removeClass(g.params.buttonDisabledClass),g.params.a11y&&g.a11y&&g.a11y.enable(v(g.params.prevButton)))),g.params.nextButton&&(g.isEnd?(v(g.params.nextButton).addClass(g.params.buttonDisabledClass),g.params.a11y&&g.a11y&&g.a11y.disable(v(g.params.nextButton))):(v(g.params.nextButton).removeClass(g.params.buttonDisabledClass),g.params.a11y&&g.a11y&&g.a11y.enable(v(g.params.nextButton)))))},g.updatePagination=function(){if(g.params.pagination&&g.paginationContainer&&g.paginationContainer.length>0){for(var e="",a=g.params.loop?Math.ceil((g.slides.length-2*g.loopedSlides)/g.params.slidesPerGroup):g.snapGrid.length,t=0;a>t;t++)e+=g.params.paginationBulletRender?g.params.paginationBulletRender(t,g.params.bulletClass):'<span class="'+g.params.bulletClass+'"></span>';g.paginationContainer.html(e),g.bullets=g.paginationContainer.find("."+g.params.bulletClass)}},g.update=function(e){function a(){r=Math.min(Math.max(g.translate,g.maxTranslate()),g.minTranslate()),g.setWrapperTranslate(r),g.updateActiveIndex(),g.updateClasses()}if(g.updateContainerSize(),g.updateSlidesSize(),g.updateProgress(),g.updatePagination(),g.updateClasses(),g.params.scrollbar&&g.scrollbar&&g.scrollbar.set(),e){var t,r;g.params.freeMode?a():(t="auto"===g.params.slidesPerView&&g.isEnd&&!g.params.centeredSlides?g.slideTo(g.slides.length-1,0,!1,!0):g.slideTo(g.activeIndex,0,!1,!0),t||a())}},g.onResize=function(e){if(g.updateContainerSize(),g.updateSlidesSize(),g.updateProgress(),("auto"===g.params.slidesPerView||g.params.freeMode||e)&&g.updatePagination(),g.params.scrollbar&&g.scrollbar&&g.scrollbar.set(),g.params.freeMode){var a=Math.min(Math.max(g.translate,g.maxTranslate()),g.minTranslate());g.setWrapperTranslate(a),g.updateActiveIndex(),g.updateClasses()}else g.updateClasses(),"auto"===g.params.slidesPerView&&g.isEnd&&!g.params.centeredSlides?g.slideTo(g.slides.length-1,0,!1,!0):g.slideTo(g.activeIndex,0,!1,!0)};var w=["mousedown","mousemove","mouseup"];window.navigator.pointerEnabled?w=["pointerdown","pointermove","pointerup"]:window.navigator.msPointerEnabled&&(w=["MSPointerDown","MSPointerMove","MSPointerUp"]),g.touchEvents={start:g.support.touch||!g.params.simulateTouch?"touchstart":w[0],move:g.support.touch||!g.params.simulateTouch?"touchmove":w[1],end:g.support.touch||!g.params.simulateTouch?"touchend":w[2]},(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&("container"===g.params.touchEventsTarget?g.container:g.wrapper).addClass("swiper-wp8-"+g.params.direction),g.initEvents=function(e){var a=e?"off":"on",t=e?"removeEventListener":"addEventListener",s="container"===g.params.touchEventsTarget?g.container[0]:g.wrapper[0],i=g.support.touch?s:document,n=g.params.nested?!0:!1;g.browser.ie?(s[t](g.touchEvents.start,g.onTouchStart,!1),i[t](g.touchEvents.move,g.onTouchMove,n),i[t](g.touchEvents.end,g.onTouchEnd,!1)):(g.support.touch&&(s[t](g.touchEvents.start,g.onTouchStart,!1),s[t](g.touchEvents.move,g.onTouchMove,n),s[t](g.touchEvents.end,g.onTouchEnd,!1)),!r.simulateTouch||g.device.ios||g.device.android||(s[t]("mousedown",g.onTouchStart,!1),document[t]("mousemove",g.onTouchMove,n),document[t]("mouseup",g.onTouchEnd,!1))),window[t]("resize",g.onResize),g.params.nextButton&&(v(g.params.nextButton)[a]("click",g.onClickNext),g.params.a11y&&g.a11y&&v(g.params.nextButton)[a]("keydown",g.a11y.onEnterKey)),g.params.prevButton&&(v(g.params.prevButton)[a]("click",g.onClickPrev),g.params.a11y&&g.a11y&&v(g.params.prevButton)[a]("keydown",g.a11y.onEnterKey)),g.params.pagination&&g.params.paginationClickable&&v(g.paginationContainer)[a]("click","."+g.params.bulletClass,g.onClickIndex),(g.params.preventClicks||g.params.preventClicksPropagation)&&s[t]("click",g.preventClicks,!0)},g.attachEvents=function(e){g.initEvents()},g.detachEvents=function(){g.initEvents(!0)},g.allowClick=!0,g.preventClicks=function(e){g.allowClick||(g.params.preventClicks&&e.preventDefault(),g.params.preventClicksPropagation&&(e.stopPropagation(),e.stopImmediatePropagation()))},g.onClickNext=function(e){e.preventDefault(),g.slideNext()},g.onClickPrev=function(e){e.preventDefault(),g.slidePrev()},g.onClickIndex=function(e){e.preventDefault();var a=v(this).index()*g.params.slidesPerGroup;g.params.loop&&(a+=g.loopedSlides),g.slideTo(a)},g.updateClickedSlide=function(e){var a=n(e,"."+g.params.slideClass),t=!1;if(a)for(var r=0;r<g.slides.length;r++)g.slides[r]===a&&(t=!0);if(!a||!t)return g.clickedSlide=void 0,void(g.clickedIndex=void 0);if(g.clickedSlide=a,g.clickedIndex=v(a).index(),g.params.slideToClickedSlide&&void 0!==g.clickedIndex&&g.clickedIndex!==g.activeIndex){var s,i=g.clickedIndex;if(g.params.loop)if(s=v(g.clickedSlide).attr("data-swiper-slide-index"),i>g.slides.length-g.params.slidesPerView)g.fixLoop(),i=g.wrapper.children("."+g.params.slideClass+'[data-swiper-slide-index="'+s+'"]').eq(0).index(),setTimeout(function(){g.slideTo(i)},0);else if(i<g.params.slidesPerView-1){g.fixLoop();var o=g.wrapper.children("."+g.params.slideClass+'[data-swiper-slide-index="'+s+'"]');i=o.eq(o.length-1).index(),setTimeout(function(){g.slideTo(i)},0)}else g.slideTo(i);else g.slideTo(i)}};var y,b,x,T,S,C,M,E,z,P="input, select, textarea, button",I=Date.now(),k=[];g.animating=!1,g.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0};var L,D;if(g.onTouchStart=function(e){if(e.originalEvent&&(e=e.originalEvent),L="touchstart"===e.type,L||!("which"in e)||3!==e.which){if(g.params.noSwiping&&n(e,"."+g.params.noSwipingClass))return void(g.allowClick=!0);if(!g.params.swipeHandler||n(e,g.params.swipeHandler)){if(y=!0,b=!1,T=void 0,D=void 0,g.touches.startX=g.touches.currentX="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,g.touches.startY=g.touches.currentY="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY,x=Date.now(),g.allowClick=!0,g.updateContainerSize(),g.swipeDirection=void 0,g.params.threshold>0&&(M=!1),"touchstart"!==e.type){var a=!0;v(e.target).is(P)&&(a=!1),document.activeElement&&v(document.activeElement).is(P)&&document.activeElement.blur(),a&&e.preventDefault()}g.emit("onTouchStart",g,e)}}},g.onTouchMove=function(e){if(e.originalEvent&&(e=e.originalEvent),!(L&&"mousemove"===e.type||e.preventedByNestedSwiper)){if(g.params.onlyExternal)return b=!0,void(g.allowClick=!1);if(L&&document.activeElement&&e.target===document.activeElement&&v(e.target).is(P))return b=!0,void(g.allowClick=!1);if(g.emit("onTouchMove",g,e),!(e.targetTouches&&e.targetTouches.length>1)){if(g.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,g.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,"undefined"==typeof T){var a=180*Math.atan2(Math.abs(g.touches.currentY-g.touches.startY),Math.abs(g.touches.currentX-g.touches.startX))/Math.PI;T=s()?a>g.params.touchAngle:90-a>g.params.touchAngle}if(T&&g.emit("onTouchMoveOpposite",g,e),"undefined"==typeof D&&g.browser.ieTouch&&(g.touches.currentX!==g.touches.startX||g.touches.currentY!==g.touches.startY)&&(D=!0),y){if(T)return void(y=!1);if(D||!g.browser.ieTouch){g.allowClick=!1,g.emit("onSliderMove",g,e),e.preventDefault(),g.params.touchMoveStopPropagation&&!g.params.nested&&e.stopPropagation(),b||(r.loop&&g.fixLoop(),C=g.getWrapperTranslate(),g.setWrapperTransition(0),g.animating&&g.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"),g.params.autoplay&&g.autoplaying&&(g.params.autoplayDisableOnInteraction?g.stopAutoplay():g.pauseAutoplay()),z=!1,g.params.grabCursor&&(g.container[0].style.cursor="move",g.container[0].style.cursor="-webkit-grabbing",g.container[0].style.cursor="-moz-grabbin",g.container[0].style.cursor="grabbing")),b=!0;var t=g.touches.diff=s()?g.touches.currentX-g.touches.startX:g.touches.currentY-g.touches.startY;t*=g.params.touchRatio,g.rtl&&(t=-t),g.swipeDirection=t>0?"prev":"next",S=t+C;var i=!0;if(t>0&&S>g.minTranslate()?(i=!1,g.params.resistance&&(S=g.minTranslate()-1+Math.pow(-g.minTranslate()+C+t,g.params.resistanceRatio))):0>t&&S<g.maxTranslate()&&(i=!1,g.params.resistance&&(S=g.maxTranslate()+1-Math.pow(g.maxTranslate()-C-t,g.params.resistanceRatio))),i&&(e.preventedByNestedSwiper=!0),!g.params.allowSwipeToNext&&"next"===g.swipeDirection&&C>S&&(S=C),!g.params.allowSwipeToPrev&&"prev"===g.swipeDirection&&S>C&&(S=C),g.params.followFinger){if(g.params.threshold>0){if(!(Math.abs(t)>g.params.threshold||M))return void(S=C);if(!M)return M=!0,g.touches.startX=g.touches.currentX,g.touches.startY=g.touches.currentY,S=C,void(g.touches.diff=s()?g.touches.currentX-g.touches.startX:g.touches.currentY-g.touches.startY)}(g.params.freeMode||g.params.watchSlidesProgress)&&g.updateActiveIndex(),g.params.freeMode&&(0===k.length&&k.push({position:g.touches[s()?"startX":"startY"],time:x}),k.push({position:g.touches[s()?"currentX":"currentY"],time:(new window.Date).getTime()})),g.updateProgress(S),g.setWrapperTranslate(S)}}}}}},g.onTouchEnd=function(e){if(e.originalEvent&&(e=e.originalEvent),g.emit("onTouchEnd",g,e),y){g.params.grabCursor&&b&&y&&(g.container[0].style.cursor="move",g.container[0].style.cursor="-webkit-grab",g.container[0].style.cursor="-moz-grab",g.container[0].style.cursor="grab");var a=Date.now(),t=a-x;if(g.allowClick&&(g.updateClickedSlide(e),g.emit("onTap",g,e),300>t&&a-I>300&&(E&&clearTimeout(E),E=setTimeout(function(){g&&(g.params.paginationHide&&g.paginationContainer.length>0&&!v(e.target).hasClass(g.params.bulletClass)&&g.paginationContainer.toggleClass(g.params.paginationHiddenClass),g.emit("onClick",g,e))},300)),300>t&&300>a-I&&(E&&clearTimeout(E),g.emit("onDoubleTap",g,e))),I=Date.now(),setTimeout(function(){g&&g.allowClick&&(g.allowClick=!0)},0),!y||!b||!g.swipeDirection||0===g.touches.diff||S===C)return void(y=b=!1);y=b=!1;var r;if(r=g.params.followFinger?g.rtl?g.translate:-g.translate:-S,g.params.freeMode){if(r<-g.minTranslate())return void g.slideTo(g.activeIndex);if(r>-g.maxTranslate())return void g.slideTo(g.slides.length<g.snapGrid.length?g.snapGrid.length-1:g.slides.length-1);if(g.params.freeModeMomentum){if(k.length>1){var s=k.pop(),i=k.pop(),n=s.position-i.position,o=s.time-i.time;g.velocity=n/o,g.velocity=g.velocity/2,Math.abs(g.velocity)<.02&&(g.velocity=0),(o>150||(new window.Date).getTime()-s.time>300)&&(g.velocity=0)}else g.velocity=0;k.length=0;var l=1e3*g.params.freeModeMomentumRatio,d=g.velocity*l,p=g.translate+d;g.rtl&&(p=-p);var u,c=!1,m=20*Math.abs(g.velocity)*g.params.freeModeMomentumBounceRatio;if(p<g.maxTranslate())g.params.freeModeMomentumBounce?(p+g.maxTranslate()<-m&&(p=g.maxTranslate()-m),u=g.maxTranslate(),c=!0,z=!0):p=g.maxTranslate();else if(p>g.minTranslate())g.params.freeModeMomentumBounce?(p-g.minTranslate()>m&&(p=g.minTranslate()+m),u=g.minTranslate(),c=!0,z=!0):p=g.minTranslate();else if(g.params.freeModeSticky){var f,h=0;for(h=0;h<g.snapGrid.length;h+=1)if(g.snapGrid[h]>-p){f=h;break}p=Math.abs(g.snapGrid[f]-p)<Math.abs(g.snapGrid[f-1]-p)||"next"===g.swipeDirection?g.snapGrid[f]:g.snapGrid[f-1],g.rtl||(p=-p)}if(0!==g.velocity)l=Math.abs(g.rtl?(-p-g.translate)/g.velocity:(p-g.translate)/g.velocity);else if(g.params.freeModeSticky)return void g.slideReset();g.params.freeModeMomentumBounce&&c?(g.updateProgress(u),g.setWrapperTransition(l),g.setWrapperTranslate(p),g.onTransitionStart(),g.animating=!0,g.wrapper.transitionEnd(function(){g&&z&&(g.emit("onMomentumBounce",g),g.setWrapperTransition(g.params.speed),g.setWrapperTranslate(u),g.wrapper.transitionEnd(function(){g&&g.onTransitionEnd()}))})):g.velocity?(g.updateProgress(p),g.setWrapperTransition(l),g.setWrapperTranslate(p),g.onTransitionStart(),g.animating||(g.animating=!0,g.wrapper.transitionEnd(function(){g&&g.onTransitionEnd()}))):g.updateProgress(p),g.updateActiveIndex()}return void((!g.params.freeModeMomentum||t>=g.params.longSwipesMs)&&(g.updateProgress(),g.updateActiveIndex()))}var w,T=0,M=g.slidesSizesGrid[0];for(w=0;w<g.slidesGrid.length;w+=g.params.slidesPerGroup)"undefined"!=typeof g.slidesGrid[w+g.params.slidesPerGroup]?r>=g.slidesGrid[w]&&r<g.slidesGrid[w+g.params.slidesPerGroup]&&(T=w,M=g.slidesGrid[w+g.params.slidesPerGroup]-g.slidesGrid[w]):r>=g.slidesGrid[w]&&(T=w,M=g.slidesGrid[g.slidesGrid.length-1]-g.slidesGrid[g.slidesGrid.length-2]);var P=(r-g.slidesGrid[T])/M;if(t>g.params.longSwipesMs){if(!g.params.longSwipes)return void g.slideTo(g.activeIndex);"next"===g.swipeDirection&&g.slideTo(P>=g.params.longSwipesRatio?T+g.params.slidesPerGroup:T),"prev"===g.swipeDirection&&g.slideTo(P>1-g.params.longSwipesRatio?T+g.params.slidesPerGroup:T)}else{if(!g.params.shortSwipes)return void g.slideTo(g.activeIndex);"next"===g.swipeDirection&&g.slideTo(T+g.params.slidesPerGroup),"prev"===g.swipeDirection&&g.slideTo(T)}}},g._slideTo=function(e,a){return g.slideTo(e,a,!0,!0)},g.slideTo=function(e,a,t,r){"undefined"==typeof t&&(t=!0),"undefined"==typeof e&&(e=0),0>e&&(e=0),g.snapIndex=Math.floor(e/g.params.slidesPerGroup),g.snapIndex>=g.snapGrid.length&&(g.snapIndex=g.snapGrid.length-1);var i=-g.snapGrid[g.snapIndex];if(!g.params.allowSwipeToNext&&i<g.translate)return!1;if(!g.params.allowSwipeToPrev&&i>g.translate)return!1;g.params.autoplay&&g.autoplaying&&(r||!g.params.autoplayDisableOnInteraction?g.pauseAutoplay(a):g.stopAutoplay()),g.updateProgress(i);for(var n=0;n<g.slidesGrid.length;n++)-i>=g.slidesGrid[n]&&(e=n);if("undefined"==typeof a&&(a=g.params.speed),g.previousIndex=g.activeIndex||0,g.activeIndex=e,i===g.translate)return g.updateClasses(),!1;g.updateClasses(),g.onTransitionStart(t);s()?i:0,s()?0:i;return 0===a?(g.setWrapperTransition(0),g.setWrapperTranslate(i),g.onTransitionEnd(t)):(g.setWrapperTransition(a),g.setWrapperTranslate(i),g.animating||(g.animating=!0,g.wrapper.transitionEnd(function(){g&&g.onTransitionEnd(t)}))),!0},g.onTransitionStart=function(e){"undefined"==typeof e&&(e=!0),g.lazy&&g.lazy.onTransitionStart(),e&&(g.emit("onTransitionStart",g),g.activeIndex!==g.previousIndex&&g.emit("onSlideChangeStart",g))},g.onTransitionEnd=function(e){g.animating=!1,g.setWrapperTransition(0),"undefined"==typeof e&&(e=!0),g.lazy&&g.lazy.onTransitionEnd(),e&&(g.emit("onTransitionEnd",g),g.activeIndex!==g.previousIndex&&g.emit("onSlideChangeEnd",g)),g.params.hashnav&&g.hashnav&&g.hashnav.setHash()},g.slideNext=function(e,a,t){if(g.params.loop){if(g.animating)return!1;g.fixLoop();{g.container[0].clientLeft}return g.slideTo(g.activeIndex+g.params.slidesPerGroup,a,e,t)}return g.slideTo(g.activeIndex+g.params.slidesPerGroup,a,e,t)},g._slideNext=function(e){return g.slideNext(!0,e,!0)},g.slidePrev=function(e,a,t){if(g.params.loop){if(g.animating)return!1;g.fixLoop();{g.container[0].clientLeft}return g.slideTo(g.activeIndex-1,a,e,t)}return g.slideTo(g.activeIndex-1,a,e,t)},g._slidePrev=function(e){return g.slidePrev(!0,e,!0)},g.slideReset=function(e,a,t){return g.slideTo(g.activeIndex,a,e)},g.setWrapperTransition=function(e,a){g.wrapper.transition(e),"slide"!==g.params.effect&&g.effects[g.params.effect]&&g.effects[g.params.effect].setTransition(e),g.params.parallax&&g.parallax&&g.parallax.setTransition(e),g.params.scrollbar&&g.scrollbar&&g.scrollbar.setTransition(e),g.params.control&&g.controller&&g.controller.setTransition(e,a),g.emit("onSetTransition",g,e)},g.setWrapperTranslate=function(e,a,t){var r=0,i=0,n=0;s()?r=g.rtl?-e:e:i=e,g.params.virtualTranslate||g.wrapper.transform(g.support.transforms3d?"translate3d("+r+"px, "+i+"px, "+n+"px)":"translate("+r+"px, "+i+"px)"),g.translate=s()?r:i,a&&g.updateActiveIndex(),"slide"!==g.params.effect&&g.effects[g.params.effect]&&g.effects[g.params.effect].setTranslate(g.translate),g.params.parallax&&g.parallax&&g.parallax.setTranslate(g.translate),g.params.scrollbar&&g.scrollbar&&g.scrollbar.setTranslate(g.translate),g.params.control&&g.controller&&g.controller.setTranslate(g.translate,t),g.emit("onSetTranslate",g,g.translate)},g.getTranslate=function(e,a){var t,r,s,i;return"undefined"==typeof a&&(a="x"),g.params.virtualTranslate?g.rtl?-g.translate:g.translate:(s=window.getComputedStyle(e,null),
window.WebKitCSSMatrix?i=new window.WebKitCSSMatrix("none"===s.webkitTransform?"":s.webkitTransform):(i=s.MozTransform||s.OTransform||s.MsTransform||s.msTransform||s.transform||s.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),t=i.toString().split(",")),"x"===a&&(r=window.WebKitCSSMatrix?i.m41:parseFloat(16===t.length?t[12]:t[4])),"y"===a&&(r=window.WebKitCSSMatrix?i.m42:parseFloat(16===t.length?t[13]:t[5])),g.rtl&&r&&(r=-r),r||0)},g.getWrapperTranslate=function(e){return"undefined"==typeof e&&(e=s()?"x":"y"),g.getTranslate(g.wrapper[0],e)},g.observers=[],g.initObservers=function(){if(g.params.observeParents)for(var e=g.container.parents(),a=0;a<e.length;a++)o(e[a]);o(g.container[0],{childList:!1}),o(g.wrapper[0],{attributes:!1})},g.disconnectObservers=function(){for(var e=0;e<g.observers.length;e++)g.observers[e].disconnect();g.observers=[]},g.createLoop=function(){g.wrapper.children("."+g.params.slideClass+"."+g.params.slideDuplicateClass).remove();var e=g.wrapper.children("."+g.params.slideClass);g.loopedSlides=parseInt(g.params.loopedSlides||g.params.slidesPerView,10),g.loopedSlides=g.loopedSlides+g.params.loopAdditionalSlides,g.loopedSlides>e.length&&(g.loopedSlides=e.length);var a,t=[],r=[];for(e.each(function(a,s){var i=v(this);a<g.loopedSlides&&r.push(s),a<e.length&&a>=e.length-g.loopedSlides&&t.push(s),i.attr("data-swiper-slide-index",a)}),a=0;a<r.length;a++)g.wrapper.append(v(r[a].cloneNode(!0)).addClass(g.params.slideDuplicateClass));for(a=t.length-1;a>=0;a--)g.wrapper.prepend(v(t[a].cloneNode(!0)).addClass(g.params.slideDuplicateClass))},g.destroyLoop=function(){g.wrapper.children("."+g.params.slideClass+"."+g.params.slideDuplicateClass).remove(),g.slides.removeAttr("data-swiper-slide-index")},g.fixLoop=function(){var e;g.activeIndex<g.loopedSlides?(e=g.slides.length-3*g.loopedSlides+g.activeIndex,e+=g.loopedSlides,g.slideTo(e,0,!1,!0)):("auto"===g.params.slidesPerView&&g.activeIndex>=2*g.loopedSlides||g.activeIndex>g.slides.length-2*g.params.slidesPerView)&&(e=-g.slides.length+g.activeIndex+g.loopedSlides,e+=g.loopedSlides,g.slideTo(e,0,!1,!0))},g.appendSlide=function(e){if(g.params.loop&&g.destroyLoop(),"object"==typeof e&&e.length)for(var a=0;a<e.length;a++)e[a]&&g.wrapper.append(e[a]);else g.wrapper.append(e);g.params.loop&&g.createLoop(),g.params.observer&&g.support.observer||g.update(!0)},g.prependSlide=function(e){g.params.loop&&g.destroyLoop();var a=g.activeIndex+1;if("object"==typeof e&&e.length){for(var t=0;t<e.length;t++)e[t]&&g.wrapper.prepend(e[t]);a=g.activeIndex+e.length}else g.wrapper.prepend(e);g.params.loop&&g.createLoop(),g.params.observer&&g.support.observer||g.update(!0),g.slideTo(a,0,!1)},g.removeSlide=function(e){g.params.loop&&(g.destroyLoop(),g.slides=g.wrapper.children("."+g.params.slideClass));var a,t=g.activeIndex;if("object"==typeof e&&e.length){for(var r=0;r<e.length;r++)a=e[r],g.slides[a]&&g.slides.eq(a).remove(),t>a&&t--;t=Math.max(t,0)}else a=e,g.slides[a]&&g.slides.eq(a).remove(),t>a&&t--,t=Math.max(t,0);g.params.loop&&g.createLoop(),g.params.observer&&g.support.observer||g.update(!0),g.params.loop?g.slideTo(t+g.loopedSlides,0,!1):g.slideTo(t,0,!1)},g.removeAllSlides=function(){for(var e=[],a=0;a<g.slides.length;a++)e.push(a);g.removeSlide(e)},g.effects={fade:{fadeIndex:null,setTranslate:function(){for(var e=0;e<g.slides.length;e++){var a=g.slides.eq(e),t=a[0].swiperSlideOffset,r=-t;g.params.virtualTranslate||(r-=g.translate);var i=0;s()||(i=r,r=0);var n=g.params.fade.crossFade?Math.max(1-Math.abs(a[0].progress),0):1+Math.min(Math.max(a[0].progress,-1),0);n>0&&1>n&&(g.effects.fade.fadeIndex=e),a.css({opacity:n}).transform("translate3d("+r+"px, "+i+"px, 0px)")}},setTransition:function(e){if(g.slides.transition(e),g.params.virtualTranslate&&0!==e){var a=null!==g.effects.fade.fadeIndex?g.effects.fade.fadeIndex:g.activeIndex;g.params.loop||g.params.fade.crossFade||0!==a||(a=g.slides.length-1),g.slides.eq(a).transitionEnd(function(){if(g)for(var e=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],a=0;a<e.length;a++)g.wrapper.trigger(e[a])})}}},cube:{setTranslate:function(){var e,a=0;g.params.cube.shadow&&(s()?(e=g.wrapper.find(".swiper-cube-shadow"),0===e.length&&(e=v('<div class="swiper-cube-shadow"></div>'),g.wrapper.append(e)),e.css({height:g.width+"px"})):(e=g.container.find(".swiper-cube-shadow"),0===e.length&&(e=v('<div class="swiper-cube-shadow"></div>'),g.container.append(e))));for(var t=0;t<g.slides.length;t++){var r=g.slides.eq(t),i=90*t,n=Math.floor(i/360);g.rtl&&(i=-i,n=Math.floor(-i/360));var o=Math.max(Math.min(r[0].progress,1),-1),l=0,d=0,p=0;t%4===0?(l=4*-n*g.size,p=0):(t-1)%4===0?(l=0,p=4*-n*g.size):(t-2)%4===0?(l=g.size+4*n*g.size,p=g.size):(t-3)%4===0&&(l=-g.size,p=3*g.size+4*g.size*n),g.rtl&&(l=-l),s()||(d=l,l=0);var u="rotateX("+(s()?0:-i)+"deg) rotateY("+(s()?i:0)+"deg) translate3d("+l+"px, "+d+"px, "+p+"px)";if(1>=o&&o>-1&&(a=90*t+90*o,g.rtl&&(a=90*-t-90*o)),r.transform(u),g.params.cube.slideShadows){var c=r.find(s()?".swiper-slide-shadow-left":".swiper-slide-shadow-top"),m=r.find(s()?".swiper-slide-shadow-right":".swiper-slide-shadow-bottom");0===c.length&&(c=v('<div class="swiper-slide-shadow-'+(s()?"left":"top")+'"></div>'),r.append(c)),0===m.length&&(m=v('<div class="swiper-slide-shadow-'+(s()?"right":"bottom")+'"></div>'),r.append(m));{r[0].progress}c.length&&(c[0].style.opacity=-r[0].progress),m.length&&(m[0].style.opacity=r[0].progress)}}if(g.wrapper.css({"-webkit-transform-origin":"50% 50% -"+g.size/2+"px","-moz-transform-origin":"50% 50% -"+g.size/2+"px","-ms-transform-origin":"50% 50% -"+g.size/2+"px","transform-origin":"50% 50% -"+g.size/2+"px"}),g.params.cube.shadow)if(s())e.transform("translate3d(0px, "+(g.width/2+g.params.cube.shadowOffset)+"px, "+-g.width/2+"px) rotateX(90deg) rotateZ(0deg) scale("+g.params.cube.shadowScale+")");else{var f=Math.abs(a)-90*Math.floor(Math.abs(a)/90),h=1.5-(Math.sin(2*f*Math.PI/360)/2+Math.cos(2*f*Math.PI/360)/2),w=g.params.cube.shadowScale,y=g.params.cube.shadowScale/h,b=g.params.cube.shadowOffset;e.transform("scale3d("+w+", 1, "+y+") translate3d(0px, "+(g.height/2+b)+"px, "+-g.height/2/y+"px) rotateX(-90deg)")}var x=g.isSafari||g.isUiWebView?-g.size/2:0;g.wrapper.transform("translate3d(0px,0,"+x+"px) rotateX("+(s()?0:a)+"deg) rotateY("+(s()?-a:0)+"deg)")},setTransition:function(e){g.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),g.params.cube.shadow&&!s()&&g.container.find(".swiper-cube-shadow").transition(e)}},coverflow:{setTranslate:function(){for(var e=g.translate,a=s()?-e+g.width/2:-e+g.height/2,t=s()?g.params.coverflow.rotate:-g.params.coverflow.rotate,r=g.params.coverflow.depth,i=0,n=g.slides.length;n>i;i++){var o=g.slides.eq(i),l=g.slidesSizesGrid[i],d=o[0].swiperSlideOffset,p=(a-d-l/2)/l*g.params.coverflow.modifier,u=s()?t*p:0,c=s()?0:t*p,m=-r*Math.abs(p),f=s()?0:g.params.coverflow.stretch*p,h=s()?g.params.coverflow.stretch*p:0;Math.abs(h)<.001&&(h=0),Math.abs(f)<.001&&(f=0),Math.abs(m)<.001&&(m=0),Math.abs(u)<.001&&(u=0),Math.abs(c)<.001&&(c=0);var w="translate3d("+h+"px,"+f+"px,"+m+"px)  rotateX("+c+"deg) rotateY("+u+"deg)";if(o.transform(w),o[0].style.zIndex=-Math.abs(Math.round(p))+1,g.params.coverflow.slideShadows){var y=o.find(s()?".swiper-slide-shadow-left":".swiper-slide-shadow-top"),b=o.find(s()?".swiper-slide-shadow-right":".swiper-slide-shadow-bottom");0===y.length&&(y=v('<div class="swiper-slide-shadow-'+(s()?"left":"top")+'"></div>'),o.append(y)),0===b.length&&(b=v('<div class="swiper-slide-shadow-'+(s()?"right":"bottom")+'"></div>'),o.append(b)),y.length&&(y[0].style.opacity=p>0?p:0),b.length&&(b[0].style.opacity=-p>0?-p:0)}}if(g.browser.ie){var x=g.wrapper[0].style;x.perspectiveOrigin=a+"px 50%"}},setTransition:function(e){g.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}}},g.lazy={initialImageLoaded:!1,loadImageInSlide:function(e,a){if("undefined"!=typeof e&&("undefined"==typeof a&&(a=!0),0!==g.slides.length)){var t=g.slides.eq(e),r=t.find(".swiper-lazy:not(.swiper-lazy-loaded):not(.swiper-lazy-loading)");!t.hasClass("swiper-lazy")||t.hasClass("swiper-lazy-loaded")||t.hasClass("swiper-lazy-loading")||r.add(t[0]),0!==r.length&&r.each(function(){var e=v(this);e.addClass("swiper-lazy-loading");var r=e.attr("data-background"),s=e.attr("data-src");g.loadImage(e[0],s||r,!1,function(){if(r?(e.css("background-image","url("+r+")"),e.removeAttr("data-background")):(e.attr("src",s),e.removeAttr("data-src")),e.addClass("swiper-lazy-loaded").removeClass("swiper-lazy-loading"),t.find(".swiper-lazy-preloader, .preloader").remove(),g.params.loop&&a){var i=t.attr("data-swiper-slide-index");if(t.hasClass(g.params.slideDuplicateClass)){var n=g.wrapper.children('[data-swiper-slide-index="'+i+'"]:not(.'+g.params.slideDuplicateClass+")");g.lazy.loadImageInSlide(n.index(),!1)}else{var o=g.wrapper.children("."+g.params.slideDuplicateClass+'[data-swiper-slide-index="'+i+'"]');g.lazy.loadImageInSlide(o.index(),!1)}}g.emit("onLazyImageReady",g,t[0],e[0])}),g.emit("onLazyImageLoad",g,t[0],e[0])})}},load:function(){if(g.params.watchSlidesVisibility)g.wrapper.children("."+g.params.slideVisibleClass).each(function(){g.lazy.loadImageInSlide(v(this).index())});else if(g.params.slidesPerView>1)for(var e=g.activeIndex;e<g.activeIndex+g.params.slidesPerView;e++)g.slides[e]&&g.lazy.loadImageInSlide(e);else g.lazy.loadImageInSlide(g.activeIndex);if(g.params.lazyLoadingInPrevNext){var a=g.wrapper.children("."+g.params.slideNextClass);a.length>0&&g.lazy.loadImageInSlide(a.index());var t=g.wrapper.children("."+g.params.slidePrevClass);t.length>0&&g.lazy.loadImageInSlide(t.index())}},onTransitionStart:function(){g.params.lazyLoading&&(g.params.lazyLoadingOnTransitionStart||!g.params.lazyLoadingOnTransitionStart&&!g.lazy.initialImageLoaded)&&g.lazy.load()},onTransitionEnd:function(){g.params.lazyLoading&&!g.params.lazyLoadingOnTransitionStart&&g.lazy.load()}},g.scrollbar={set:function(){if(g.params.scrollbar){var e=g.scrollbar;e.track=v(g.params.scrollbar),e.drag=e.track.find(".swiper-scrollbar-drag"),0===e.drag.length&&(e.drag=v('<div class="swiper-scrollbar-drag"></div>'),e.track.append(e.drag)),e.drag[0].style.width="",e.drag[0].style.height="",e.trackSize=s()?e.track[0].offsetWidth:e.track[0].offsetHeight,e.divider=g.size/g.virtualSize,e.moveDivider=e.divider*(e.trackSize/g.size),e.dragSize=e.trackSize*e.divider,s()?e.drag[0].style.width=e.dragSize+"px":e.drag[0].style.height=e.dragSize+"px",e.track[0].style.display=e.divider>=1?"none":"",g.params.scrollbarHide&&(e.track[0].style.opacity=0)}},setTranslate:function(){if(g.params.scrollbar){var e,a=g.scrollbar,t=(g.translate||0,a.dragSize);e=(a.trackSize-a.dragSize)*g.progress,g.rtl&&s()?(e=-e,e>0?(t=a.dragSize-e,e=0):-e+a.dragSize>a.trackSize&&(t=a.trackSize+e)):0>e?(t=a.dragSize+e,e=0):e+a.dragSize>a.trackSize&&(t=a.trackSize-e),s()?(a.drag.transform(g.support.transforms3d?"translate3d("+e+"px, 0, 0)":"translateX("+e+"px)"),a.drag[0].style.width=t+"px"):(a.drag.transform(g.support.transforms3d?"translate3d(0px, "+e+"px, 0)":"translateY("+e+"px)"),a.drag[0].style.height=t+"px"),g.params.scrollbarHide&&(clearTimeout(a.timeout),a.track[0].style.opacity=1,a.timeout=setTimeout(function(){a.track[0].style.opacity=0,a.track.transition(400)},1e3))}},setTransition:function(e){g.params.scrollbar&&g.scrollbar.drag.transition(e)}},g.controller={setTranslate:function(e,t){function r(a){e=a.rtl&&"horizontal"===a.params.direction?-g.translate:g.translate,s=(a.maxTranslate()-a.minTranslate())/(g.maxTranslate()-g.minTranslate()),i=(e-g.minTranslate())*s+a.minTranslate(),g.params.controlInverse&&(i=a.maxTranslate()-i),a.updateProgress(i),a.setWrapperTranslate(i,!1,g),a.updateActiveIndex()}var s,i,n=g.params.control;if(g.isArray(n))for(var o=0;o<n.length;o++)n[o]!==t&&n[o]instanceof a&&r(n[o]);else n instanceof a&&t!==n&&r(n)},setTransition:function(e,t){function r(a){a.setWrapperTransition(e,g),0!==e&&(a.onTransitionStart(),a.wrapper.transitionEnd(function(){i&&a.onTransitionEnd()}))}var s,i=g.params.control;if(g.isArray(i))for(s=0;s<i.length;s++)i[s]!==t&&i[s]instanceof a&&r(i[s]);else i instanceof a&&t!==i&&r(i)}},g.hashnav={init:function(){if(g.params.hashnav){g.hashnav.initialized=!0;var e=document.location.hash.replace("#","");if(e)for(var a=0,t=0,r=g.slides.length;r>t;t++){var s=g.slides.eq(t),i=s.attr("data-hash");if(i===e&&!s.hasClass(g.params.slideDuplicateClass)){var n=s.index();g.slideTo(n,a,g.params.runCallbacksOnInit,!0)}}}},setHash:function(){g.hashnav.initialized&&g.params.hashnav&&(document.location.hash=g.slides.eq(g.activeIndex).attr("data-hash")||"")}},g.disableKeyboardControl=function(){v(document).off("keydown",l)},g.enableKeyboardControl=function(){v(document).on("keydown",l)},g._wheelEvent=!1,g._lastWheelScrollTime=(new window.Date).getTime(),g.params.mousewheelControl){if(void 0!==document.onmousewheel&&(g._wheelEvent="mousewheel"),!g._wheelEvent)try{new window.WheelEvent("wheel"),g._wheelEvent="wheel"}catch(G){}g._wheelEvent||(g._wheelEvent="DOMMouseScroll")}g.disableMousewheelControl=function(){return g._wheelEvent?(g.container.off(g._wheelEvent,d),!0):!1},g.enableMousewheelControl=function(){return g._wheelEvent?(g.container.on(g._wheelEvent,d),!0):!1},g.parallax={setTranslate:function(){g.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){p(this,g.progress)}),g.slides.each(function(){var e=v(this);e.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=Math.min(Math.max(e[0].progress,-1),1);p(this,a)})})},setTransition:function(e){"undefined"==typeof e&&(e=g.params.speed),g.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=v(this),t=parseInt(a.attr("data-swiper-parallax-duration"),10)||e;0===e&&(t=0),a.transition(t)})}},g._plugins=[];for(var B in g.plugins){var A=g.plugins[B](g,g.params[B]);A&&g._plugins.push(A)}return g.callPlugins=function(e){for(var a=0;a<g._plugins.length;a++)e in g._plugins[a]&&g._plugins[a][e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},g.emitterEventListeners={},g.emit=function(e){g.params[e]&&g.params[e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);var a;if(g.emitterEventListeners[e])for(a=0;a<g.emitterEventListeners[e].length;a++)g.emitterEventListeners[e][a](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);g.callPlugins&&g.callPlugins(e,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},g.on=function(e,a){return e=u(e),g.emitterEventListeners[e]||(g.emitterEventListeners[e]=[]),g.emitterEventListeners[e].push(a),g},g.off=function(e,a){var t;if(e=u(e),"undefined"==typeof a)return g.emitterEventListeners[e]=[],g;if(g.emitterEventListeners[e]&&0!==g.emitterEventListeners[e].length){for(t=0;t<g.emitterEventListeners[e].length;t++)g.emitterEventListeners[e][t]===a&&g.emitterEventListeners[e].splice(t,1);return g}},g.once=function(e,a){e=u(e);var t=function(){a(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]),g.off(e,t)};return g.on(e,t),g},g.a11y={makeFocusable:function(e){return e[0].tabIndex="0",e},addRole:function(e,a){return e.attr("role",a),e},addLabel:function(e,a){return e.attr("aria-label",a),e},disable:function(e){return e.attr("aria-disabled",!0),e},enable:function(e){return e.attr("aria-disabled",!1),e},onEnterKey:function(e){13===e.keyCode&&(v(e.target).is(g.params.nextButton)?(g.onClickNext(e),g.a11y.notify(g.isEnd?g.params.lastSlideMsg:g.params.nextSlideMsg)):v(e.target).is(g.params.prevButton)&&(g.onClickPrev(e),g.a11y.notify(g.isBeginning?g.params.firstSlideMsg:g.params.prevSlideMsg)))},liveRegion:v('<span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>'),notify:function(e){var a=g.a11y.liveRegion;0!==a.length&&(a.html(""),a.html(e))},init:function(){if(g.params.nextButton){var e=v(g.params.nextButton);g.a11y.makeFocusable(e),g.a11y.addRole(e,"button"),g.a11y.addLabel(e,g.params.nextSlideMsg)}if(g.params.prevButton){var a=v(g.params.prevButton);g.a11y.makeFocusable(a),g.a11y.addRole(a,"button"),g.a11y.addLabel(a,g.params.prevSlideMsg)}v(g.container).append(g.a11y.liveRegion)},destroy:function(){g.a11y.liveRegion&&g.a11y.liveRegion.length>0&&g.a11y.liveRegion.remove()}},g.init=function(){g.params.loop&&g.createLoop(),g.updateContainerSize(),g.updateSlidesSize(),g.updatePagination(),g.params.scrollbar&&g.scrollbar&&g.scrollbar.set(),"slide"!==g.params.effect&&g.effects[g.params.effect]&&(g.params.loop||g.updateProgress(),g.effects[g.params.effect].setTranslate()),g.params.loop?g.slideTo(g.params.initialSlide+g.loopedSlides,0,g.params.runCallbacksOnInit):(g.slideTo(g.params.initialSlide,0,g.params.runCallbacksOnInit),0===g.params.initialSlide&&(g.parallax&&g.params.parallax&&g.parallax.setTranslate(),g.lazy&&g.params.lazyLoading&&(g.lazy.load(),g.lazy.initialImageLoaded=!0))),g.attachEvents(),g.params.observer&&g.support.observer&&g.initObservers(),g.params.preloadImages&&!g.params.lazyLoading&&g.preloadImages(),g.params.autoplay&&g.startAutoplay(),g.params.keyboardControl&&g.enableKeyboardControl&&g.enableKeyboardControl(),g.params.mousewheelControl&&g.enableMousewheelControl&&g.enableMousewheelControl(),g.params.hashnav&&g.hashnav&&g.hashnav.init(),g.params.a11y&&g.a11y&&g.a11y.init(),g.emit("onInit",g)},g.cleanupStyles=function(){g.container.removeClass(g.classNames.join(" ")).removeAttr("style"),g.wrapper.removeAttr("style"),g.slides&&g.slides.length&&g.slides.removeClass([g.params.slideVisibleClass,g.params.slideActiveClass,g.params.slideNextClass,g.params.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-column").removeAttr("data-swiper-row"),g.paginationContainer&&g.paginationContainer.length&&g.paginationContainer.removeClass(g.params.paginationHiddenClass),g.bullets&&g.bullets.length&&g.bullets.removeClass(g.params.bulletActiveClass),g.params.prevButton&&v(g.params.prevButton).removeClass(g.params.buttonDisabledClass),g.params.nextButton&&v(g.params.nextButton).removeClass(g.params.buttonDisabledClass),g.params.scrollbar&&g.scrollbar&&(g.scrollbar.track&&g.scrollbar.track.length&&g.scrollbar.track.removeAttr("style"),g.scrollbar.drag&&g.scrollbar.drag.length&&g.scrollbar.drag.removeAttr("style"))},g.destroy=function(e,a){g.detachEvents(),g.stopAutoplay(),g.params.loop&&g.destroyLoop(),a&&g.cleanupStyles(),g.disconnectObservers(),g.params.keyboardControl&&g.disableKeyboardControl&&g.disableKeyboardControl(),g.params.mousewheelControl&&g.disableMousewheelControl&&g.disableMousewheelControl(),g.params.a11y&&g.a11y&&g.a11y.destroy(),g.emit("onDestroy"),e!==!1&&(g=null)},g.init(),g}};a.prototype={isSafari:function(){var e=navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),isArray:function(e){return"[object Array]"===Object.prototype.toString.apply(e)},browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled,ieTouch:window.navigator.msPointerEnabled&&window.navigator.msMaxTouchPoints>1||window.navigator.pointerEnabled&&window.navigator.maxTouchPoints>1},device:function(){var e=navigator.userAgent,a=e.match(/(Android);?[\s\/]+([\d.]+)?/),t=e.match(/(iPad).*OS\s([\d_]+)/),r=(e.match(/(iPod)(.*OS\s([\d_]+))?/),!t&&e.match(/(iPhone\sOS)\s([\d_]+)/));return{ios:t||r||t,android:a}}(),support:{touch:window.Modernizr&&Modernizr.touch===!0||function(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===!0||function(){var e=document.createElement("div").style;return"webkitPerspective"in e||"MozPerspective"in e||"OPerspective"in e||"MsPerspective"in e||"perspective"in e}(),flexbox:function(){for(var e=document.createElement("div").style,a="alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" "),t=0;t<a.length;t++)if(a[t]in e)return!0}(),observer:function(){return"MutationObserver"in window||"WebkitMutationObserver"in window}()},plugins:{}};for(var t=(function(){var e=function(e){var a=this,t=0;for(t=0;t<e.length;t++)a[t]=e[t];return a.length=e.length,this},a=function(a,t){var r=[],s=0;if(a&&!t&&a instanceof e)return a;if(a)if("string"==typeof a){var i,n,o=a.trim();if(o.indexOf("<")>=0&&o.indexOf(">")>=0){var l="div";for(0===o.indexOf("<li")&&(l="ul"),0===o.indexOf("<tr")&&(l="tbody"),(0===o.indexOf("<td")||0===o.indexOf("<th"))&&(l="tr"),0===o.indexOf("<tbody")&&(l="table"),0===o.indexOf("<option")&&(l="select"),n=document.createElement(l),n.innerHTML=a,s=0;s<n.childNodes.length;s++)r.push(n.childNodes[s])}else for(i=t||"#"!==a[0]||a.match(/[ .<>:~]/)?(t||document).querySelectorAll(a):[document.getElementById(a.split("#")[1])],s=0;s<i.length;s++)i[s]&&r.push(i[s])}else if(a.nodeType||a===window||a===document)r.push(a);else if(a.length>0&&a[0].nodeType)for(s=0;s<a.length;s++)r.push(a[s]);return new e(r)};return e.prototype={addClass:function(e){if("undefined"==typeof e)return this;for(var a=e.split(" "),t=0;t<a.length;t++)for(var r=0;r<this.length;r++)this[r].classList.add(a[t]);return this},removeClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var r=0;r<this.length;r++)this[r].classList.remove(a[t]);return this},hasClass:function(e){return this[0]?this[0].classList.contains(e):!1},toggleClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var r=0;r<this.length;r++)this[r].classList.toggle(a[t]);return this},attr:function(e,a){if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var t=0;t<this.length;t++)if(2===arguments.length)this[t].setAttribute(e,a);else for(var r in e)this[t][r]=e[r],this[t].setAttribute(r,e[r]);return this},removeAttr:function(e){for(var a=0;a<this.length;a++)this[a].removeAttribute(e);return this},data:function(e,a){if("undefined"==typeof a){if(this[0]){var t=this[0].getAttribute("data-"+e);return t?t:this[0].dom7ElementDataStorage&&e in this[0].dom7ElementDataStorage?this[0].dom7ElementDataStorage[e]:void 0}return void 0}for(var r=0;r<this.length;r++){var s=this[r];s.dom7ElementDataStorage||(s.dom7ElementDataStorage={}),s.dom7ElementDataStorage[e]=a}return this},transform:function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e}return this},on:function(e,t,r,s){function i(e){var s=e.target;if(a(s).is(t))r.call(s,e);else for(var i=a(s).parents(),n=0;n<i.length;n++)a(i[n]).is(t)&&r.call(i[n],e)}var n,o,l=e.split(" ");for(n=0;n<this.length;n++)if("function"==typeof t||t===!1)for("function"==typeof t&&(r=arguments[1],s=arguments[2]||!1),o=0;o<l.length;o++)this[n].addEventListener(l[o],r,s);else for(o=0;o<l.length;o++)this[n].dom7LiveListeners||(this[n].dom7LiveListeners=[]),this[n].dom7LiveListeners.push({listener:r,liveListener:i}),this[n].addEventListener(l[o],i,s);return this},off:function(e,a,t,r){for(var s=e.split(" "),i=0;i<s.length;i++)for(var n=0;n<this.length;n++)if("function"==typeof a||a===!1)"function"==typeof a&&(t=arguments[1],r=arguments[2]||!1),this[n].removeEventListener(s[i],t,r);else if(this[n].dom7LiveListeners)for(var o=0;o<this[n].dom7LiveListeners.length;o++)this[n].dom7LiveListeners[o].listener===t&&this[n].removeEventListener(s[i],this[n].dom7LiveListeners[o].liveListener,r);return this},once:function(e,a,t,r){function s(n){t(n),i.off(e,a,s,r)}var i=this;"function"==typeof a&&(a=!1,t=arguments[1],r=arguments[2]),i.on(e,a,s,r)},trigger:function(e,a){for(var t=0;t<this.length;t++){var r;try{r=new window.CustomEvent(e,{detail:a,bubbles:!0,cancelable:!0})}catch(s){r=document.createEvent("Event"),r.initEvent(e,!0,!0),r.detail=a}this[t].dispatchEvent(r)}return this},transitionEnd:function(e){function a(i){if(i.target===this)for(e.call(this,i),t=0;t<r.length;t++)s.off(r[t],a)}var t,r=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=this;if(e)for(t=0;t<r.length;t++)s.on(r[t],a);return this},width:function(){return this[0]===window?window.innerWidth:this.length>0?parseFloat(this.css("width")):null},outerWidth:function(e){return this.length>0?e?this[0].offsetWidth+parseFloat(this.css("margin-right"))+parseFloat(this.css("margin-left")):this[0].offsetWidth:null},height:function(){return this[0]===window?window.innerHeight:this.length>0?parseFloat(this.css("height")):null},outerHeight:function(e){return this.length>0?e?this[0].offsetHeight+parseFloat(this.css("margin-top"))+parseFloat(this.css("margin-bottom")):this[0].offsetHeight:null},offset:function(){if(this.length>0){var e=this[0],a=e.getBoundingClientRect(),t=document.body,r=e.clientTop||t.clientTop||0,s=e.clientLeft||t.clientLeft||0,i=window.pageYOffset||e.scrollTop,n=window.pageXOffset||e.scrollLeft;return{top:a.top+i-r,left:a.left+n-s}}return null},css:function(e,a){var t;if(1===arguments.length){if("string"!=typeof e){for(t=0;t<this.length;t++)for(var r in e)this[t].style[r]=e[r];return this}if(this[0])return window.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(t=0;t<this.length;t++)this[t].style[e]=a;return this}return this},each:function(e){for(var a=0;a<this.length;a++)e.call(this[a],a,this[a]);return this},html:function(e){if("undefined"==typeof e)return this[0]?this[0].innerHTML:void 0;for(var a=0;a<this.length;a++)this[a].innerHTML=e;return this},is:function(t){if(!this[0])return!1;var r,s;if("string"==typeof t){var i=this[0];if(i===document)return t===document;if(i===window)return t===window;if(i.matches)return i.matches(t);if(i.webkitMatchesSelector)return i.webkitMatchesSelector(t);if(i.mozMatchesSelector)return i.mozMatchesSelector(t);if(i.msMatchesSelector)return i.msMatchesSelector(t);for(r=a(t),s=0;s<r.length;s++)if(r[s]===this[0])return!0;return!1}if(t===document)return this[0]===document;if(t===window)return this[0]===window;if(t.nodeType||t instanceof e){for(r=t.nodeType?[t]:t,s=0;s<r.length;s++)if(r[s]===this[0])return!0;return!1}return!1},index:function(){if(this[0]){for(var e=this[0],a=0;null!==(e=e.previousSibling);)1===e.nodeType&&a++;return a}return void 0},eq:function(a){if("undefined"==typeof a)return this;var t,r=this.length;return a>r-1?new e([]):0>a?(t=r+a,new e(0>t?[]:[this[t]])):new e([this[a]])},append:function(a){var t,r;for(t=0;t<this.length;t++)if("string"==typeof a){var s=document.createElement("div");for(s.innerHTML=a;s.firstChild;)this[t].appendChild(s.firstChild)}else if(a instanceof e)for(r=0;r<a.length;r++)this[t].appendChild(a[r]);else this[t].appendChild(a);return this},prepend:function(a){var t,r;for(t=0;t<this.length;t++)if("string"==typeof a){var s=document.createElement("div");for(s.innerHTML=a,r=s.childNodes.length-1;r>=0;r--)this[t].insertBefore(s.childNodes[r],this[t].childNodes[0])}else if(a instanceof e)for(r=0;r<a.length;r++)this[t].insertBefore(a[r],this[t].childNodes[0]);else this[t].insertBefore(a,this[t].childNodes[0]);return this},insertBefore:function(e){for(var t=a(e),r=0;r<this.length;r++)if(1===t.length)t[0].parentNode.insertBefore(this[r],t[0]);else if(t.length>1)for(var s=0;s<t.length;s++)t[s].parentNode.insertBefore(this[r].cloneNode(!0),t[s])},insertAfter:function(e){for(var t=a(e),r=0;r<this.length;r++)if(1===t.length)t[0].parentNode.insertBefore(this[r],t[0].nextSibling);else if(t.length>1)for(var s=0;s<t.length;s++)t[s].parentNode.insertBefore(this[r].cloneNode(!0),t[s].nextSibling)},next:function(t){return new e(this.length>0?t?this[0].nextElementSibling&&a(this[0].nextElementSibling).is(t)?[this[0].nextElementSibling]:[]:this[0].nextElementSibling?[this[0].nextElementSibling]:[]:[])},nextAll:function(t){var r=[],s=this[0];if(!s)return new e([]);for(;s.nextElementSibling;){var i=s.nextElementSibling;t?a(i).is(t)&&r.push(i):r.push(i),s=i}return new e(r)},prev:function(t){return new e(this.length>0?t?this[0].previousElementSibling&&a(this[0].previousElementSibling).is(t)?[this[0].previousElementSibling]:[]:this[0].previousElementSibling?[this[0].previousElementSibling]:[]:[])},prevAll:function(t){var r=[],s=this[0];if(!s)return new e([]);for(;s.previousElementSibling;){var i=s.previousElementSibling;t?a(i).is(t)&&r.push(i):r.push(i),s=i}return new e(r)},parent:function(e){for(var t=[],r=0;r<this.length;r++)e?a(this[r].parentNode).is(e)&&t.push(this[r].parentNode):t.push(this[r].parentNode);return a(a.unique(t))},parents:function(e){for(var t=[],r=0;r<this.length;r++)for(var s=this[r].parentNode;s;)e?a(s).is(e)&&t.push(s):t.push(s),s=s.parentNode;return a(a.unique(t))},find:function(a){for(var t=[],r=0;r<this.length;r++)for(var s=this[r].querySelectorAll(a),i=0;i<s.length;i++)t.push(s[i]);return new e(t)},children:function(t){for(var r=[],s=0;s<this.length;s++)for(var i=this[s].childNodes,n=0;n<i.length;n++)t?1===i[n].nodeType&&a(i[n]).is(t)&&r.push(i[n]):1===i[n].nodeType&&r.push(i[n]);return new e(a.unique(r))},remove:function(){for(var e=0;e<this.length;e++)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){var e,t,r=this;for(e=0;e<arguments.length;e++){var s=a(arguments[e]);for(t=0;t<s.length;t++)r[r.length]=s[t],r.length++}return r}},a.fn=e.prototype,a.unique=function(e){for(var a=[],t=0;t<e.length;t++)-1===a.indexOf(e[t])&&a.push(e[t]);return a},a}()),r=["jQuery","Zepto","Dom7"],s=0;s<r.length;s++)window[r[s]]&&e(window[r[s]]);var i;i="undefined"==typeof t?window.Dom7||window.Zepto||window.jQuery:t,i&&("transitionEnd"in i.fn||(i.fn.transitionEnd=function(e){function a(i){if(i.target===this)for(e.call(this,i),t=0;t<r.length;t++)s.off(r[t],a)}var t,r=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=this;if(e)for(t=0;t<r.length;t++)s.on(r[t],a);return this}),"transform"in i.fn||(i.fn.transform=function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this}),"transition"in i.fn||(i.fn.transition=function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e}return this})),window.Swiper=a}(),"undefined"!=typeof module?module.exports=window.Swiper:"function"==typeof define&&define.amd&&define([],function(){"use strict";return window.Swiper});
//# sourceMappingURL=maps/swiper.min.js.map
var pagechange;

var LoadingImg = [];

function GetQueryString(){
    var r = unescape(location.hash);
    r=r.replace("#","");
    if(r!=null)return r; return null;
}

function GetQueryString_q(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return unescape(r[2]); return null;
}

;(function($){
    $(function(){
        
        // document.addEventListener('touchmove' , function (ev){
        //   ev.preventDefault();
        //   return false;
        // } , false)

        var pageArr = ["index","chose","selected","create","form","attention","share","poster","edit","view","friendEnter"];
        var $page = $('.page');

        function pageSlideOver(){
            $('.page-out').bind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){
                $(this).removeClass('page-out');
            });

            $('.page-in').bind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){
                $(this).removeClass('page-in');
            });
        }


        var curmoveval = false;
        function pageChange(){
            this.hashfun = function(){

                var curpageIndex = GetQueryString(); 
                if(curpageIndex){
                    pagechange.moveClick(curpageIndex);
                }else{
                    pagechange.moveClick("index");
                }

                if(curpageIndex=="create"||curpageIndex=="form"){
                    $("#dreambox").css({"height":$(window).height()});
                }
            },
            this.movePrev = function(a){
                var curArrIndex = pageArr.indexOf(a.attr("data-page"));
                if(curArrIndex>=pageArr.length-1)return false;
                curArrIndex++;

                a.removeClass('page-active').addClass('page-out');
                $('#'+pageArr[curArrIndex]).addClass('page-active page-in');

                pageSlideOver();
                history.pushState({"page": pageArr[curArrIndex]}, "" , "#"+pageArr[curArrIndex]);
            },
            this.moveNext = function(a){
                var curArrIndex = pageArr.indexOf(a.attr("data-page"));
                if(curArrIndex<=0)return false;
                curArrIndex--;

                a.removeClass('page-active').addClass('page-out');
                $('#'+pageArr[curArrIndex]).addClass('page-active page-in');

                pageSlideOver();
                history.pushState({"page": pageArr[curArrIndex]}, "" , "#"+pageArr[curArrIndex]);
            },
            this.moveClick = function(curclick,callbackFun){

                var curshow = $('.page-active').attr("data-page");
                var curShowIndex = pageArr.indexOf(curshow);
                var curClickIndex = pageArr.indexOf(curclick);
                if(curShowIndex === curClickIndex)return false;


                if(curShowIndex > curClickIndex){
                  $("#"+curshow).removeClass('page-active').addClass('page-out');
                  $('#'+curclick).addClass('page-active page-in');
                }else{
                  $("#"+curshow).removeClass('page-active').addClass('page-out');
                  $('#'+curclick).addClass('page-active page-in');
                }

                pageSlideOver();
                history.pushState({"page": curclick}, "" , "#"+curclick);

                if(curclick=="create"||curclick=="form"){
                    $("#dreambox").css({"height":$(window).height()});
                    
                }

            }

            

        }




        pagechange = new pageChange();

        pagechange.hashfun();   



    })
})(jQuery);



















var _doing = {
			curChoseGlassDreamNum : 0,
			emailReg : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			telReg : /^1[3|4|5|7|8][0-9]\d{8}$/,
			dreamListData : function(){     //index
				var dreamIndexData = eval( '(' + $('.default_dreams_home').html() + ')' );
				$("#dreamListCon").html(
					$.map(dreamIndexData,function(k,key){
						return '<div class="swiper-slide"><div class="listmodel m-1" data-id="'+k.dream_id+'"><div class="d_content"><p class="d-to">'+k.dream_num+'<sup>th</sup></p><p class="d-text">'+k.content+'</p><p class="d-from">'+k.nickname+'</p></div><img src="/images/ugc/list-model-'+key%5+'.png" width="100%" /></div></div> '
					}).join("")
				);

				var dreamSwiper = $('.dream-swiper').swiper({
					nextButton: '.listNext',
			        prevButton: '.listPrev',
			        paginationClickable: true,
			        loop: true
				});
			},
			getGlassData : function(){  //chose
				
				var dreamSelectedData = eval( '(' + $('.default_dreams_in').html() + ')' );
				$("#glassListCon").html($.map(glassList,function(v,k){
					return '<div class="swiper-slide"><div class="gl g-'+k+'""><a href="javascript:;" data-num="'+k+'"><img src="/images/ugc/g-'+k+'.png" width="100%" /></a></div><img src="'+v.pic_thumbnail+'" width="100%" /></div>'
				}).join(""));

				var glassSwiper = $('.glass-swiper').swiper({
						nextButton: '.glassArr-next',
				        prevButton: '.glassArr-prev',
				        paginationClickable: true,
				        loop: true,
				        onTouchEnd: function(swiper){
					    	if(swiper.swipeDirection == "prev"){
				        		_doing.curChoseGlassDreamNum--;
				        		if(_doing.curChoseGlassDreamNum < 0){
				        			_doing.curChoseGlassDreamNum = dreamSelectedData.length-1;
				        		}
				        	}else if(swiper.swipeDirection == "next"){
				        		_doing.curChoseGlassDreamNum++;
				        		if(_doing.curChoseGlassDreamNum > dreamSelectedData.length){
				        			_doing.curChoseGlassDreamNum = 0;
				        		}
				        	}
					    }
				});

				$(".gl a").click(function(){
					//console.log(curChoseGlassDreamNum)
					pagechange.moveClick('selected');
					var curChoseGlass = $(this).attr("data-num");

					$("#cur-glass").attr("src","/images/ugc/glass-bg-"+curChoseGlass+".jpg");
					_doing.getSelectedData(dreamSelectedData,curChoseGlass);
				})
				
			},
			getSelectedData : function(dreamSelectedData,curChoseGlass){    //selected
				
				var choseGlassnum = _doing.curChoseGlassDreamNum;
				
				var selectedDataInfo = $.map(dreamSelectedData,function(v,k){
						var islikeVal = "",islikecon = "支持";
						if(k==choseGlassnum){
							if(v.isliked == 1){
								islikeVal = "hover";
								islikecon = "已支持";
							}
							 
							return '<div class="hotArea"><div class="supportIcon '+islikeVal+'"><img src="/images/ugc/like'+islikeVal+'.png" width="100%" /><i>'+islikecon+'</i></div><div class="shareIcon"><img src="/images/ugc/shareIcon.png" width="100%" /><i>分享</i></div></div><div class="dreamMode"><div class="selectedModel_con" data-dream-id="'+v.dream_id+'"><div class="selectedNum">'+v.dream_num+'<sup>th</sup></div><div class="selectedCon">'+v.content+'</div><div class="selectedName">'+v.nickname+'</div></div><img src="/images/ugc/list-model-'+choseGlassnum%5+'.png" width="100%" /></div>'
						}

				})

				$("#selectedContent").html(selectedDataInfo);


				/* 点击支持当前梦想 */
				$(".supportIcon").click(function(){
					if($(this).hasClass("hover"))return false;

					var dream_id = $(".selectedModel_con").attr("data-dream-id");
					$(this).addClass("hover");
					$(".supportIcon i").html("已支持");
					$(".supportIcon img").attr("src","/images/ugc/likehover.png")
					_doing.dreamlike(dream_id);
				})


				/* 分享当前梦想 */
				$(".shareIcon").click(function(){
					$("#wechatTips").fadeIn();
				})

	

			},
			getCreateData : function(){   //跳转到创建页面
				pagechange.moveClick('create');
			},
			formData : function(){    //检测表单函数
				var fname = $("input[name='fname']"),
				    femail = $("input[name='femail']"),
				    ftel = $("input[name='ftel']");
				    //faddress = $("input[name='faddress']"); 
				//console.log(!this.emailReg.test(femail.val()));

				if(fname.val() == ""){
					fname.addClass("error").val("").attr("placeholder","姓名不能为空！");
					return false;
				}else if(!this.emailReg.test(femail.val())){
					femail.addClass("error").val("").attr("placeholder","邮箱输入有误！");
					return false;
				}else if (!this.telReg.test(ftel.val())){
					ftel.addClass("error").val("").attr("placeholder","手机号码输入有误！");
					return false;
				}else{
					$(".formSubmit_btn").addClass("isdoing_form").val("正在加载...");
					_doing.userInfoFun(fname.val(),femail.val(),ftel.val());
				}


				// else if(faddress.val()==""){
				// 	faddress.addClass("error").val("").attr("placeholder","地址不能为空！");
				// 	return false;
				// }

			},
			userInfoFun : function(fname,femail,ftel){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/userinfo",
				    data: {
				    	"name":fname, "email":femail, "cellphone":ftel
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	$(".isdoing_form").removeClass("isdoing_form").val("提交");
			    	if(data.status == 1){
			    		pagechange.moveClick('poster');
			    		alert("提交成功！");
			    	}
			    })
			},
			submitCreateFun : function(nickname,content){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/userdream",
				    data: {
				    	"nickname":nickname, "content":content
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	$(".isdoing").removeClass("isdoing").val("完成");
			    	if(data.status == 1){
			    		window.location.href = data.url+"#share";
			    	}else if(data.status == 023){
			    		alert("您已提交过梦想");
			    	}else{
			    		alert("创建失败!");
			    	}
			    })
			},
			dreamlike : function(dream_id){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/dreamlike",
				    data: {
				    	"dream_id":dream_id
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	
			    })
			},
			submitModifyCreateFun : function(nickname,content){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/dreamupdate",
				    data: {
				    	"nickname":nickname, "content":content
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	$(".isdoing").removeClass("isdoing").val("完成");
			    	if(data.status == 1){
			    		pagechange.moveClick('share');
			    		$("#share .creatTextCon").val(content);
			    		$("#share .creatTextName").val(nickname);
			    	}
			    })
			}
			
		}





;(function($){
	$(function(){

		document.getElementById('wechatTips').addEventListener('touchstart' , function (ev){
			ev.preventDefault();
			$("#wechatTips").fadeOut();
			return false;
		} , false)

		$(".formSubmit_btn").click(function(){
			if($(this).hasClass("isdoing_form"))return false;

			_doing.formData();
		})
	})
})(jQuery);








