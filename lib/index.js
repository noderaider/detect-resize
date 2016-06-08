'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
* Detect Element Resize.
* Forked in order to guard against unsafe 'window' and 'document' references by react-virtualized project.
* ES6ified and npmified by @noderaider.
*
* https://github.com/sdecima/javascript-detect-element-resize
* Sebastian Decima
*
* version: 0.5.3
**/

// Check `document` and `window` in case of server-side rendering
var IS_BROWSER = function IS_BROWSER() {
  return (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object';
};
var _window = IS_BROWSER() ? window : global;

var attachEvent = IS_BROWSER() ? document.attachEvent : false;
var stylesCreated = false;
var animationName = null;
var animationKeyframes = null;
var animationStyle = null;
var animationstartevent = null;

var resetTriggers = function resetTriggers(element) {
  var triggers = element.__resizeTriggers__;
  var expand = triggers.firstElementChild;
  var contract = triggers.lastElementChild;
  var expandChild = expand.firstElementChild;
  contract.scrollLeft = contract.scrollWidth;
  contract.scrollTop = contract.scrollHeight;
  expandChild.style.width = expand.offsetWidth + 1 + 'px';
  expandChild.style.height = expand.offsetHeight + 1 + 'px';
  expand.scrollLeft = expand.scrollWidth;
  expand.scrollTop = expand.scrollHeight;
};

var requestFrame = function () {
  var raf = _window.requestAnimationFrame || _window.mozRequestAnimationFrame || _window.webkitRequestAnimationFrame || function (fn) {
    return setTimeout(fn, 20);
  };
  return function (fn) {
    return raf(fn);
  };
}();

var cancelFrame = function () {
  var cancel = _window.cancelAnimationFrame || _window.mozCancelAnimationFrame || _window.webkitCancelAnimationFrame || _window.clearTimeout;
  return function (id) {
    return cancel(id);
  };
}();

var checkTriggers = function checkTriggers(element) {
  return element.offsetWidth != element.__resizeLast__.width || element.offsetHeight != element.__resizeLast__.height;
};
var scrollListener = function scrollListener(e) {
  var element = this;
  resetTriggers(this);
  if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
  this.__resizeRAF__ = requestFrame(function () {
    if (checkTriggers(element)) {
      element.__resizeLast__.width = element.offsetWidth;
      element.__resizeLast__.height = element.offsetHeight;
      element.__resizeListeners__.forEach(function (fn) {
        fn.call(element, e);
      });
    }
  });
};

if (IS_BROWSER() && !attachEvent) {

  /* Detect CSS Animations support to detect element display/re-attach */
  var animation = false;
  var animationstring = 'animation';
  var keyframeprefix = '';
  animationstartevent = 'animationstart';
  var domPrefixes = 'Webkit Moz O ms'.split(' ');
  var startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' ');
  var pfx = '';
  var elm = document.createElement('fakeelement');
  if (typeof elm.style.animationName !== 'undefined') animation = true;

  if (animation === false) {
    for (var i = 0; i < domPrefixes.length; i++) {
      if (typeof elm.style[domPrefixes[i] + 'AnimationName'] !== 'undefined') {
        pfx = domPrefixes[i];
        animationstring = pfx + 'Animation';
        keyframeprefix = '-' + pfx.toLowerCase() + '-';
        animationstartevent = startEvents[i];
        animation = true;
        break;
      }
    }
  }

  animationName = 'resizeanim';
  animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
  animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
}

var createStyles = function createStyles() {
  if (!stylesCreated) {
    //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
    var css = (animationKeyframes ? animationKeyframes : '') + '.resize-triggers { ' + (animationStyle ? animationStyle : '') + 'visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }';
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
    stylesCreated = true;
  }
};

var addResizeListener = function addResizeListener(element, fn) {
  if (attachEvent) element.attachEvent('onresize', fn);else if (IS_BROWSER()) {
    if (!element.__resizeTriggers__) {
      if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
      createStyles();
      element.__resizeLast__ = {};
      element.__resizeListeners__ = [];
      (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
      element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' + '<div class="contract-trigger"></div>';
      element.appendChild(element.__resizeTriggers__);
      resetTriggers(element);
      element.addEventListener('scroll', scrollListener, true);

      /* Listen for a css animation to detect element display/re-attach */
      animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function (e) {
        if (e.animationName == animationName) resetTriggers(element);
      });
    }
    element.__resizeListeners__.push(fn);
  }
};

var removeResizeListener = function removeResizeListener(element, fn) {
  if (attachEvent) element.detachEvent('onresize', fn);else if (IS_BROWSER()) {
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
      element.removeEventListener('scroll', scrollListener, true);
      element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
    }
  }
};

exports.addResizeListener = addResizeListener;
exports.removeResizeListener = removeResizeListener;