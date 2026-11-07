# Sharing assets between content packs

Content authors can reuse installed assets without copying them into every vehicle or scenery folder. Relative mesh and script references already work. The optional `[neo_texturepath]` and `[neo_texture]` tags extend this to texture lookup in vehicle `model.cfg` files and scenery `.sco` files, including a `.sco` that refers to a separate model configuration. These are **neoOMSI extensions**, not OMSI 2 parity features. The texture tags apply to the whole definition, so put them before the first `[mesh]`; they do not need a `[matl]` block.

### Shared texture folders

Add one `[neo_texturepath]` per fallback texture folder. Each tag takes exactly one line: the folder path, relative to the file containing the tag. Both `\` and `/` separators work, and `..` goes up one folder within the installed content root. Do not add quotes around paths containing spaces. Use relative paths rather than paths on your own PC.

For example, given:

```text
Vehicles/
  Custom Bus/
    custom.bus
    Model/model.cfg
    Texture/
  Donor Bus/
    Model/body.o3d
    Texture/body.dds
    Texture/seats.dds
```

`Vehicles/Custom Bus/Model/model.cfg` can contain:

```ini
[neo_texturepath]
..\..\Donor Bus\Texture

[mesh]
..\..\Donor Bus\Model\body.o3d
```

The mesh's texture filenames are looked up in the declared donor folder if they cannot
be found through the custom bus's normal texture search. Authors do not have to edit the
borrowed mesh or redistribute its textures. Specify the actual texture directory: the tag
does not recursively search every subdirectory or infer the folder from the mesh path.

### Individual texture files

Use `[neo_texture]` to share a single file instead of making its whole folder available:

```ini
[neo_texture]
..\..\Donor Bus\Texture\seats.dds
```

The texture's basename must match the name requested by the mesh or material, ignoring
case and the supported image extension. For example, a mesh requesting `seats.bmp` can
use the explicitly shared `seats.dds`. This tag does not rename materials or redirect an
unrelated filename. Other textures in that donor directory remain unavailable unless
another tag shares them. Repeat the tag for additional files.

### Search order and existing materials

1. Existing local textures, selected repaint textures and normal global fallbacks keep
   their current priority.
2. Shared folders are searched in declaration order.
3. Individual shared files are searched in declaration order.

The first matching location wins. A local texture with the same name therefore still
overrides the donor. This is a fallback mechanism, not a way to force a different texture
over an existing local file. Repaints, text/script textures, material indices, glass
settings and render order are not changed by these tags.

Folder lookups keep the existing case-insensitive lookup, DDS replacement and seasonal
texture rules. An individual file uses the declared file, with a matching seasonal copy
from its adjacent seasonal subfolder when available. Texture sidecars are loaded beside
the resolved texture as usual. Mounted content packs and session overlays use the same
content-root resolution as other assets; `..` cannot escape a registered content root.

A missing shared folder or file is skipped and lookup continues. If no location provides
the texture, neoOMSI uses its existing missing-texture handling and log warning; it does
not invent a substitute from another bus. Give dependent packs distinctive filenames
when unrelated textures would otherwise share a name.

### Scenery objects

The same tags work in `.sco` files. Paths remain relative to the `.sco`, not to its mesh:

```ini
[neo_texturepath]
..\Shared Scenery\Texture

[neo_texture]
..\Shared Signs\Texture\sign_face.dds

[mesh]
..\Shared Scenery\Model\shelter.o3d
```

For a `.sco` containing `[model]`, tags in the referenced model configuration are resolved
relative to that configuration, while tags in the wrapper remain relative to the `.sco`.
All shared locations from the model are searched before the wrapper's shared locations;
within each definition, shared folders precede individual files.

### Shared scripts, variables and constants

Script sharing uses the existing counted lists; no new tag is necessary. In
`Vehicles/Custom Bus/custom.bus`, for example:

```ini
[varnamelist]
1
..\Donor Bus\Script\shared_varlist.txt

[stringvarnamelist]
1
..\Donor Bus\Script\shared_stringvarlist.txt

[constfile]
1
..\Donor Bus\Script\shared_constfile.txt

[script]
2
..\Donor Bus\Script\electrics.osc
..\Donor Bus\Script\lights.osc
```

List each required file explicitly and set the count to the number of entries. Script
folders are not imported automatically. Preserve the donor's required script order,
variables, constants and triggers; sharing a file does not adapt a script to a different
vehicle. Scenery `.sco` files support the same script-list tags, with paths relative to
the `.sco`. Script instances still have their own state; these paths share source files,
not live vehicle state.

### Distribution and compatibility

Declare the donor pack and required version as a dependency of your add-on. Players must
install it themselves. These references do not download assets, bypass installation or
licensing requirements, or grant redistribution permission. No donor assets should be
committed to this repository.

OMSI 2 does not use the two texture-sharing extensions. Content relying on them for
otherwise missing textures requires neoOMSI. To also support OMSI 2, supply a separately
tested compatible configuration and any legally distributable local textures. Existing
mesh/script path support should not be mistaken for support of the new texture tags.

Use neoOMSI's content validator to check the resulting dependencies.
Also test a normal spawn, a repaint and any seasonal/material variants your add-on uses.
