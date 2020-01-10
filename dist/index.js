'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var d3Array = require('d3-array');
var React = require('react');
var React__default = _interopDefault(React);
var seedrandom = _interopDefault(require('seedrandom'));
var d3Selection = require('d3-selection');
var ResizeObserver = _interopDefault(require('resize-observer-polyfill'));
require('d3-transition');
var tippy = _interopDefault(require('tippy.js'));
var d3Scale = require('d3-scale');
var d3ScaleChromatic = require('d3-scale-chromatic');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

// @ts-nocheck
/**
 * TEMPORARY workaround:
 * Should re-write this in typescript in the future
 */
// Word cloud layout by Jason Davies, https://www.jasondavies.com/wordcloud/
// Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf
var dispatch = require('d3-dispatch').dispatch;
var cloudRadians = Math.PI / 180, cw = (1 << 11) >> 5, ch = 1 << 11;
function cloud () {
    var size = [256, 256], text = cloudText, font = cloudFont, fontSize = cloudFontSize, fontStyle = cloudFontNormal, fontWeight = cloudFontNormal, rotate = cloudRotate, padding = cloudPadding, spiral = archimedeanSpiral, words = [], timeInterval = Infinity, event = dispatch('word', 'end'), timer = null, random = Math.random, cloud = {}, canvas = cloudCanvas;
    var killed = false;
    cloud.canvas = function (_) {
        return arguments.length ? ((canvas = functor(_)), cloud) : canvas;
    };
    cloud.start = function () {
        var contextAndRatio = getContext(canvas()), board = zeroArray((size[0] >> 5) * size[1]), bounds = null, n = words.length, tags = [], data = words
            .map(function (d, i) {
            d.text = text.call(this, d, i);
            d.font = font.call(this, d, i);
            d.style = fontStyle.call(this, d, i);
            d.weight = fontWeight.call(this, d, i);
            d.rotate = rotate.call(this, d, i);
            d.size = ~~fontSize.call(this, d, i);
            d.padding = padding.call(this, d, i);
            return d;
        })
            .sort(function (a, b) {
            return b.size - a.size;
        });
        function multiStep(from, to) {
            for (var i_1 = from; i_1 < to; i_1 += 1) {
                var d = data[i_1];
                d.x = (size[0] * (random() + 0.5)) >> 1;
                d.y = (size[1] * (random() + 0.5)) >> 1;
                cloudSprite(contextAndRatio, d, data, i_1);
                if (d.hasText && place(board, d, bounds)) {
                    tags.push(d);
                    event.call('word', cloud, d);
                    if (bounds)
                        cloudBounds(bounds, d);
                    else
                        bounds = [
                            { x: d.x + d.x0, y: d.y + d.y0 },
                            { x: d.x + d.x1, y: d.y + d.y1 },
                        ];
                    // Temporary hack
                    d.x -= size[0] >> 1;
                    d.y -= size[1] >> 1;
                }
            }
        }
        function loop(i) {
            var step = 50;
            var from = i * step;
            var to = Math.min((i + 1) * step, words.length);
            multiStep(from, to);
            if (to < words.length && !killed) {
                setTimeout(function () { return loop(i + 1); }, 0);
            }
            else {
                cloud.stop();
                event.call('end', cloud, tags, bounds);
            }
        }
        setTimeout(function () { return loop(0); }, 0);
        return cloud;
    };
    cloud.revive = function () {
        killed = false;
        return cloud;
    };
    cloud.stop = function () {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        killed = true;
        return cloud;
    };
    function getContext(canvas) {
        canvas.width = canvas.height = 1;
        var ratio = Math.sqrt(canvas.getContext('2d').getImageData(0, 0, 1, 1).data.length >> 2);
        canvas.width = (cw << 5) / ratio;
        canvas.height = ch / ratio;
        var context = canvas.getContext('2d');
        context.fillStyle = context.strokeStyle = 'red';
        context.textAlign = 'center';
        return { context: context, ratio: ratio };
    }
    function place(board, tag, bounds) {
        var perimeter = [{ x: 0, y: 0 }, { x: size[0], y: size[1] }], startX = tag.x, startY = tag.y, maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]), s = spiral(size), dt = random() < 0.5 ? 1 : -1, t = -dt, dxdy, dx, dy;
        while ((dxdy = s((t += dt)))) {
            dx = ~~dxdy[0];
            dy = ~~dxdy[1];
            if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta)
                break;
            tag.x = startX + dx;
            tag.y = startY + dy;
            if (tag.x + tag.x0 < 0 ||
                tag.y + tag.y0 < 0 ||
                tag.x + tag.x1 > size[0] ||
                tag.y + tag.y1 > size[1])
                continue;
            // TODO only check for collisions within current bounds.
            if (!bounds || !cloudCollide(tag, board, size[0])) {
                if (!bounds || collideRects(tag, bounds)) {
                    var sprite = tag.sprite, w = tag.width >> 5, sw = size[0] >> 5, lx = tag.x - (w << 4), sx = lx & 0x7f, msx = 32 - sx, h = tag.y1 - tag.y0, x = (tag.y + tag.y0) * sw + (lx >> 5), last;
                    for (var j = 0; j < h; j++) {
                        last = 0;
                        for (var i = 0; i <= w; i++) {
                            board[x + i] |=
                                (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
                        }
                        x += sw;
                    }
                    delete tag.sprite;
                    return true;
                }
            }
        }
        return false;
    }
    cloud.timeInterval = function (_) {
        return arguments.length
            ? ((timeInterval = _ == null ? Infinity : _), cloud)
            : timeInterval;
    };
    cloud.words = function (_) {
        return arguments.length ? ((words = _), cloud) : words;
    };
    cloud.size = function (_) {
        return arguments.length ? ((size = [+_[0], +_[1]]), cloud) : size;
    };
    cloud.font = function (_) {
        return arguments.length ? ((font = functor(_)), cloud) : font;
    };
    cloud.fontStyle = function (_) {
        return arguments.length ? ((fontStyle = functor(_)), cloud) : fontStyle;
    };
    cloud.fontWeight = function (_) {
        return arguments.length ? ((fontWeight = functor(_)), cloud) : fontWeight;
    };
    cloud.rotate = function (_) {
        return arguments.length ? ((rotate = functor(_)), cloud) : rotate;
    };
    cloud.text = function (_) {
        return arguments.length ? ((text = functor(_)), cloud) : text;
    };
    cloud.spiral = function (_) {
        return arguments.length ? ((spiral = spirals[_] || _), cloud) : spiral;
    };
    cloud.fontSize = function (_) {
        return arguments.length ? ((fontSize = functor(_)), cloud) : fontSize;
    };
    cloud.padding = function (_) {
        return arguments.length ? ((padding = functor(_)), cloud) : padding;
    };
    cloud.random = function (_) {
        return arguments.length ? ((random = _), cloud) : random;
    };
    cloud.on = function () {
        var value = event.on.apply(event, arguments);
        return value === event ? cloud : value;
    };
    return cloud;
}
function cloudText(d) {
    return d.text;
}
function cloudFont() {
    return 'serif';
}
function cloudFontNormal() {
    return 'normal';
}
function cloudFontSize(d) {
    return Math.sqrt(d.value);
}
function cloudRotate() {
    return (~~(Math.random() * 6) - 3) * 30;
}
function cloudPadding() {
    return 1;
}
// Fetches a monochrome sprite bitmap for the specified text.
// Load in batches for speed.
function cloudSprite(contextAndRatio, d, data, di) {
    if (d.sprite)
        return;
    var c = contextAndRatio.context, ratio = contextAndRatio.ratio;
    c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
    var x = 0, y = 0, maxh = 0, n = data.length;
    --di;
    while (++di < n) {
        d = data[di];
        c.save();
        c.font =
            d.style +
                ' ' +
                d.weight +
                ' ' +
                ~~((d.size + 1) / ratio) +
                'px ' +
                d.font;
        var w = c.measureText(d.text + 'm').width * ratio, h = d.size << 1;
        if (d.rotate) {
            var sr = Math.sin(d.rotate * cloudRadians), cr = Math.cos(d.rotate * cloudRadians), wcr = w * cr, wsr = w * sr, hcr = h * cr, hsr = h * sr;
            w =
                ((Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5) << 5;
            h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
        }
        else {
            w = ((w + 0x1f) >> 5) << 5;
        }
        if (h > maxh)
            maxh = h;
        if (x + w >= cw << 5) {
            x = 0;
            y += maxh;
            maxh = 0;
        }
        if (y + h >= ch)
            break;
        c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
        if (d.rotate)
            c.rotate(d.rotate * cloudRadians);
        c.fillText(d.text, 0, 0);
        if (d.padding) {
            c.lineWidth = 2 * d.padding;
            c.strokeText(d.text, 0, 0);
        }
        c.restore();
        d.width = w;
        d.height = h;
        d.xoff = x;
        d.yoff = y;
        d.x1 = w >> 1;
        d.y1 = h >> 1;
        d.x0 = -d.x1;
        d.y0 = -d.y1;
        d.hasText = true;
        x += w;
    }
    var pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data, sprite = [];
    while (--di >= 0) {
        d = data[di];
        if (!d.hasText)
            continue;
        var w = d.width, w32 = w >> 5, h = d.y1 - d.y0;
        // Zero the buffer
        for (var i = 0; i < h * w32; i++)
            sprite[i] = 0;
        x = d.xoff;
        if (x == null)
            return;
        y = d.yoff;
        var seen = 0, seenRow = -1;
        for (var j = 0; j < h; j++) {
            for (var i = 0; i < w; i++) {
                var k = w32 * j + (i >> 5), m = pixels[((y + j) * (cw << 5) + (x + i)) << 2]
                    ? 1 << (31 - (i % 32))
                    : 0;
                sprite[k] |= m;
                seen |= m;
            }
            if (seen)
                seenRow = j;
            else {
                d.y0++;
                h--;
                j--;
                y++;
            }
        }
        d.y1 = d.y0 + seenRow;
        d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
    }
}
// Use mask-based collision detection.
function cloudCollide(tag, board, sw) {
    sw >>= 5;
    var sprite = tag.sprite, w = tag.width >> 5, lx = tag.x - (w << 4), sx = lx & 0x7f, msx = 32 - sx, h = tag.y1 - tag.y0, x = (tag.y + tag.y0) * sw + (lx >> 5), last;
    for (var j = 0; j < h; j++) {
        last = 0;
        for (var i = 0; i <= w; i++) {
            if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0)) &
                board[x + i])
                return true;
        }
        x += sw;
    }
    return false;
}
function cloudBounds(bounds, d) {
    var b0 = bounds[0], b1 = bounds[1];
    if (d.x + d.x0 < b0.x)
        b0.x = d.x + d.x0;
    if (d.y + d.y0 < b0.y)
        b0.y = d.y + d.y0;
    if (d.x + d.x1 > b1.x)
        b1.x = d.x + d.x1;
    if (d.y + d.y1 > b1.y)
        b1.y = d.y + d.y1;
}
function collideRects(a, b) {
    return (a.x + a.x1 > b[0].x &&
        a.x + a.x0 < b[1].x &&
        a.y + a.y1 > b[0].y &&
        a.y + a.y0 < b[1].y);
}
function archimedeanSpiral(size) {
    var e = size[0] / size[1];
    return function (t) {
        return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
    };
}
function rectangularSpiral(size) {
    var dy = 4, dx = (dy * size[0]) / size[1], x = 0, y = 0;
    return function (t) {
        var sign = t < 0 ? -1 : 1;
        // See triangular numbers: T_n = n * (n + 1) / 2.
        switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
            case 0:
                x += dx;
                break;
            case 1:
                y += dy;
                break;
            case 2:
                x -= dx;
                break;
            default:
                y -= dy;
                break;
        }
        return [x, y];
    };
}
function zeroArray(n) {
    var a = new Uint32Array(n);
    return a;
}
function cloudCanvas() {
    return document.createElement('canvas');
}
function functor(d) {
    return typeof d === 'function'
        ? d
        : function () {
            return d;
        };
}
var spirals = {
    archimedean: archimedeanSpiral,
    rectangular: rectangularSpiral,
};

