# OMSI 2 compatibility

neoOMSI aims to reproduce the behavior players and content creators can observe in OMSI 2.2.032 while using a modern 64-bit engine. Compatibility is an ongoing project: a map or vehicle may load while some of its scripts, systems, or visual details still behave differently.

neoOMSI requires an installed copy of OMSI 2. It does not include the game's content. Use the release notes for the build you are playing to see recent changes, and keep the version menu set to the matching documentation version when comparing behavior.

## Reference baseline

The compatibility target is OMSI 2.2.032. This covers the behavior visible through supported maps, vehicles, scripts, and input devices. neoOMSI-specific features are described as such in the relevant guide.

## How to check whether content works

<span id="verification-workflow"></span>
<span id="compatibility-status"></span>

Start with a supported release and the content's required OMSI files installed. If the map or vehicle does not appear, check its loading messages for missing dependencies. A successful load does not guarantee that every feature has reached parity.

This guide describes **0.2.3 Stable**. Select **0.3.0 Release Candidate** in the version menu to read the upcoming release's guide; release candidates and nightlies may change without notice.

## How to report a mismatch

<span id="parity-evidence"></span>

Use the [issue tracker](https://github.com/neoOMSI/neoOMSI/issues) and include:

- the neoOMSI version and release channel;
- the map, vehicle, and add-on involved;
- the steps that reproduce the problem;
- what you expected and what happened;
- relevant neoOMSI logs or screenshots, with personal information removed.

Do not upload OMSI game files or other copyrighted content. A report should describe the behavior, not include proprietary game assets.

## How compatibility is checked

<span id="black-box-methodology"></span>

Compatibility reports are compared against OMSI 2.2.032 using the same content and settings where possible. Reports are most useful when the steps are repeatable and distinguish expected OMSI behavior from what neoOMSI displayed.

## Mod-specific issues

If a problem appears with one add-on, report it with that content's name and a small reproduction. The team will determine whether it reveals a general compatibility gap or depends on content-specific behavior.

## neoOMSI extensions

<span id="extensions"></span>

neoOMSI also has features that are not present in OMSI 2. These are documented as neoOMSI features and do not change the compatibility target.

### Material LED glow

The `[led_glow_effect]` material setting was added in 0.3.0. See the [0.3.0 guide](/0.3.0/compatibility/#material-led-glow) for details.
