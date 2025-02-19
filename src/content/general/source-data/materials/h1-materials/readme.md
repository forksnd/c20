---
title: H1 materials
img: materials.jpg
caption: >-
  An example of some material names used for a level
  [BSP](~h1/tags/scenario_structure_bsp) in [Blender](~).
thanks:
  Halo PC End User Editing Kit Development Team: >-
    Writing the original [HEK
    tutorial](https://www.haloce.org/HEK_Tutorial/main/credits.html) which
    documents many of these conventions
  Conscars: Seamsealer effects on cluster type, material symbol testing
---
Tool uses a material naming convention to assign shaders and give special properties to parts of your model. Halo 1's convention is simpler than later games. This convention applies to both 3ds Max and Blender use.

# Material naming and shaders
In your 3D software you can assign named _materials_ to parts of your model. The name of the material is included in your exported [JMS file](~jms). When importing your JMS to tag form, Tool will then parse this material name and search for a shader tag with a matching name to assign to those parts of your model. The material name can also include special symbols.

For example, a level BSP which has the material name `vines^` will cause Tool to search for a shader named `vines` and treat the surface as a ladder due to the `^` symbol. You might have a corresponding shader at `tags\levels\my_level\shaders\vines.shader_environment` but it could also unintentionally match with a `vines.shader_transparent_chicago` from some other level. For this reason it's important to name your materials and shaders uniquely. Always use lower-case names and do not exceed 32 characters.

When no matching shader tag can be found, [Tool](~h1-tool) will ask you to generate an empty one by choosing a shader type. HEK Tool will create these in the root of the tags directory, whereas H1A Tool will create them in a `shaders` directory next to the model tag. In the case of HEK Tool, you will probably want to move these files into your level's shaders directory later just to keep things tidy. Once Tool has generated the empty shader tags, you must compile the model from JMS again for those shaders to be referenced.

Sapien and/or Halo may crash if you do not set up any [bitmap](~h1/tags/bitmap) references in these new shaders so do that before proceeding; empty shaders are invalid.

HEK Tool is hard-coded to not find any shader matches for the cut level `levels\b20`. This is no longer the case in H1A Tool.

# Special materials
These material names are hard-coded into Tool and have special meaning when creating levels. They do not need shader tags.

| Name | Usage
|------|------
| `+sky`, `+sky0`, `+sky1`, ... | Applied to surfaces to render the [skybox](~h1/tags/sky). You can add the index of the sky in the [scenario skies block](~h1/tags/scenario#tag-field-skies) if your scenario has multiple skies. Since each [cluster](~h1/tags/scenario_structure_bsp#clusters-and-cluster-data) can only reference [one sky](~h1/tags/scenario_structure_bsp#tag-field-clusters-sky), you must ensure that all sky faces within a cluster use the same index. Sky faces are necessary to form a [sealed world](~bsp-troubleshooting#sealed-world-rules) and are collideable. Projectiles are removed when they hit sky faces.
| `+seamsealer` | Used to seal holes at BSP transition areas or in unfinished parts of a level. These faces behave almost the same as `+sky`; they show the skybox through them, are collideable, remove projectiles, and need to follow the sealed world rules. Where they differ is that seamsealer will not cause a cluster containing them to be considered an [outdoor cluster](~h1/tags/scenario_structure_bsp#indoor-vs-outdoor-clusters) or permit any sky light to pass through them, _unless_ there are `+sky` faces in that cluster too or it's forced to become an outdoor cluster due to the PVS.
| `+portal` | Applied to faces that are used to define general [portals](~h1/tags/scenario_structure_bsp#portals) used in the visibility solution or rendering occlusion for the level. Because they split the level into [clusters](~h1/tags/scenario_structure_bsp#clusters-and-cluster-data), they are also used to define areas of different sound environments or weather. Portal planes are also candidate [dividing planes](~/h1/tags/scenario_structure_bsp#tag-field-collision-bsp-bsp3d-nodes-plane) for Tool's construction of the collision BSP, so changing your portals may affect where and if [collision artifacts](~h1/tags/scenario_structure_bsp#collision-artifacts) occur.
| `+exactportal` | Applied to faces that are used to define an exact volume or portal. Such faces typically cover exactly the opening of a doorway, passage, or hallway to define a very distinct volume that can be used to occlude the rendering of other areas of the level. The portal need not be planar, but all of its vertices must be perfectly aligned (but not welded) with the level's vertices. Both `+portal` and `+exactportal` are represented the same way within a [BSP tag](~h1/tags/scenario_structure_bsp) once compiled.
| `+weatherpoly` | Used on the faces of simply [convex shapes](https://en.wikipedia.org/wiki/Polyhedron#Convex_polyhedra) to generate [weather polyhedra](~h1/tags/scenario_structure_bsp#weather-polyhedra), which are used to mask [weather particles](~weather_particle_system) from areas under overhangs and around doorways. The faces do not need to be sealed but do need to be connected to each other in each polyhedron.
| `+sound` | Applied to faces that are used to define volumes for sound.
| `+unused` | Indicates that the surface is unused for rendering or collision purposes, and is only used in conjunction with the material symbol `$` like `+unused$` to define [fog planes](~/h1/tags/scenario_structure_bsp#fog-planes) when there's no other suitable material to put the symbol on (like a water surface). An example of `+unused$` in use would be like _Gephyrophobia's_ fog. Using this special material with other symbols has no effect.

# Material symbols
Material symbols are added to the **end** of the material name and give the surface certain attributes or behaviours in-engine.

| Symbol | Usage
|--------|------
| `%` | **Two-sided property**. This property results in both the duplication of render geometry with flipped [normals](https://en.wikipedia.org/wiki/Normal_(geometry)) and causes the surface to have two-sided collision (unless marked render-only with `!`). A surface with this symbol does not need to follow sealed world rules (it can have open edges), however you cannot use it to seal the level. Surfaces with this material symbol support [tinted shadows](~h1/tags/shader#tag-field-tint-color). This symbol is typically used on glass windows and floor grates if the player will see them from both sides, however it may be unnecessary with transparent shaders like glass, generic, and chicago, which also have a [_two-sided_ flag](~shader_transparent_chicago#tag-field-shader-transparent-chicago-flags-two-sided) that you can enable. This symbol should also be avoided for [shader_transparent_water](~) which always renders two-sided and would result in doubling up the water faces.
| `#` | **Transparent property**. Used for one-sided non-manifold (unsealed) collidable geometry like grates. Surfaces with this material symbol support [tinted shadows](~h1/tags/shader#tag-field-tint-color). Note that shadows will only be cast when the normal points _toward the surface being shadowed_, not toward the sun. Although these are rendered one-sided, they're still collideable from both sides.
| `!` | **Render-only property**. This causes the surface to have no collision and therefore does not need to follow sealed world rules. Use this for things which the player will not interact with like small cables or 2D "billboard" trees outside the playable space. Render-only surfaces will not cast shadows, regardless of what other symbols are combined.
| `*` | **Large collidable property**, also called **sphere collision only** and **player clip**. This creates non-rendering collision-only geometry that ray tests (such as [projectiles](~h1/tags/object/projectile)) pass through but not sphere-based collisions (like [bipeds physics pills](~h1/tags/object/unit/biped#physics-pill) and [vehicle physics](~h1/tags/physics)). This symbol is ideal for surfaces which prevent the player from getting stuck on small obstacles, covering stairs with invisible ramps, and stopping players from going out of bounds, all while still allowing grenades and bullets to pass through. Does not cast shadows.
| `@` | **Collision only property**. Used for non-rendered collision geometry. These surfaces will stop all types of collision rather than sphere only like `*`. They're essentially like regular BSP surfaces just without any render geometry, so they need to follow sealed world rules. Also like regular BSP surfaces, they cast shadows and do not tint.
| `$` | **Fog plane property**. This symbol caused faces to be used as a [fog plane](~/h1/tags/scenario_structure_bsp#fog-planes), to which [fog](~) can be assigned in Sapien. The fog region is the space anti-normal to (behind) the surface. When the fog plane exists alone, it is paired with the special material `+unused` to make `+unused$`. When the fog plane is used with [water](~shader_transparent_water), you would name the material like `my_water_shader!$`.
| `^` | **Ladder property**. This indicates if the collision surface is [climbable](~h1/tags/scenario_structure_bsp#tag-field-collision-bsp-surfaces-flags-climbable). Use it for ladders. It's common to pair this with two-sided property like `my_ladder_shader%^` for 2D floating ladder planes.
| `-` | **Breakable property**. Use this for breakable glass surfaces. When destroyed they will shatter into small particles and become collisionless. Note: Halo will only shatter surfaces at runtime if their [shader _material type_](~h1/tags/shader#tag-field-material-type) is set to _glass_. Using this symbol on its own will lead to [open edges](~bsp-troubleshooting#sealed-world-rules) so you'll need to combine it with `%` or `#`. This property does not affect [tinting](~h1/tags/shader#tag-field-tint-color).
| `&` | **AI deafening property**. This is a special kind of portal which does not propagate sound. AI will not be able to hear sounds through it.
| `.` | **Exact portal property**. This symbol can be used for materials which are always used on surfaces that perfectly separate one space from another. In other words, they will work just like `+exactportal`. This is an easy way to automatically create some exact portals where you have enclosed spaces behind glass and grates.

There is no symbol for surfaces which only projectiles will collide with; just `*` for blocking vehicles/players and `@` for blocking everything. However, you _can_ create a custom [device_light_fixture](~h1/tags/object/device/device_light_fixture#collisions) since this object type blocks projectiles but not players and vehicles. This makes them ideal for energy-shielded doorways.
