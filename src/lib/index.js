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
const IS_BROWSER = () => typeof window === 'object'
const _window = IS_BROWSER() ? window : global

const attachEvent = IS_BROWSER() ? document.attachEvent : false
let stylesCreated = false
let animationName = null
let animationKeyframes = null
let animationStyle = null
let animationstartevent = null

const resetTriggers = function(element) {
  let triggers = element.__resizeTriggers__
  let expand = triggers.firstElementChild
  let contract = triggers.lastElementChild
  let expandChild = expand.firstElementChild
  contract.scrollLeft = contract.scrollWidth
  contract.scrollTop = contract.scrollHeight
  expandChild.style.width = `${expand.offsetWidth + 1}px`
  expandChild.style.height = `${expand.offsetHeight + 1}px`
  expand.scrollLeft = expand.scrollWidth
  expand.scrollTop = expand.scrollHeight
}

const requestFrame = (function() {
  let raf = _window.requestAnimationFrame || _window.mozRequestAnimationFrame || _window.webkitRequestAnimationFrame || (fn => setTimeout(fn, 20))
  return fn => raf(fn)
})()

const cancelFrame = (function() {
  let cancel = _window.cancelAnimationFrame || _window.mozCancelAnimationFrame || _window.webkitCancelAnimationFrame || _window.clearTimeout
  return id => cancel(id)
})()

const checkTriggers = element => element.offsetWidth != element.__resizeLast__.width || element.offsetHeight != element.__resizeLast__.height
const scrollListener = function(e){
  let element = this
  resetTriggers(this)
  if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__)
  this.__resizeRAF__ = requestFrame(function(){
    if (checkTriggers(element)) {
      element.__resizeLast__.width = element.offsetWidth
      element.__resizeLast__.height = element.offsetHeight
      element.__resizeListeners__.forEach(function(fn){
        fn.call(element, e)
      })
    }
  })
}

if (IS_BROWSER() && !attachEvent) {

  /* Detect CSS Animations support to detect element display/re-attach */
  let animation = false
  let animationstring = 'animation'
  let keyframeprefix = ''
  animationstartevent = 'animationstart'
  let domPrefixes = 'Webkit Moz O ms'.split(' ')
  let startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' ')
  let pfx  = ''
  const elm = document.createElement('fakeelement')
  if(typeof elm.style.animationName !== 'undefined') animation = true

  if(animation === false) {
    for( var i = 0; i < domPrefixes.length; i++ ) {
      if(typeof elm.style[ domPrefixes[i] + 'AnimationName' ] !== 'undefined') {
        pfx = domPrefixes[i]
        animationstring = pfx + 'Animation'
        keyframeprefix = '-' + pfx.toLowerCase() + '-'
        animationstartevent = startEvents[ i ]
        animation = true
        break
      }
    }
  }

  animationName = 'resizeanim'
  animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } '
  animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; '
}

const createStyles = function() {
  if (!stylesCreated) {
    //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
    let css = `${(animationKeyframes ? animationKeyframes : '')}.resize-triggers { ${(animationStyle ? animationStyle : '')}visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }`
    let head = document.head || document.getElementsByTagName('head')[0]
    let style = document.createElement('style')

    style.type = 'text/css'
    if (style.styleSheet) {
      style.styleSheet.cssText = css
    } else {
      style.appendChild(document.createTextNode(css))
    }

    head.appendChild(style)
    stylesCreated = true
  }
}

const addResizeListener = function(element, fn){
  if (attachEvent) element.attachEvent('onresize', fn)
  else if(IS_BROWSER()) {
    if (!element.__resizeTriggers__) {
      if (getComputedStyle(element).position == 'static') element.style.position = 'relative'
      createStyles()
      element.__resizeLast__ = {}
      element.__resizeListeners__ = [];
      (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers'
      element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
                                          '<div class="contract-trigger"></div>'
      element.appendChild(element.__resizeTriggers__)
      resetTriggers(element)
      element.addEventListener('scroll', scrollListener, true)

      /* Listen for a css animation to detect element display/re-attach */
      animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function(e) {
        if(e.animationName == animationName)
          resetTriggers(element)
      })
    }
    element.__resizeListeners__.push(fn)
  }
}

const removeResizeListener = function(element, fn){
  if (attachEvent) element.detachEvent('onresize', fn)
  else if(IS_BROWSER()) {
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1)
    if (!element.__resizeListeners__.length) {
        element.removeEventListener('scroll', scrollListener, true)
        element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__)
    }
  }
}

export { addResizeListener, removeResizeListener }
