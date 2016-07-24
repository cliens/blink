//! blink.js
//! version : 0.1.0
//! authors : cliens
//! license : MIT

(function () {
    "use strict";

    function Blink(config, context) {
        config = config || {};

        this.config = {
            context: context || config.context || document.body,  // where the text type in
            blinkTime: config.blinkTime || 260, // cursor blink time
            auto: false,    // auto time
            frequency: config.frequency || 1
        };

        this.runBlock = [];

        Blink.extend(this.config, config);

        this.txt = '';
        this.cursorNode = document.createElement('span') || this.createTextNode('|');
        this.textNode = this.createTextNode('');
        this.cursorTimer = null;
        this.typeTimer = null;
        this.next = -1;
        this.init();
    }


    Blink.extend = function (dst, src) {
        var k, v;
        if (arguments.length == 1) {
            src = dst;
            dst = Blink.prototype;
        }
        for (k in src) {
            v = src[k];
            dst[k] = v;
        }
        return dst;
    };

    Blink.fn = Blink.prototype = {
        constructor: Blink
    };
    Blink.fn.extend = Blink.extend;

    Blink.fn.extend({
        createTextNode: function (text) {
            return document.createTextNode(text || '');
        },
        createNode: function (tagName) {
            return document.createElement(tagName || 'span');
        },
        isTextNode: function (node) {
            return node.nodeType === 3;
        },
        isBr: function (node) {
            return node.nodeType === 1 && node.nodeName.toUpperCase() == 'BR';
        }
    });

    Blink.fn.extend({
        init: function () {
            var that = this;
            var context = that.config.context;

            context.appendChild(that.cursorNode);
            context.insertBefore(that.textNode, that.cursorNode);
            that.cursorTimer = that.blinkCursor();
        },
        run: function () {
            this.getNext();
        },
        blinkCursor: function () {
            var that = this;
            var nowCursor = '|';

            return setInterval(function () {
                nowCursor = nowCursor == '|' ? '' : '|';
                that.cursorNode.innerHTML = nowCursor;
            }, that.config.blinkTime);
        },
        typeController: function (char, frequenecy) {
            var that = this
                , speed = 0;

            frequenecy = frequenecy || this.config.frequency;
            speed = ~~(that.config.blinkTime / 1 / frequenecy);

            if (that.config.auto) {
                speed = ~~(Math.random() * speed);
            }
            clearTimeout(that.typeTimer);
            that.typeTimer = setTimeout(function (char) {
                that.textNode.appendData(char);
                if (!char) {
                    that.getNext();
                    return;
                }
                that.typeController(that.getNextChar(), frequenecy);
            }, speed, char);
        },
        getNextChar: function () {
            var that = this;
            var char = '';

            that.txt.replace(/^(\W|\s|.)/, function (c1, c2, i) {
                that.txt = that.txt.substr(i + 1);
                char = c1;
            });
            return char;
        },
        type: function (text, frequenecy, config) {
            var that = this;

            that.push(function _text() {
                that.txt = text;
                if (!text) {
                    that.getNext();
                    return;
                }

                that.txt = that.txt.replace(/\u0020/g, '\b '); // 空格转换
                that.txt = that.txt.replace(/\t/g, '\b \b \b \b '); // tab转换

                var char = that.getNextChar();
                that.typeController(char);
            });

            return that;
        },
        push: function (text) {
            this.runBlock.push(text);
            return this;
        },
        getNext: function () {
            var next = this.runBlock[++this.next];

            this.textNode = this.cursorNode.previousSibling;
            if (typeof next == 'function') {
                next();
                return this;
            }
        }
    });


    Blink.fn.extend({
        delay: function (time) {
            time = time || 0;
            var that = this;

            that.push(function _delay() {
                setTimeout(function () {
                    that.getNext();
                }, time)
            });
            return that;
        },

        enter: function (count) {
            count = count || 1;
            var that = this;

            that.push(function _enter() {
                var frag = document.createDocumentFragment();
                var brNode = null;

                while (count--) {
                    brNode = that.createNode('br');
                    frag.appendChild(brNode);
                }
                that.config.context.insertBefore(frag, that.cursorNode);
                that.textNode = that.createTextNode('');
                that.config.context.insertBefore(that.textNode, that.cursorNode);
                that.getNext();
            });
            return that;
        },
        space: function (count) {
            count = count || 1;
            var that = this;

            that.push(function _space() {
                var frag = document.createDocumentFragment();
                var blankNode = null;
                var blankStr = '\b \b';
                var tempStr = '';

                while (count--) {
                    tempStr += blankStr;
                }
                blankNode = that.createTextNode(tempStr);
                frag.appendChild(blankNode);
                that.config.context.insertBefore(frag, that.cursorNode);
                that.getNext();
            });
            return that;
        },
        tab: function (count) {
            count = count || 1;
            var that = this;

            that.push(function _tab() {
                var frag = document.createDocumentFragment();
                var blankNode = null;
                var tabStr = '\b\t\b\t\b\t\b\t\b';
                var tempStr = '';

                while (count--) {
                    tempStr += tabStr;
                }
                blankNode = that.createTextNode(tempStr);
                frag.appendChild(blankNode);
                that.config.context.insertBefore(blankNode, that.cursorNode);
                that.getNext();
            });
            return that;
        },
        backspace: function (count) {
            count = count || 1;
            var that = this;
            var previous = null;
            var len = 0;

            function backspace() {
                previous = that.cursorNode.previousSibling;
                if (that.isTextNode(previous) && !previous.length) {
                    that.config.context.removeChild(previous);
                    previous = that.cursorNode.previousSibling;
                }

                if (that.isTextNode(previous)) {
                    len = previous.length;
                    previous.deleteData(len - 1, 1);
                }

                if (that.isBr(previous)) {
                    that.config.context.removeChild(previous);
                }

                // 补偿节点
                if (that.isBr(that.cursorNode.previousSibling)) {
                    that.textNode = that.createTextNode('');
                    that.config.context.insertBefore(that.textNode, that.cursorNode);
                }
            }

            that.push(function _backspace() {
                while (count--) {
                    backspace();
                }
                that.getNext();
            });
            return that;
        },
        done: function () {
            var that = this;

            that.runBlock.push(function _done() {
                clearInterval(that.cursorTimer);
                that.cursorNode.innerHTML = '';
            });
            return that;
        }
    });

    window.blink = function(config, context) {
        return new Blink(config, context)
    };
})()