function useResponsiveSVGSelection(minSize, initialSize) {
    var elementRef = React.useRef();
    var _a = React.useState(initialSize), size = _a[0], setSize = _a[1];
    var _b = React.useState(null), selection = _b[0], setSelection = _b[1];
    React.useEffect(function () {
        var element = elementRef.current;
        // set svg selection
        var svg = d3Selection.select(element)
            .append('svg')
            .style('display', 'block'); // native inline svg leaves undesired white space
        var selection = svg.append('g');
        setSelection(selection);
        function updateSize(width, height) {
            svg.attr('height', height).attr('width', width);
            selection.attr('transform', "translate(" + width / 2 + ", " + height / 2 + ")");
            setSize([width, height]);
        }
        var width = 0;
        var height = 0;
        if (initialSize !== undefined) {
            // Use initialSize if it is provided
            width = initialSize[0], height = initialSize[1];
        }
        else {
            // Use parentNode size if resized has not updated
            width = element.parentElement.offsetWidth;
            height = element.parentElement.offsetHeight;
        }
        width = Math.max(width, minSize[0]);
        height = Math.max(height, minSize[1]);
        updateSize(width, height);
        // update resize using a resize observer
        var resizeObserver = new ResizeObserver(function (entries) {
            if (!entries || !entries.length) {
                return;
            }
            if (initialSize === undefined) {
                var _a = entries[0].contentRect, width_1 = _a.width, height_1 = _a.height;
                updateSize(width_1, height_1);
            }
        });
        resizeObserver.observe(element);
        // cleanup
        return function () {
            resizeObserver.unobserve(element);
            d3Selection.select(element)
                .selectAll('*')
                .remove();
        };
    }, [initialSize, minSize]);
    return [elementRef, selection, size];
}

