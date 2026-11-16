# HTML textures

**Note:** This API is still under development, so breaking changes may occur at any time.

neoOMSI can display an HTML page on a vehicle or scenery texture. This lets content creators
build screens such as an IBIS display or dashboard using HTML, CSS, and JavaScript.

This documentation explains how to use the API in HTML. If anything is missing or you encounter any issues, please feel
free to open an issue with relevant information and steps to reproduce the problem.

Start with the [complete dashboard example](https://docs.neoomsi.com/examples/html-texture.html).
It uses the same vehicle API documented below and is included as a runnable fixture in the
engine source repository.

### Example model config:

```
[htmltexture]
1024
512
html\index.html

##########################################

[mesh]
generic\AFR4\AFR4_Display.o3d

[visible]
AFR4_Display
1

[matl]
afr4.dds
0

[useHtmlTexture]
0

[matl_lightmap]
1px_lm.bmp
0.5

[matl_freetex]
afr4.dds
AFR4_ST_texture

[matl_transmap]
\S:7

[viewpoint]
3
```

`[useHtmlTexture]` describes which `[htmlTexture]` it is; `\S:7` is the corresponding script texture ID in this case.
Note: An `[htmlTexture]` is registered as a `[scriptTexture]`, but it is also registered as an `[htmlTexture]`.

This means: If an `htmlTexture` follows `scriptTexture 6`, the `htmlTexture` is automatically `scriptTexture 7`. But it
is not `htmlTexture 7`.

### Html file

`html\index.html` is the relative path from the bus path. Example: `Data\Vehicles\MAN_NewLionsCity\html\index.html` =
`html\index.html`

### Lit or unlit

By default a page shines by itself, like a real screen: it stays bright at night and glows a little. You can say so
explicitly with `lit`, or turn it off with `unlit`, either after the path or on the line below it:

```
[htmltexture]
1024
512
html\index.html unlit
```

An `unlit` page is drawn like an ordinary `[scriptTexture]`: the light of the scene and the model's `[matl_lightmap]`
decide how bright it is, so it goes dark at night. Use it for printed signs or paper timetables made with HTML.

## The basic idea

Your page is normal HTML with a `<script>`. The game gives it one global object, `window.omsi`
(you can also just write `omsi`), and the page uses it for three things:

1. **Read** what the bus is doing: speed, doors, the current line, the next stop.
2. **Write** back: set a script variable, press a trigger, choose a route.
3. **React** to touches and clicks on the texture.

The smallest useful page:

```html
<div id="speed">--</div>
<script>
    window.omsi = window.omsi || {};
    window.omsi.update = function (d) {
        document.getElementById('speed').textContent = d.vehicle.motion.speedKmh + ' km/h';
    };
</script>
```

The game calls `omsi.update` whenever something the page could care about has changed. You
don't poll. You wait for `update`, look at the data and redraw what you need.

## Reading the vehicle

```js
window.omsi.update = function (d) {
    d.num, d.str      // script variables that changed since the last call (everything on the first call)
    d.vehicle         // the normalised snapshot, the same object as omsi.vehicle
    d.vars            // every variable so far, the same object as omsi.vars
};
```

|                                  |                                                                                                                      |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `omsi.vehicle`                   | The normalised state of the bus, with **the same names on every bus** (see below). You can also read it from timers. |
| `omsi.vars.num`, `omsi.vars.str` | The latest value of every variable in the bus's own variable list, keyed by lower-case name.                         |
| `omsi.getVar(name)`              | One variable, any letter case. Gives a number, else text, else `undefined`.                                          |
| `omsi.apiVersion`                | `1`                                                                                                                  |

Why two ways? OMSI buses name their variables however the author likes (`door_0`,
`Fahrertuer_Rechts`, `elec_busbar_main` ...). If your page wanted to know whether the engine
runs, it would have to know every single bus. `omsi.vehicle` solves that: the game translates
the variables into one fixed layout, using the same rules it uses itself. Things a bus doesn't
have show up as `null` (numbers) or `false` (switches), never as a missing property. So
`omsi.vehicle.engine.rpm` never throws, even on a bus without an engine model.

Numbers are rounded (speed to 0.1, rpm to 1 and so on). That way a value that only wobbles in
the last digit doesn't trigger a redraw every frame.

Things that are specific to one bus (a mod's own switch, a battery voltage) are not
standardised by OMSI. Read those with `omsi.getVar("their_variable_name")`.

## Time, date, locale

|                                        |                                                                                         |
|----------------------------------------|-----------------------------------------------------------------------------------------|
| `omsi.time.hour`, `.minute`, `.second` | Simulation clock, as numbers                                                            |
| `omsi.time.asString`                   | `HH:MM:SS`                                                                              |
| `omsi.timestamp`                       | Now as a timestamp: seconds since 1970-01-01 on the simulation's calendar, no time zone |
| `omsi.date.day`, `.month`, `.year`     | Simulation date, as numbers                                                             |
| `omsi.date.asString`                   | `DD.MM.YYYY`, or `MM/DD/YYYY` when `locale` is `en`                                     |
| `omsi.locale`                          | Interface language as an ISO 639-1 code (`en`, `de` ...)                                |

These are set before `omsi.update` runs and change with the simulation clock, once per second.
Use `omsi.locale` to pick your texts, and fall back to English for languages you didn't write.
`new Date()` reads the same simulation clock (see [JavaScript](#javascript)), which is handy for
formatting and for working out minutes until a departure.

## `omsi.vehicle` (version 1)

| path                                                                                              | meaning                                                                                                      |
|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `info.number`, `.ident`, `.yard`, `.route`, `.nextStop`                                           | text variables of the bus                                                                                    |
| `motion.speedKmh`, `.heading`, `.pitch`, `.bank`, `.steeringDeg`, `.x`, `.y`, `.z`, `.odometerKm` | movement and position                                                                                        |
| `engine.running`, `.rpm`, `.throttle`, `.brake`, `.clutch`, `.gear`, `.tankContent`               | drive train and pedals                                                                                       |
| `electrics.on`, `.busbarMain`, `.busbarAvailable`, `.failure`                                     | on-board network                                                                                             |
| `battery.on`                                                                                      | battery switch, `null` when the bus has none                                                                 |
| `doors.count`, `.anyOpen`                                                                         | number of door leaves (`door_0`, `door_1` ...) and whether any is open                                       |
| `doors.list[i].number`, `.open` (0..1), `.isOpen`                                                 | `list[0]` is door 1                                                                                          |
| `passengers.onboard`                                                                              | people aboard                                                                                                |
| `passengers.entries[i]`, `.exits[i]`                                                              | `number`, `open`, `requested` (`PAX_Entry/Exit<n>_Open/_Req`)                                                |
| `lights.headlights`                                                                               | 0 off, 1 parking, 2 dipped, 3 main beam                                                                      |
| `lights.brake`, `.reverse`, `.fog`, `.interior`                                                   | lamps (`interior` is 0..1)                                                                                   |
| `lights.indicator`                                                                                | 0 off, 1 left, 2 right, 3 hazard. `.indicatorLeft` and `.indicatorRight` are the lamps, `.hazard` the switch |
| `brakes.parking`, `.stop`, `.kneeling`                                                            | switches                                                                                                     |
| `wipers.running`                                                                                  | windscreen wipers                                                                                            |
| `cabin.temperature`                                                                               | cabin air in °C                                                                                              |
| `condition.dirt`, `.crashes`, `.lastImpactKJ`, `.streetCondition`                                 | wear and road                                                                                                |
| `train.trailers`                                                                                  | coupled vehicles behind this one                                                                             |
| `route.*`                                                                                         | line, stops, delay: see the next section                                                                     |

`doors.anyOpen` follows what the passengers are told is open (`PAX_*_Open`) if the bus has
those variables, and the door leaves (`door_<n>`) if not. Some mod buses use `door_<n>` for
other things, so don't be surprised if a strange bus behaves oddly here.

## The route and the timetable

Everything about the current trip lives in `omsi.vehicle.route`.

| path                                                                           | meaning                                                                                                                                   |
|--------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `route.active`                                                                 | `true` when the bus has a timetable (a duty)                                                                                              |
| `route.source`                                                                 | where the stops come from: `"timetable"`, `"ibis"` or `"none"`                                                                            |
| `route.line`                                                                   | the line text                                                                                                                             |
| `route.destination`                                                            | the text on the destination sign                                                                                                          |
| `route.stops[i]`                                                               | one stop: `index`, `name`, `arrival`, `departure` (`"HH:MM"`), `arrivalSec`, `departureSec` (seconds after midnight), `served`, `current` |
| `route.current`                                                                | the stop the bus is at or heading for (same fields as a stop)                                                                             |
| `route.terminus`                                                               | the last stop (same fields)                                                                                                               |
| `route.nextIndex`                                                              | index of the next stop. `null` when `active` is `false`                                                                                   |
| `route.delaySec`                                                               | delay in seconds. Negative means early                                                                                                    |
| `route.ibis.line`, `.suffix`, `.routeIndex`, `.terminusIndex`, `.terminusCode` | the raw numbers the IBIS itself holds                                                                                                     |

A few things worth knowing:

* `served` is `true` once a stop has been handled. When the last stop of a trip is served, the
  trip is over. A page can use that to start the return trip.
* `route.stops` can be empty. If the bus has no timetable and nobody typed a route into the
  IBIS, there is simply nothing to show. Check `stops.length` before you draw.
* Without a duty (`active` is `false`) the game doesn't advance the stops on its own. A page
  that wants to show progress then has to keep its own counter.

## Departures of a stop

`omsi.getDepartures(stop)` gives the departures at a bus stop for the next 2 hours, soonest
first, at most 20. `stop` is the stop's name as in the timetable (`Busstops.cfg`), any letter
case. Works on vehicle and scenery pages.

```js
omsi.update = function () {
    var list = omsi.getDepartures('Hauptbahnhof');
    for (var i = 0; i < list.length; i++) {
        var minutes = Math.round((list[i].time - omsi.timestamp) / 60);
        console.log(list[i].line + ' ' + list[i].destination + ' in ' + minutes + ' min');
    }
};
```

| field         | meaning                                                                  |
|---------------|--------------------------------------------------------------------------|
| `line`        | the line text                                                            |
| `destination` | the destination text                                                     |
| `time`        | departure as a timestamp, same scale as `omsi.timestamp`, delay included |

* The first call for a stop returns `[]`. The game fills the stop a moment later and then calls
  `omsi.update` again, so ask inside `update`.
* The game keeps the 8 stops a page asked for most recently. Asking for a ninth pushes out the one asked longest ago;
  asking for that one again later gives `[]` for a moment until it is made anew. The list is renewed about once a
  second.
* Without a timetable on the map the list stays empty.

## Acting on the vehicle

|                              |                                                                                                                                                           |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `omsi.setVar(name, value)`   | Write a script variable. A number (or `true`/`false`) sets a number variable; a text sets the string variable of that name, or a number variable when the text is a number (`"1"`). |
| `omsi.trigger(name)`         | Press a trigger of the bus's scripts, like a button in the cab does.                                                                                      |
| `omsi.setRoute(index)`       | Type route `omsi.depot.routes[index]` into the IBIS: line, route and destination, the way a driver would.                                                 |
| `omsi.setLine(text)`         | Set a line by its text. The game takes the first route of that line in the depot file. It matches the whole text (any letter case) or the leading digits. |
| `omsi.setDestination(index)` | Only change the destination sign, using `omsi.depot.destinations[index]`. The line and route stay as they are.                                            |
| `omsi.clearLine()`           | Clear the IBIS: no line, no route. Use it before a route is chosen, or to throw the current one away.                                                     |
| `omsi.setNextStop(index)`    | With a timetable: jump to stop `index` of the trip, forwards or backwards. Skipped stops are not served; going back makes them due again.                 |

Two details that trip people up:

* `setNextStop` goes **both ways**. Forwards, the stops in between are skipped. Backwards (a "back
  one stop" button), the stops from `index` on are due again and `served` is `false` for them. A
  request for the stop the bus is already heading for changes nothing. The game applies it on its
  next tick, so `route.nextIndex` follows a moment later.
* `clearLine()` only touches the IBIS. It does not end the duty in the game. If the page
  reads `route.active` afterwards it may still be `true`, so don't switch screens based on
  that alone.

Calls like these are handed to the game, which applies them a moment later. They don't take
effect inside the same script run. Read `omsi.vehicle` again in the next `update`.

## The depot file: `omsi.depot`

`omsi.depot` describes what the bus's depot file (`.hof`) offers, so your page can build a
line picker or destination list without hard-coding anything. It is filled once, before the
first `update`. If the bus has no depot file it stays empty.

**`omsi.depot.routes[i]`**

| field              | meaning                                                                       |
|--------------------|-------------------------------------------------------------------------------|
| `index`            | position in the list, the number you give to `setRoute`                       |
| `code`             | the IBIS route code (line × 100 + route number, by the depot file's own rule) |
| `name`             | name of the trip                                                              |
| `line`             | the line text                                                                 |
| `terminusCode`     | the destination code of the route                                             |
| `destinationIndex` | index in `destinations`, or `-1` if there is none                             |
| `destination`      | the text of that destination sign                                             |
| `first`, `last`    | name of the first and last stop                                               |
| `stops`            | names of all stops, in order                                                  |

Many depot files leave the line column as a placeholder like `XXX`. When that happens the
game works the line out from the route code instead (code 1203 becomes line `12`).

**`omsi.depot.lines[]`** groups the same route objects by line: each entry has `line` and its
`routes`, in the order of the depot file.

**`omsi.depot.destinations[i]`** has `index`, `code`, `id` and `name`.

A small example, a line picker that starts the first route it finds:

```js
function pickLine(text) {
    var routes = omsi.depot.routes, i;
    for (i = 0; i < routes.length; i++) {
        if (routes[i].line === text) {
            omsi.setRoute(routes[i].index);
            return;
        }
    }
}
```

A return trip is usually a route on the same line whose `first` is your `last` and whose
`last` is your `first`. Look for that pair and call `setRoute` with it.

## Touch and mouse

The app passes presses, releases and movements of the pointer on the texture to the page.
They turn into events on the element under the pointer and bubble up through its parents:

* `pointerdown`, `pointerup`, `mousedown`, `mouseup`, `click`, `mousemove`

One press gives one `pointerdown`/`mousedown`, and its release one `pointerup`/`mouseup` and one `click`.

You can listen in three ways:

```html
<button onclick="doSomething()">Press</button>
```

```js
el.onclick = function (event) { ...
};
el.addEventListener('click', function (event) { ...
});
```

The event object has `type`, `x`, `y` (in texture pixels, also as `clientX`/`clientY`, `offsetX`/`offsetY` and
`pageX`/`pageY`), `button`, `buttons`, `pointerType` (`"mouse"`), `target`, `currentTarget`, `stopPropagation()` and
`preventDefault()`. A click needs both the press and the release on the page.

* `target` is the element that was pressed. A press on text gives the element the text is in (a `<span>`, a
  `<button>`), never a text node. `currentTarget` (and `this` in a `function` listener) is the element whose listener
  runs.
* Events bubble from the target up to `document.body`, then to `document` and `window`. That makes one listener for a
  whole keypad easy:

```js
document.addEventListener('click', function (e) {
    var key = e.target.closest('[data-key]');
    if (key) omsi.setVar('Taste', Number(key.dataset.key));
});
```

* Adding the same function twice for the same event keeps it once, as in a browser; `removeEventListener` takes it
  away, and `{ once: true }` removes it after its first call. `el.onclick = f` replaces an `onclick="..."` attribute
  but leaves the `addEventListener` listeners alone, and `el.onclick = null` clears it.
* `e.stopPropagation()` stops the bubbling, `e.stopImmediatePropagation()` also the other listeners of the same
  element; `e.preventDefault()` sets `e.defaultPrevented`. `e.offsetX`/`offsetY` are inside the target's box,
  `clientX`/`clientY` on the texture.
* `pointerdown`, `pointerup` and `pointermove` come before their `mouse...` events. A `click` goes to the nearest
  element that holds both the press and the release.
* `DOMContentLoaded` (on `document` and `window`) and `load` (on `window`, also `<body onload="...">`) fire once after
  all scripts of the page ran.

There is no keyboard input, no hover and no drag and drop. Build keypads and lists from
buttons or boxes and react to `click`. `mousemove` arrives while the pointer moves over the page, which is enough for
sliders.

## Scenery objects

A scenery object (`.sco`) can show pages too: `[htmltexture]` in its model config and
`[useHtmlTexture]` on the material, the same as in a vehicle. The page is looked up in the
model folder, then in the folder of the `.sco`.

A scenery page only gets the basic API: `omsi.setVar`, `omsi.trigger`, `omsi.getVar`,
`omsi.vars`, `omsi.time`, `omsi.date` and `omsi.locale`. `omsi.vehicle`, `omsi.depot` and
`setRoute`, `setLine`, `setDestination`, `clearLine` and `setNextStop` do not exist there (`d.vehicle` in `update`
neither). The variables are those of the object's script; an object
without a script still shows its page.

The pages run only within 60 m of the camera. Clicks reach them from up to 4 m away, unless the
bus is in front of the page.

## What the HTML engine supports

The engine is deliberately small. It is not a browser, so a page that looks fine in Chrome may
need a few changes. When something doesn't show up, check this list first.

### HTML

* Nested elements, `<style>`, `<script>`, inline `style=""`, `id`, `class`, entities such as
  `&amp;`.
* Headings `h1` to `h6`, `p`, `div`, `blockquote`, `pre`, `hr` and the usual inline elements
  (`span`, `b`, `strong`, `i`, `em`, `a`, `small`, `u`, `s`, `sub`, `sup`, `code`, `<br>` ...),
  with browser-like default sizes and margins.
* Lists (`ul`, `ol`, `li`) and tables (`colspan`, `rowspan`, `cellpadding`, `cellspacing`,
  `border`).
* `<button>` comes with a default look (grey, rounded, padded). Boxes with
  `display:inline-block` are laid out in rows that wrap, which is what you want for keypads
  and lists. A box without a `width` is as wide as its content. `input`, `select`, `textarea`,
  `progress` and `meter` are drawn too.
* `<img src width height>` (bmp, dds, tga, jpg, png). The file is looked up next to the page.
  `img.src` can be changed from a script. Pictures are cached, a missing file is cached too.
* `<head>`, `<title>`, `<meta>`, `<link>` are read and then ignored.
* A page may be saved in UTF-8, in UTF-16 (with its byte order mark), in what its `<meta charset>` names, or in
  Windows-1252 as old OMSI files are; umlauts come out right in all of them.
* `<style media="...">` applies as its media query says. A `<script>` of another `type` than JavaScript
  (`application/json`, `text/template`) does not run, but its text can be read (`textContent`); nothing inside
  `<template>` or `<noscript>` runs or applies. Old pages that wrap a script or a style sheet in `<!-- ... -->` work.

`canvas`, `video`, `svg` and `iframe` are drawn as empty boxes.

### CSS

* Selectors: tag, `#id`, `.class`, `*`, attributes (`[data-on]`, `[data-on="1"]`, `^=`, `$=`, `*=`, `~=`, `|=`, and
  `i` for any letter case: `[data-k^="ab" i]`), combinations like `div.a#b`,
  descendant chains (`.panel span`), children (`ul > li`), siblings (`h2 + p`, `h2 ~ p`) and comma lists.
* Pseudo-classes: `:root`, `:first-child`, `:last-child`, `:only-child`, `:nth-child(2n+1)` (also `odd`, `even`),
  `:nth-last-child()`, `:first-of-type`, `:last-of-type`, `:nth-of-type()`, `:only-of-type`, `:empty`, `:not()`,
  `:is()` and `:where()`. State pseudo-classes (`:hover`, `:active`, `:focus` ...) and pseudo-elements (`::before`)
  never match, so such a rule is ignored.
* Properties: `color`, `background` / `background-color`, `background-image: url()`,
  `background-size`, `background-repeat`, `background-position`, `font-size`, `font-weight`,
  `font-family`, `font` (`bold 20px/1.5 Arial`), `text-align`, `line-height`, `margin` (and
  `-top/-right/-bottom/-left`), `padding` (same),
  `width`, `height`, `min-width`, `max-width`, `min-height`, `max-height`, `box-sizing`,
  `display` (`none`, `inline`, `inline-block`, `block`, `flex`, `inline-flex`, `grid`, `inline-grid`,
  `flow-root`, also the two-word forms such as `inline flex`), `visibility`, `float`, `clear`,
  `border` (and its sides, `-width`, `-color`, `-style`), `border-radius`, `border-collapse`,
  `border-spacing`, `text-decoration`, `text-transform`, `white-space`, `vertical-align`,
  `list-style`, for layers `position`, `top`, `right`, `bottom`, `left`, `inset`,
  `z-index`, `overflow`, `text-overflow` and `opacity`, and the ones in the sections below
  (flexbox, grid, effects, animations).
* Values: `px`, `%`, `em` (of the element's own font size, the parent's for `font-size`), `rem` (of the `<html>`
  element), `pt`, `pc`, `vw`, `vh` (also `dvh`, `svh` ...), `vmin`, `vmax`, `in`, `cm`, `mm`, `q`, and `ch`/`ex` as
  half an `em`; `calc()` (for example `calc(100% - 20px)`), and `min()`, `max()`, `clamp()` with pixel values.
  Colours as `#rgb`, `#rrggbb` (with alpha too), `rgb()`/`rgba()`, `hsl()`/`hsla()` (also with spaces and `/ alpha`),
  the 148 CSS colour names, `transparent` and `currentColor`. `inherit`, `initial` and `unset` work for the
  properties above. Keywords may be written in any letter case. A value the engine cannot read is dropped and the
  one before stays, as in a browser.
* Custom properties work as in a browser: `--accent: #ffcc00` on an element (or `:root`) and `color: var(--accent)`
  on it or its children, with a fallback as in `var(--accent, white)`. They may refer to each other in any order;
  properties that refer to each other in a circle are invalid, and a `var()` of one takes its fallback.
* Borders: `border: 1px solid red`; a border without a style (`border: 1px red`) is not drawn, and
  `border-style: solid` alone draws a 3 px (`medium`) border in the text colour.
* `box-sizing: border-box` makes `width` and `height` include the padding and the border. Without it (`content-box`)
  they are the size of the content, and padding and border come on top.
* Layout is block flow with wrapped inline text, floats, flexbox, grid and positioned layers (see below).
* `@media` works against the texture: its width and height are the viewport. A texture is a `screen`, `landscape`
  or `portrait` by its size, has a fine pointer that cannot hover (`(hover: none)`) and the light colour scheme.
  Width, height, aspect ratio and orientation can be asked with `min-`/`max-` or as ranges
  (`(width >= 800px)`, `(400px <= width <= 900px)`), and joined with `and`, `,` or `or`; `em` in a query is
  16 px. One page can so serve displays of different sizes. `@supports` blocks are always used.

Not available: `background-blend-mode`, `isolation`, `perspective-origin`, `clip-path` boxes other than the border
box (`content-box` ...), and the z-sorting of 3D boxes that cut through each other. A transformed box is drawn from
where it is laid out: the part that starts left of or above the texture is lost, even when the transform moves it into
view (lay a slide-in panel out inside the texture and move it out with the transform instead). `backdrop-filter` inside
a faded or transformed box sees nothing behind it.

Differences from a browser to keep in mind:

* The top margin of a first child does not pass through its parent (and the bottom margin of the last one neither):
  give the parent a `padding-top` of `1px`, or set `margin-top: 0` on the child, to get the same picture in both.
* `padding`, `border` and side margins of inline elements (`<span>`) take no room in the line; use
  `display: inline-block` for a padded badge.
* `white-space: pre`/`pre-wrap` keeps spaces and line breaks only in `<pre>` and `<textarea>`; elsewhere they are
  already joined when the page is read.
* A float narrows every line of the paragraph next to it, also those below its end.
* Percentages in `margin`, `padding`, `gap` and `border-radius` are of the texture width; `min()`, `max()` and
  `clamp()` take no percentages.
* `border-radius` has one radius for all corners (the first one given), and a box has one border colour for all its
  sides.
* `@layer` blocks count as ordinary rules; `:nth-child(... of S)` and escaped characters in class names are not read.

A page that is too costly to lay out (more than about 250 ms, or very deeply nested flex and grid boxes) has the rest
of it left out; such a layout is tried again a few times and then kept.

### Floats

`float: left` or `right` puts a box at that side; what follows flows beside it, and `clear: left | right | both` goes
below. A float without a `width` is as wide as its content.

* Floats line up side by side as long as there is room, else they go below the earlier ones.
* Text that starts beside a float wraps in the room next to it, for its whole paragraph. A block beside a float takes
  the room next to it (as if it had `overflow: hidden`).
* Unlike a browser, every box grows round its own floats (as with `display: flow-root`): what follows a row of floats
  starts below them.

### Flexbox

`display: flex` lays the children out in a row (or a column), which is the easiest way to centre things or to share
the room of a bar between buttons:

```css
.bar    { display: flex; gap: 8px; align-items: center; height: 80px; }
.bar .grow { flex: 1; }               /* takes the room that is left */
.centre { display: flex; justify-content: center; align-items: center; }
```

* Container: `flex-direction` (`row`, `row-reverse`, `column`, `column-reverse`), `flex-wrap` (`nowrap`, `wrap`,
  `wrap-reverse`), `flex-flow`, `justify-content` (`flex-start`, `flex-end`, `center`, `space-between`,
  `space-around`, `space-evenly`), `align-items` and `align-content` (`stretch`, `flex-start`, `flex-end`, `center`,
  and the `space-*` values for lines), `gap`, `row-gap`, `column-gap`, `place-content`, `place-items`.
* Items: `flex` (`flex: 1`, `flex: 0 0 120px`, `none`, `auto`), `flex-grow`, `flex-shrink`, `flex-basis`,
  `align-self` and `order`. Items stretch across the line unless they have their own height (in a row) or width (in a
  column). Text right inside a flex container becomes an item of its own.
* An item does not shrink below its longest word unless it has a `min-width`. A column only uses `justify-content`
  when it has a height.
* `display: inline-flex` is a flex container that is only as wide as its items.

### Grid

```css
.screen { display: grid; grid-template-columns: 120px 1fr 1fr; grid-template-rows: 60px auto 40px; gap: 6px;
          grid-template-areas: "line dest dest" "list list list" "foot foot foot"; height: 100%; }
.line   { grid-area: line; }
.tiles  { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
```

* Tracks: `grid-template-columns`, `grid-template-rows` with `px`, `%`, `fr`, `auto`, `min-content`,
  `max-content`, `minmax()`, `fit-content()` and `repeat()` (also `auto-fill` / `auto-fit`, which fit as many
  tracks as the room holds); line names in `[...]` are skipped. `grid-template-areas`, `grid-template` and `grid`
  (rows `/` columns, or areas), `grid-auto-rows`, `grid-auto-columns`, `grid-auto-flow` (`row`, `column`, `dense`).
* Items: `grid-column`, `grid-row` (`1 / 3`, `span 2`, `2 / -1`, an area name), their `-start`/`-end` parts and
  `grid-area` (a name or `row / column / row / column`). Items without a place are put in the next free cells.
* Alignment: `justify-items`, `align-items`, `place-items`, `justify-self`, `align-self`, `place-self` (items stretch
  by default) and `justify-content`, `align-content` for the tracks. `gap`, `row-gap`, `column-gap`.
* `auto` tracks are as wide as their content and share the room that is left; `fr` tracks share the rest after
  that. A row only uses `fr` when the grid has a height.

### Effects

* Gradients: `background: linear-gradient(to right, #003 0%, #06c 100%)` (an angle such as `45deg`, or `to top`,
  `to bottom right` ...) and `radial-gradient(circle at 50% 50%, white, black)`. Colour stops may carry a position.
  `repeating-` gradients are drawn once. A gradient takes `background-size`, `background-position` and
  `background-repeat` like a picture (`... 0 0 / 20px 20px` gives stripes). Not available: `conic-gradient`, the size
  keywords of `radial-gradient` (`closest-side`, `circle 20px` ...: it always reaches the farthest corner), colour
  hints (`red, 20%, blue`), and more than one gradient in one `background`.
* `box-shadow`: one or more shadows, `x y blur spread colour`, also `inset`; without a colour it is the text colour.
  The blur is a smooth fade, close to what a browser draws. `text-shadow` is not drawn, and `drop-shadow()` without a
  colour is black.
* `transform`: `translate()`, `translateX/Y()`, `scale()`, `scaleX/Y()`, `rotate()`, `skew()`, `skewX/Y()` and
  `matrix()`, several in a row, with `transform-origin`. A transformed box takes no other room, and clicks reach it
  where it is drawn. Up to four transformed, faded, filtered or clipped boxes can sit inside each other; deeper ones
  are drawn plain. Only what lies on the texture before the transform is drawn.
* 3D: `rotateX()`, `rotateY()`, `rotateZ()`, `rotate3d()`, `translate3d()`, `translateZ()`, `scale3d()`, `scaleZ()`,
  `matrix3d()` and `perspective()` in `transform`, and `perspective` on the parent (its vanishing point is taken at the
  middle of the transformed box). `backface-visibility: hidden` hides a box that turns its back.
  `transform-style: preserve-3d` keeps the transformed children of a box in its 3D space (a flip card's back shows when
  it is turned), drawn from the farthest to the nearest; without it they are flattened into the box.
* `filter`: `blur()`, `brightness()`, `contrast()`, `grayscale()`, `sepia()`, `invert()`, `saturate()`,
  `hue-rotate()`, `opacity()` and `drop-shadow()`, several in a row. They work on the box and everything in it.
* `backdrop-filter`: the same functions on what is already drawn behind the box (inside its rounded corners), for
  frosted-glass panels.
* `mix-blend-mode`: `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`,
  `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity` and `plus-lighter` mix the box
  with what is already drawn behind it.
* `clip-path`: `inset()` (with `round`), `circle()`, `ellipse()` (with `at`), `polygon()`, `path('M 0 0 L ...')`
  (SVG path data with curves and arcs) and `url(#id)` of an inline `<svg><clipPath id=...>` with `path`, `polygon`,
  `polyline`, `rect`, `circle` and `ellipse` (also `clipPathUnits="objectBoundingBox"` and `clip-rule`), on the border
  box. What is cut off is not drawn and takes no clicks.
* Masks: `mask-image` (a picture or a gradient), `mask-size`, `mask-position`, `mask-repeat`, `mask-mode`
  (`alpha`, `luminance`) and the `mask` shorthand, also with the `-webkit-` prefix. The mask's alpha (or brightness)
  fades the box and everything in it.

### Columns

`column-count`, `column-width` or `columns` share the content of a box out over columns of the same height, with
`column-gap` (1em by default) and `column-rule` between them:

```css
.stops { column-count: 2; column-gap: 24px; column-rule: 1px solid #555; }
```

* A paragraph may break between its lines; other boxes go to a column whole.
* With a `height` the columns are that tall, and what does not fit goes into further columns to the right; without
  one the columns are balanced.
* `column-span`, `column-fill` and breaks (`break-inside` ...) are not read.

### Animations and transitions

```css
@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.2 } }
.warning { animation: blink 1s ease-in-out infinite; }
.door    { transition: background-color 300ms, transform 0.5s ease-out; }
.door.open { background-color: #2a2; transform: translateX(40px); }
```

* `@keyframes` with `from`, `to` and percentages (also an `animation-timing-function` inside a keyframe, for the
  way to the next one); `animation` and its parts (`animation-name`, `-duration`, `-delay`, `-iteration-count`,
  `-direction`, `-fill-mode`, `-timing-function`, `-play-state`), in any order and from different rules; several
  animations separated by commas. A paused animation goes on from where it stopped.
* `transition` and its parts (`transition-property`, `-duration`, `-delay`, `-timing-function`). A transition starts
  when a script changes what the style sheet gives an element, for example by changing its classes.
* Timing: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`, `steps()` (with `jump-start`,
  `jump-end`, `jump-none`, `jump-both`), `step-start`, `step-end`. A `steps()` animation is only drawn again when it
  steps.
* What moves: `opacity`, `color`, `background-color`, `border-color`, `transform`, `top`/`right`/`bottom`/`left`,
  `width`, `height`, `margin`, `padding`, `border-width`, `border-radius`, `font-size`, `line-height` and
  `box-shadow` (also from `none`: the shadow fades in). Other properties switch halfway, and so do transforms made of
  different functions (`translateX()` to `translateX() rotate()`).
* To start an animation again, give it another name or take it away for one frame (`setTimeout`); taking the class
  away and adding it back in the same script, even with a read of `offsetWidth` between, does not restart it. An
  animation also wins over an `!important` declaration of the same property.
* Animations run on the page's own clock (real time, like the timers). While something moves the page is drawn up to
  30 times a second, so keep animations to the parts that need them.

### Fonts

Text is drawn in Roboto unless the page brings its own font:

```css
@font-face { font-family: "Display"; src: url("fonts/display.ttf"); }
@font-face { font-family: "Display"; src: url("fonts/display-bold.ttf"); font-weight: bold; }
.line { font-family: "Display", sans-serif; }
```

* TrueType and OpenType files (`.ttf`, `.otf`) are looked up next to the page, like pictures. Each file is read once
  for the whole game, up to 32 MB.
* The first name in `font-family` that has an `@font-face` is used, else Roboto. Generic names (`sans-serif`,
  `monospace` ...) and fonts installed on the computer are not used.
* A bold text uses the `@font-face` with `font-weight: bold` (or 600 and more) when there is one, else the regular
  file. There is no slanted or synthetic bold version of a page font.

### Layers and exact positions

Most vehicle displays are a background picture with texts and icons at fixed pixel positions
on top of it. Build them with `position: absolute`:

```html
<style>
    html, body { margin: 0; overflow: hidden; }
    #screen { position: relative; width: 1440px; height: 960px;
              background: url(img/background.png); }
    .label  { position: absolute; color: #fff; font-size: 32px; white-space: nowrap; }
</style>
<div id="screen">
    <div class="label" id="line" style="left: 40px; top: 30px;"></div>
    <div class="label" id="dest" style="left: 200px; top: 30px; width: 600px;
         overflow: hidden; text-overflow: ellipsis;"></div>
    <img src="img/door.png" style="position: absolute; right: 40px; bottom: 40px;">
</div>
```

* Positions are texture pixels (or `%`), counted from the inside of the border of the nearest
  ancestor whose `position` is not `static`. Without such an ancestor they count from the
  top left corner of the texture. `position: fixed` always counts from the texture.
* An absolute box takes no room in the normal flow. Without a `width` it is as wide as its
  content. With both `left` and `right` (or `top` and `bottom`) it fills the space between
  them, and `margin: 0 auto` centres it there.
* `position: relative` moves a box by its offsets, but what follows stays where it was. On an
  inline element such as `<span>` only pixel offsets work.
* Positioned boxes are drawn above the normal content, later ones over earlier ones.
  `z-index` changes the order of boxes inside the same positioned parent. A negative value
  puts a box behind the normal content.
* `overflow: hidden` (also `auto`, `scroll`, `clip`) cuts text and pictures at the edge of the
  box, and clicks on the cut-off part don't reach it. With `white-space: nowrap` and
  `text-overflow: ellipsis` a line that is too long ends with `…`.
* `opacity` fades a box together with everything in it. Up to four faded boxes can sit inside
  each other; deeper ones are drawn without fading.
* Setting `element.style.left`, `.top` or `.zIndex` from a script moves a box, and
  `display: none` hides it.

### JavaScript

The language is ES5 plus most of the later everyday additions.

* Language: `var`, `let` and `const` (`let`/`const` belong to their block, and each round of a loop has its own, so
  closures made in a loop keep that round's values), functions, arrow functions, the comma operator, `&&=`, `||=`,
  `??=`, `if`, `switch`, `for`,
  `while`, `do ... while`, `for ... in` (integer keys by number, then the others by name), `for ... of`, `try` / `catch` / `finally`,
  `throw`, `new`, `this`, objects (with `{ a, b }`, methods `{ draw() {} }` and `get`/`set`), arrays, regular
  expressions like `/\d+/g`. Labels: `outer: for (...) { ... break outer; }` and `continue outer`, also on a block
  (`skip: { ... break skip; }`).
* Template strings: `` `Linie ${line} in ${minutes} min` ``, nested too, and tagged templates
  (`` tag`text ${x}` `` calls `tag(strings, x)`; `` String.raw`C:\new` `` keeps the backslashes). The `strings` a tag
  gets have `strings.raw`.
* Objects: computed keys (`{ [key]: value }`, `{ [Symbol.iterator]() {} }`, also in classes).
* `Symbol()`, `Symbol.for()` and `description`; symbol keys are not listed by `Object.keys`, `for ... in` or
  `JSON.stringify`. The well-known symbols: `Symbol.iterator`, `asyncIterator`, `toPrimitive` (`hint` is `'number'`,
  `'string'` or `'default'`), `toStringTag`, `hasInstance` (`static [Symbol.hasInstance](x)` decides `instanceof`),
  `isConcatSpreadable`, and `match`, `matchAll`, `replace`, `search`, `split` (an object with one of them can be given
  to the string method of that name). `species` and `unscopables` exist but change nothing.
* Conversions: `+obj`, `obj * 2`, `obj < 3` and `Number(obj)` use the object's own `valueOf()`, `String(obj)` and
  `` `${obj}` `` its own `toString()`, and `[Symbol.toPrimitive]` before both.
  `Object.prototype.toString.call(x)` gives `[object Array]`, `[object Null]` ... (and the `Symbol.toStringTag`).
* Iterators: arrays, strings, `Map` and `Set` have `[Symbol.iterator]()`, and `keys()`, `values()`, `entries()` give
  iterator objects with `next()`. Your own objects become iterable with a `[Symbol.iterator]()` that returns
  `{ next() { return { value, done }; } }`; `for ... of`, `...`, `Array.from` and destructuring take them.
* Generators: `function*`, `*method()` in classes and objects, `yield`, `yield*`, and `next(v)`, `return(v)`,
  `throw(e)` on the generator. `for ... of` asks for one value at a time, so an endless generator with a `break` is
  fine. At most 256 generators can be running at once.
* Async generators and `for await`: `async function*`, `async *method()`, `await` and `yield` in them, `next()`
  giving promises, `Symbol.asyncIterator`, and `for await (const x of ...)` over async iterators and over plain
  iterables of promises.
* Iterator helpers on iterators and generators: `map`, `filter`, `take`, `drop`, `flatMap` (they pull one value at a
  time, so `naturals().filter(even).take(5)` works), `toArray`, `forEach`, `reduce`, `some`, `every`, `find`, and
  `Iterator.from()`.
* Prototypes: `F.prototype` of functions and classes, `new F()` inheriting from it, `Object.create(proto, descriptors)`,
  `Object.getPrototypeOf` / `setPrototypeOf`, `isPrototypeOf`, `instanceof` along the chain, `Object.defineProperty`
  (values, getters and setters), `Object.getOwnPropertyDescriptor` / `getOwnPropertyDescriptors`, and additions to
  `Object.prototype`, `Array.prototype`, `String.prototype`, `Number.prototype` and `Function.prototype`.
  `Array.prototype.slice.call(arguments)` and friends work. Properties are always writable and configurable:
  `Object.freeze` and `seal` give the object back unchanged, and a descriptor's `writable` says `true`.
* Functions: `call`, `apply`, `bind` and `arguments`.
* `Proxy` with the traps `get`, `set`, `has`, `deleteProperty`, `ownKeys`, `getOwnPropertyDescriptor`, `apply` and
  `construct`, `Proxy.revocable()` (after `revoke()` every use of the proxy throws a `TypeError`), and `Reflect`
  (`get`, `set`, `has`, `deleteProperty`, `ownKeys`, `apply`, `construct`, `getPrototypeOf`, `setPrototypeOf`,
  `defineProperty`, `getOwnPropertyDescriptor`).
* Optional chaining: `omsi.vehicle?.route?.current?.name`, `list?.[0]`, `callback?.()`. When the left side is `null`
  or `undefined` the whole chain is `undefined`.
* Spread and rest: `[...a, ...b]`, `{ ...defaults, ...options }`, `f(...args)`, `Math.max(...list)`,
  `function f(first, ...rest)`.
* Destructuring in `var`/`let`/`const`, parameters and `for ... of`, with defaults and rest:
  `const { line, stops: [first] = [] } = route;`, `for (const [key, value] of map)`, and swapping with
  `[a, b] = [b, a]`. Default parameter values (`function f(a = 1)`) too.
* `Map` and `Set` (`get`, `set`, `add`, `has`, `delete`, `clear`, `size`, `forEach`, `keys`, `values`, `entries`, and
  `new Map([[k, v]])` / `new Set(list)`), in insertion order; objects as keys compare by identity. `WeakMap` and
  `WeakSet` take objects as keys only and cannot be counted or listed.
* Classes: `class`, `constructor`, methods, fields (`count = 0;`), `static` methods and fields, `get`/`set`,
  `extends` (also `extends Error` and a plain constructor function), `super(...)`, `super.method()` (also in a
  `static` method), `this.constructor` and `instanceof`. Methods are not listed by
  `Object.keys`, `for ... in` or `JSON.stringify`. Private fields and methods (`#count`, `#bump()`, also `static`) are
  kept out of `Object.keys`, `for ... in` and `JSON.stringify` (the engine does not stop code outside the class from
  reading them).
* Asynchronous code: `Promise` (`then`, `catch`, `finally`, `Promise.resolve`, `reject`, `all`, `allSettled`, `race`,
  `any`), `async function`, `async` arrows and methods, and `await`. Promise reactions run right after the script,
  update, event or timer that caused them. A rejection nobody handles is written to the log as
  `htmltexture: uncaught (in promise) ...`.
* Operators: besides the usual ones also `**`, `??`, the bit operators (`|`, `&`, `^`, `~`,
  `<<`, `>>`, `>>>`), `instanceof`, `typeof`, `delete`.
* Globals: `Math` (`round`, `floor`, `ceil`, `abs`, `min`, `max`, `sqrt`, `pow`, `trunc`,
  `sin`, `cos`, `random`, `PI`), `JSON.parse` (also with a reviver) and `JSON.stringify` (with getters, `toJSON()`, a replacer function or key list,
  and indentation),
  `RegExp`, `Error`, `TypeError`, `RangeError`, `SyntaxError`, `Array.isArray`, `parseInt`,
  `parseFloat`, `String`, `Number`, `isNaN`, `NaN`, `Infinity`, `Object.keys`,
  `Object.entries`, `Object.values`, `Object.assign`, `Object.fromEntries`, `Object.hasOwn`, `Object.is`, `Array.from` (also `Array.from({ length: n }, f)`),
  `console.log/warn/error`, `performance.now()`, `window.innerWidth`/`innerHeight` (the texture size), and `window`
  as `globalThis`, `self` and `this` at the top of a script.
* `Date` runs on the **simulation clock**: `new Date()` and `Date.now()` are `omsi.timestamp`, with the getters and
  setters (`getHours()`, `setMinutes()` ...), `toISOString()`, `toLocaleTimeString()`, `toLocaleDateString()` and
  `toLocaleString()` (by `omsi.locale` or the argument: `3/5/2026` in American English, `05/03/2026` in British
  English and French, `5.3.2026` in German, `5-3-2026` in Dutch, `2026-03-05` in Swedish ...; with the options
  `weekday`, `day`, `month`, `year`, `hour`, `minute`, `second` and `hour12`; month and weekday names in English,
  German, French, Spanish, Italian, Dutch and Portuguese, other languages get the English ones), `Date.UTC()` and
  `Date.parse()` for ISO dates (`2026-11-15T08:30:00`), `11/15/2026`, `Nov 15, 2026 08:30` and what `toString()` and
  `toUTCString()` write. The simulation has no time zone, so local time and UTC are the same. Before the page's
  first `update`, the clock reads 1 January 1970.
* `localStorage` (`getItem`, `setItem`, `removeItem`, `clear`, `key`, `length`) keeps texts between game sessions.
  Pages in the same folder share it; it holds up to 5 MB (beyond that `setItem` throws a `QuotaExceededError`). It is
  saved in the game's settings folder (`html-storage`) at most every 2 seconds and when the page closes.
* `fetch(path)` reads a file of the page's folders (the page's own folder, the model folder, the vehicle or object
  folder): `const data = await (await fetch('data/lines.json')).json();`. The response has `ok`, `status`, `text()` and
  `json()`; a missing file gives `ok: false` and `status: 404`. The network, absolute paths and `..` are refused with
  a `TypeError`.
* Strings: `split`, `replace`, `replaceAll`, `match`, `search`, `trim`, `trimStart`,
  `trimEnd`, `indexOf`, `lastIndexOf`, `charAt`, `charCodeAt`, `slice`, `substring`,
  `startsWith`, `endsWith`, `includes`, `concat`, `localeCompare`, `toUpperCase`,
  `toLowerCase`, `padStart`, `padEnd`, `repeat`, and `text[i]`. `split`, `replace`,
  `replaceAll`, `match` and `search` take a string or a regular expression; `replace` knows
  `$1`, `$&` and a function as the replacement. Also `at`, `substr`, `codePointAt`, `matchAll`, `normalize` (`NFC`,
  `NFD`, `NFKC`, `NFKD`), `toLocaleUpperCase`, `toLocaleLowerCase`, `String.fromCharCode`. Numbers: `toFixed`,
  `toPrecision`, `toExponential`, `toString` (also with a radix, `(255).toString(16)`), `valueOf` and
  `toLocaleString` (with `minimumFractionDigits`, `maximumFractionDigits`, `minimumIntegerDigits`,
  `maximumSignificantDigits`, `useGrouping` and `style: 'percent'` or `'currency'` with `currency: 'EUR'` ...;
  English, Japanese, Chinese and Korean write `1,234.5`, French, Polish, Russian, Swedish ... `1 234,5`, the others
  `1.234,5`; Spanish and Polish group from five digits on).
  `Number.isFinite`, `isInteger`, `isNaN`, `MAX_SAFE_INTEGER`, `EPSILON` ..., the global `isFinite`, and `Math`
  with `atan2`, `tan`, `log`, `log10`, `exp`, `sign`, `hypot`, `cbrt` and the other functions and constants.
* Regular expressions: `test`, `exec`, `lastIndex` and the flags `g`, `i`, `m`, `s`, `y`.
  Look-ahead and look-behind (`(?=...)`) and back references (`\1`) are not supported; such a
  pattern throws a `SyntaxError`.
* Arrays: `push`, `pop`, `shift`, `unshift`, `slice`, `splice`, `concat`, `reverse`, `sort`
  (stable, with or without a compare function), `join`, `indexOf`, `lastIndexOf`,
  `includes`, `map`, `filter`, `forEach`, `find`, `findIndex`, `some`, `every`, `reduce`, and the copying `toSorted`,
  `toReversed`, `toSpliced` and `with`.
* Errors: a caught error has `name` and `message`. Errors of the engine itself, such as
  calling something that is not a function or parsing bad JSON, can be caught too.
* Timers: `setTimeout` (with extra arguments for the function), `setInterval`, `clearTimeout`, `clearInterval`,
  `requestAnimationFrame` (about 60 times a second, with the time in milliseconds) and `cancelAnimationFrame`. They
  run while the page is being drawn and use real time, not simulation time. Due timers run earliest first.
* DOM: `document.getElementById`, `document.querySelector`, `document.querySelectorAll`, `document.body`,
  `document.documentElement`, `createElement`, `appendChild`, `removeChild`, `remove`, `getAttribute`,
  `setAttribute`, `hasAttribute`, `removeAttribute`, `classList` (`add` and `remove` with several names, `toggle`,
  `contains`, `replace`, `item`, `length`, `value`), `textContent`, `innerText`, `innerHTML` and `outerHTML` (read
  and written as markup), `className`, `id`, `hidden`, `title`, `value`, `element.style.*` (`''` removes a
  declaration; also `cssText`, `setProperty`, `getPropertyValue`, `removeProperty`), `dataset`
  (`data-line-number` is `dataset.lineNumber`), `tagName`, `nodeName`, `nodeType`, `parentNode`, `parentElement`,
  `children`, `childNodes`, `firstChild`, `lastChild`, `firstElementChild`, `lastElementChild`,
  `nextElementSibling`, `previousElementSibling`, `childElementCount`, `isConnected`, and on elements `closest()`,
  `matches()`, `contains()`, `querySelector()` and `querySelectorAll()` (they take the selectors listed under CSS),
  `insertBefore`, `replaceChild`, `cloneNode`, `append`, `prepend`, `before`, `after`, `replaceWith`,
  `insertAdjacentHTML`, `getElementsByClassName`, `getElementsByTagName`, and `document.createTextNode` (a text node's
  `data` and `nodeValue`). Other properties a script sets on an element (`el.state = 1`) stay on it.
  Inside `onclick="..."` and in listeners, `this` is the element.
* Sizes: `getBoundingClientRect()` (`x`, `y`, `width`, `height`, `left`, `top`, `right`, `bottom`), `offsetWidth`,
  `offsetHeight`, `offsetLeft`, `offsetTop`, `clientWidth`, `clientHeight`, `scrollWidth` and `scrollHeight` give the
  box of an element on the texture, in pixels, laid out as it is at that moment. Each call after a change lays the
  page out again, so read what you need in one go.
* After `innerHTML` replaces some elements, `getElementById` and `querySelector` find the new ones; the old ones are
  gone from the page (`isConnected` is `false`).

Not available: `fetch` beyond the page's files and any network access, `XMLHttpRequest`, `Boolean.prototype`,
`with`, read-only properties (`writable: false` and `Object.freeze` are ignored; `Object.defineProperty` without
`enumerable: true` does hide a property from `Object.keys`). Object keys come in the order of a browser: integer keys
by number first, then the others in the order they were added.

Limits that keep a broken page from stalling the game: a run (a script, an `update`, an event, the timers of one
frame) stops after 2 000 000 steps or 250 ms; calls nest at most 48 deep, expressions 1000; elements nest at most 512
deep; generators and async functions each run on a thread of their own, so start them sparingly in code that runs
every frame. `localStorage.key = value` and `localStorage.key` work like `setItem`/`getItem`. Variable writes with
`omsi.setVar` keep the last value per name in each frame.

At most 64 timers can be active at once. Further `setTimeout`/`setInterval` calls are
ignored. At most 64 async calls can wait at an `await` at the same time; further ones are rejected with a
`RangeError`.

When a script fails, the game log says where, for example
`htmltexture: script 1 error: line 14, column 23: unexpected character '@'`. Scripts are
counted from 0 in the order of the page, lines from the start of that `<script>` block.

A few limits protect the game from runaway pages. Each run (a script of the page, one `update`, one event listener,
one timer, one promise reaction) may take about 2,000,000 steps and at most 250 ms; work that is split over several
timers or `await`s gets a new budget for each part. Strings can be up to 16 MB and arrays up to about a million
values long (beyond that you get a `RangeError`). Scripts can be nested 96 levels deep and
function calls 48 levels deep, and very deeply nested markup (hundreds of levels) is not
drawn. Normal pages never get near any of these. An endless loop just gets cut off. If a page has to compare
hundreds of names on every update, keep the results (in a variable or `localStorage`) instead of working them out
again each time.

More limits, for pages that go too far:

* All the scripts and load events of a page share 1 second; all the listeners and promise reactions of one click or
  one `update` share 250 ms. One event on one element takes at most 256 listeners.
* A page holds at most about a million elements in all, also those its scripts made and threw away; making more
  throws a `RangeError`.
* `console.log` writes at most 20 lines a second, each cut after 1 KB.
* A page looks for at most 256 new files a second, and paths are at most 260 bytes and 32 parts long.
* Every `localStorage` item counts 32 bytes on top of its texts against the 5 MB.
* The drawing of one frame has a budget of a few dozen times the texture's area: past it, effects (layers, filters,
  shadows, gradients) are left out and text stops. A texture is at most 4096 pixels wide and high.
* Generators and async calls of all pages together run on at most 1024 threads.
* A page that makes the HTML engine fail is switched off (the log says so) and stays blank; the game goes on.

### Redrawing

A page is redrawn when the DOM or the styles change. The simplest pattern, and the one that
works best in this engine, is to rebuild a block with `innerHTML` in your `update` function
and only do that when the data actually changed (compare against the last values you saw).
Redrawing on every call wastes time on a slow phone. On a screen made of layers, it is
cheaper to change the text of the positioned elements than to rebuild the whole screen.

## Tips for beginners

* **Start from the dashboard example** and change one thing at a time. If the texture goes blank, the
  last thing you touched is the culprit.
* **Write to the log.** `console.log(...)` ends up in the game's log with the prefix
  `htmltexture console:`, which is the quickest way to see what `omsi.vehicle` or `omsi.depot` really contain on your
  bus.
* **Guard for missing data.** A bus without a depot file has no `omsi.depot.routes`, a bus
  without a timetable has no stops. Check the length before you loop.
* **Test on the real bus.** Each bus fills the variable list differently, and some values
  you expect will simply be `null`.
* **Keep buttons big.** The texture is often small on screen and people press it with a
  finger or a mouse. 60 px high is a good minimum.
