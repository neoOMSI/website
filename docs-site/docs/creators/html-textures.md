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
| `omsi.setVar(name, value)`   | Write a script variable.                                                                                                                                  |
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

The event object has `type`, `x`, `y` (in texture pixels), `target`, `stopPropagation()` and
`preventDefault()`. A click needs both the press and the release on the page.

There is no keyboard input, no hover and no drag and drop. Build keypads and lists from
buttons or boxes and react to `click`.

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

`canvas`, `video`, `svg` and `iframe` are drawn as empty boxes.

### CSS

* Selectors: tag, `#id`, `.class`, `*`, combinations like `div.a#b`, descendant chains
  (`.panel span`) and comma lists.
* Properties: `color`, `background` / `background-color`, `background-image: url()`,
  `background-size`, `background-repeat`, `background-position`, `font-size`, `font-weight`,
  `text-align`, `line-height`, `margin` (and `-top/-right/-bottom/-left`), `padding` (same),
  `width`, `height`, `display` (`none`, `inline`, `inline-block`), `visibility`,
  `border` (and its sides, `-width`, `-color`, `-style`), `border-radius`, `border-collapse`,
  `border-spacing`, `text-decoration`, `text-transform`, `white-space`, `vertical-align`,
  `list-style`, and for layers `position`, `top`, `right`, `bottom`, `left`, `inset`,
  `z-index`, `overflow`, `text-overflow` and `opacity`.
* Units: `px`, `%`, `em`, `rem`, `pt`, `vw`, `vh`.
* Layout is block flow with wrapped inline text, plus positioned layers (see below).

Not available: flexbox, grid, floats, gradients, shadows, transforms, animations and
transitions, custom fonts. Text is drawn in Roboto.

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

The language is ES5 plus arrow functions and a few later additions.

* Language: `var`, `let` and `const` (all scoped like `var`), functions, `if`, `for`, `while`,
  `for ... in` (keys in alphabetical order), `for ... of`, `try` / `catch` / `finally`,
  `throw`, `new`, `this`, objects, arrays, regular expressions like `/\d+/g`.
* Operators: besides the usual ones also `**`, `??`, the bit operators (`|`, `&`, `^`, `~`,
  `<<`, `>>`, `>>>`), `instanceof`, `typeof`, `delete`.
* Globals: `Math` (`round`, `floor`, `ceil`, `abs`, `min`, `max`, `sqrt`, `pow`, `trunc`,
  `sin`, `cos`, `PI`), `JSON.parse` and `JSON.stringify` (object keys come out sorted),
  `RegExp`, `Error`, `TypeError`, `RangeError`, `SyntaxError`, `Array.isArray`, `parseInt`,
  `parseFloat`, `String`, `Number`, `isNaN`, `NaN`, `Infinity`, `Object.keys`,
  `console.log/warn/error`.
* Strings: `split`, `replace`, `replaceAll`, `match`, `search`, `trim`, `trimStart`,
  `trimEnd`, `indexOf`, `lastIndexOf`, `charAt`, `charCodeAt`, `slice`, `substring`,
  `startsWith`, `endsWith`, `includes`, `concat`, `localeCompare`, `toUpperCase`,
  `toLowerCase`, `padStart`, `padEnd`, `repeat`, and `text[i]`. `split`, `replace`,
  `replaceAll`, `match` and `search` take a string or a regular expression; `replace` knows
  `$1`, `$&` and a function as the replacement. Numbers: `toFixed`, `toString`.
* Regular expressions: `test`, `exec`, `lastIndex` and the flags `g`, `i`, `m`, `s`, `y`.
  Look-ahead and look-behind (`(?=...)`) and back references (`\1`) are not supported; such a
  pattern throws a `SyntaxError`.
* Arrays: `push`, `pop`, `shift`, `unshift`, `slice`, `splice`, `concat`, `reverse`, `sort`
  (stable, with or without a compare function), `join`, `indexOf`, `lastIndexOf`,
  `includes`, `map`, `filter`, `forEach`, `find`, `findIndex`, `some`, `every`, `reduce`.
* Errors: a caught error has `name` and `message`. Errors of the engine itself, such as
  calling something that is not a function or parsing bad JSON, can be caught too.
* Timers: `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`. They run while the
  page is being drawn and use real time, not simulation time.
* DOM: `document.getElementById`, `document.querySelector`, `document.body`,
  `createElement`, `appendChild`, `removeChild`, `remove`, `parentNode`, `getAttribute`,
  `setAttribute`, `classList` (`add`, `remove`, `toggle`, `contains`), `textContent`,
  `innerText`, `innerHTML` (with markup), `className`, `id`, and `element.style.*`. Inside
  `onclick="..."` and in listeners, `this` is the element.

Not available: `Date` (read the time from `omsi.time` instead), `fetch` and any network
access, `localStorage`, `Promise`/`async`, `class`, `switch`, `do ... while`, getters and
prototypes. Use `if/else` chains and `while` loops instead.

At most 64 timers can be active at once. Further `setTimeout`/`setInterval` calls are
ignored.

When a script fails, the game log says where, for example
`htmltexture: script 1 error: line 14, column 23: unexpected character '@'`. Scripts are
counted from 0 in the order of the page, lines from the start of that `<script>` block.

A few limits protect the game from runaway pages. A single run of your script may take about
400,000 steps and at most 250 ms. Strings can be up to 16 MB and arrays up to about a million
values long (beyond that you get a `RangeError`). Scripts can be nested 96 levels deep and
function calls 48 levels deep, and very deeply nested markup (hundreds of levels) is not
drawn. Normal pages never get near any of these. An endless loop just gets cut off.

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