(function (Scale) {
    Scale["Linear"] = "linear";
    Scale["Log"] = "log";
    Scale["Sqrt"] = "sqrt";
})(exports.Scale || (exports.Scale = {}));
(function (Spiral) {
    Spiral["Archimedean"] = "archimedean";
    Spiral["Rectangular"] = "rectangular";
})(exports.Spiral || (exports.Spiral = {}));

function choose(array, random) {
    return array[Math.floor(random() * array.length)];
}
function getDefaultColors() {
    return d3Array.range(20)
        .map(function (number) { return number.toString(); })
        .map(d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10));
}
function getFontScale(words, fontSizes, scale) {
    var minSize = d3Array.min(words, function (word) { return word.value; });
    var maxSize = d3Array.max(words, function (word) { return word.value; });
    var scaleFunction;
    switch (scale) {
        case exports.Scale.Log:
            scaleFunction = d3Scale.scaleLog;
            break;
        case exports.Scale.Sqrt:
            scaleFunction = d3Scale.scaleSqrt;
            break;
        case exports.Scale.Linear:
        default:
            scaleFunction = d3Scale.scaleLinear;
            break;
    }
    var fontScale = scaleFunction()
        .domain([minSize, maxSize])
        .range(fontSizes);
    return fontScale;
}
function getText(word) {
    return word.text;
}
function getFontSize(word) {
    return word.size + "px";
}
function getTransform(word) {
    var translate = "translate(" + word.x + ", " + word.y + ")";
    var rotate = typeof word.rotate === 'number' ? "rotate(" + word.rotate + ")" : '';
    return translate + rotate;
}
function rotate(rotations, rotationAngles, random) {
    if (rotations < 1) {
        return 0;
    }
    var angles = [];
    if (rotations === 1) {
        angles = [rotationAngles[0]];
    }
    else {
        angles = __spreadArrays(rotationAngles);
        var increment = (rotationAngles[1] - rotationAngles[0]) / (rotations - 1);
        var angle = rotationAngles[0] + increment;
        while (angle < rotationAngles[1]) {
            angles.push(angle);
            angle += increment;
        }
    }
    return choose(angles, random);
}

