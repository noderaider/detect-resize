## detect-resize

**Slightly refactored version of https://github.com/sdecima/javascript-detect-element-resize targeting universal React applications. Will not throw if imported (ES6) on the server.**

[![Build Status](https://travis-ci.org/noderaider/detect-resize.svg?branch=master)](https://travis-ci.org/noderaider/detect-resize)

[![NPM](https://nodei.co/npm/detect-resize.png?stars=true&downloads=true)](https://nodei.co/npm/detect-resize/)


## Install

`npm i -S detect-resize`


## How to use

Should work the same as [javascript-detect-element-resize](https://github.com/sdecima/javascript-detect-element-resize) without throwing errors if used in a server environment.

```js
import { addResizeListener, removeResizeListener } from 'detect-resize'

const resizeElement = document.getElementById('resizeElement'),
const handleResize = () => { console.info('resized') }

addResizeListener(resizeElement, handleResize)
removeResizeListener(resizeElement, handleResize)
```