var tooltipInstance;
function render(selection, words, options, callbacks, random) {
    var getWordColor = callbacks.getWordColor, getWordTooltip = callbacks.getWordTooltip, onWordClick = callbacks.onWordClick, onWordMouseOver = callbacks.onWordMouseOver, onWordMouseOut = callbacks.onWordMouseOut;
    var colors = options.colors, enableTooltip = options.enableTooltip, fontStyle = options.fontStyle, fontWeight = options.fontWeight;
    var fontFamily = options.fontFamily, transitionDuration = options.transitionDuration;
    function getFill(word) {
        return getWordColor ? getWordColor(word) : choose(colors, random);
    }
    // load words
    var vizWords = selection.selectAll('text').data(words);
    vizWords.join(function (enter) {
        return enter
            .append('text')
            .on('click', function (word) {
            onWordClick && onWordClick(word, d3Selection.event);
        })
            .on('mouseover', function (word) {
            if (enableTooltip) {
                tooltipInstance = tippy(d3Selection.event.target, {
                    animation: 'scale',
                    arrow: true,
                    content: function () {
                        return getWordTooltip(word);
                    },
                });
            }
            onWordMouseOver && onWordMouseOver(word, d3Selection.event);
        })
            .on('mouseout', function (word) {
            if (tooltipInstance) {
                tooltipInstance.destroy();
            }
            onWordMouseOut && onWordMouseOut(word, d3Selection.event);
        })
            .attr('cursor', onWordClick ? 'pointer' : 'default')
            .attr('fill', getFill)
            .attr('font-family', fontFamily)
            .attr('font-style', fontStyle)
            .attr('font-weight', fontWeight)
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(0, 0) rotate(0)')
            .call(function (enter) {
            return enter
                .transition()
                .duration(transitionDuration)
                .attr('font-size', getFontSize)
                .attr('transform', getTransform)
                .text(getText);
        });
    }, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function (update) {
        return update
            .transition()
            .duration(transitionDuration)
            .attr('fill', getFill)
            .attr('font-family', fontFamily)
            .attr('font-size', getFontSize)
            .attr('transform', getTransform)
            .text(getText);
    }, function (exit) {
        exit
            .transition()
            .duration(transitionDuration)
            .attr('fill-opacity', 0)
            .remove();
    });
}

function debounce(func, wait, immediate) {
    var timeout;
    var context = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var later = function () {
            timeout = null;
            if (!immediate)
                return func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        // @ts-ignore
        timeout = setTimeout(later, wait);
        if (callNow)
            return func.apply(context, args);
    };
}

var MAX_LAYOUT_ATTEMPTS = 10;
var SHRINK_FACTOR = 0.95;
var defaultCallbacks = {
    getWordTooltip: function (_a) {
        var text = _a.text, value = _a.value;
        return text + " (" + value + ")";
    },
};
var defaultOptions = {
    colors: getDefaultColors(),
    deterministic: false,
    enableTooltip: true,
    fontFamily: 'times new roman',
    fontSizes: [4, 32],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotationAngles: [-90, 90],
    scale: exports.Scale.Sqrt,
    spiral: exports.Spiral.Rectangular,
    transitionDuration: 600,
};
function Wordcloud(_a) {
    var callbacks = _a.callbacks, _b = _a.maxWords, maxWords = _b === void 0 ? 100 : _b, minSize = _a.minSize, options = _a.options, initialSize = _a.size, words = _a.words, _c = _a.wait, wait = _c === void 0 ? 100 : _c;
    var mergedCallbacks = __assign(__assign({}, defaultCallbacks), callbacks);
    var mergedOptions = __assign(__assign({}, defaultOptions), options);
    var _d = useResponsiveSVGSelection(minSize, initialSize), ref = _d[0], selection = _d[1], size = _d[2];
    var reRender = React.useRef(debounce(function (selection, mergedOptions, mergedCallbacks, size, words, maxWords) {
        var deterministic = mergedOptions.deterministic, fontFamily = mergedOptions.fontFamily, fontStyle = mergedOptions.fontStyle, fontSizes = mergedOptions.fontSizes, fontWeight = mergedOptions.fontWeight, padding = mergedOptions.padding, rotations = mergedOptions.rotations, rotationAngles = mergedOptions.rotationAngles, spiral = mergedOptions.spiral, scale = mergedOptions.scale;
        var sortedWords = words
            .concat()
            .sort(function (x, y) { return d3Array.descending(x.value, y.value); })
            .slice(0, maxWords);
        var random = deterministic
            ? seedrandom('deterministic')
            : seedrandom();
        var layout = cloud()
            .size(size)
            .padding(padding)
            .words(sortedWords)
            .rotate(function () {
            if (rotations === undefined) {
                // default rotation algorithm
                return (~~(random() * 6) - 3) * 30;
            }
            else {
                return rotate(rotations, rotationAngles, random);
            }
        })
            .spiral(spiral)
            .random(random)
            .text(getText)
            .font(fontFamily)
            .fontStyle(fontStyle)
            .fontWeight(fontWeight);
        var draw = function (fontSizes, attempts) {
            if (attempts === void 0) { attempts = 1; }
            layout
                .revive()
                .fontSize(function (word) {
                var fontScale = getFontScale(sortedWords, fontSizes, scale);
                return fontScale(word.value);
            })
                .on('end', function (computedWords) {
                /** KNOWN ISSUE: https://github.com/jasondavies/d3-cloud/issues/36
                 * Recursively layout and decrease font-sizes by a SHRINK_FACTOR.
                 * Bail out with a warning message after MAX_LAYOUT_ATTEMPTS.
                 */
                if (sortedWords.length !== computedWords.length &&
                    attempts <= MAX_LAYOUT_ATTEMPTS) {
                    if (attempts === MAX_LAYOUT_ATTEMPTS) {
                        console.warn("Unable to layout " + (sortedWords.length -
                            computedWords.length) + " word(s) after " + attempts + " attempts.  Consider: (1) Increasing the container/component size. (2) Lowering the max font size. (3) Limiting the rotation angles.");
                    }
                    var minFontSize = Math.max(fontSizes[0] * SHRINK_FACTOR, 1);
                    var maxFontSize = Math.max(fontSizes[1] * SHRINK_FACTOR, minFontSize);
                    layout.stop();
                    draw([minFontSize, maxFontSize], attempts + 1);
                }
                else {
                    render(selection, computedWords, mergedOptions, mergedCallbacks, random);
                }
            })
                .start();
        };
        draw(fontSizes);
        return function () {
            layout.stop();
        };
    }, wait));
    React.useEffect(function () {
        if (selection) {
            return reRender.current(selection, mergedOptions, mergedCallbacks, size, words, maxWords);
        }
    }, [maxWords, mergedCallbacks, mergedOptions, selection, size, words]);
    return React__default.createElement("div", { ref: ref });
}
Wordcloud.defaultProps = {
    callbacks: defaultCallbacks,
    maxWords: 100,
    minSize: [300, 300],
    options: defaultOptions,
};

exports.default = Wordcloud;
exports.defaultCallbacks = defaultCallbacks;
exports.defaultOptions = defaultOptions;
