# Pipeline
So what are pipelines? Pipelines are in fact just a new name for **shader programs**, so any experience you have working with shaders in API's like **WebGL** will transfer over quite well to **WebGPU's Pipelines**. WebGPU divides pipelines into different types with the main focus being on the Render Pipeline & the Compute Pipeline. For this chapter we'll be focused on just the render pipeline since it's what we need to draw things to the screen.

Here's a bit more insight for the newbies, **Shaders** are these little programs you typically write with a C like language. Each main graphics API has it's own shader language. In **WebGL / OpenGL / Vulcan** you would use **GLSL**, in the window's **DirectX** you'd use **HLSL** and lastly in the mac world the API & shader language are called **Metal**. The whole point of these shader programs is to do 2 main things with the first being to turn your 3D data into 2D while the second step is filling in all the pixel colors that the 2D representation if your 3D model occupies on the screen.

Like in other shader languages, we have the typical main two that needs to be written. The **Vertex** shader is where we can manipulate our 3D Data. There's things like displacement, skinning or what have you that you can choose to use the gpu to modify the data of your model before it renders. 99% of the time the only manipulation your going to do is apply a few matrices to the vertices. First is called the **ModelMatrix** which just does your basic transformation: move, scale & rotate. Next up is the **ViewMatrix** which its purpose is to move the model in relation to how the camera for the scene is situated. Lastly you have your **PerspectiveMatrix** which deforms the mesh so things like bigger near the camera and smaller when its far away. Then you have your **Fragment** shader with the job of just coloring the pixels for all the triangles that the vertex shader help build.

### WGSL ( WebGPU Shader Language )

Previously we had to use GLSL to write shaders which was a C like but with the creation of WGSL the powers that be designed it with rust syntax in mind. If you've never experience rust before, I probably would describe it as a weird fusion of C++ and Javascript. The syntax is simpler in some cases but a bit more verbose in others. Here's an example of what our basic Vertex shader looks like.

```rust
struct FragOut{
    @builtin(position) Position : vec4<f32>;
}

struct Attrib{
    @location(0) pos : vec3<f32>;
}

@stage(vertex)
fn main( attrib: Attrib ) -> FragOut {
    var out: FragOut;
    out.Position = vec4<f32>( attrib.pos, 1.0 );
    return out;
}
```

I don't want to dive deep into all the lil bits of the WGSL language, but the main points to take note is that you can define structs for input & output. You don't have to use FragOut or Attrib, nor any of the property names. You can make up whatever you want then just use the decorators ( code with @ ) to define parts of your structs.

```rust
@stage(fragment)
fn main() -> @location(0) vec4<f32> {
    return vec4<f32>( 1.0, 1.0, 1.0, 1.0 );
}
```
Then you have your fragment shader. This is all you need to get started with.

### Descriptors

Now we're going to walk through creating our pipeline. Creating shaders now require you to create a descriptor that defines all the code, attributes and features you want your shader to have before you pass it the the api's method that compiles the shader. Don't let the name fool you, it's just json objects & arrays.

```js
const pipeline = device.createRenderPipeline({
    primitive   : { topology: 'triangle-list', cullMode: 'back', frontFace:'ccw', },

    vertex      : { 
        entryPoint  : 'main', 
        module      : device.createShaderModule( { code:VERT_SRC } ),
        buffers     : [
            { arrayStride : 3 * 4, 
              attributes  : [
                  { shaderLocation:0, format:'float32x3', offset:0 }
              ]
            },
        ],
    },

    fragment    : { 
        entryPoint  : 'main', 
        module      : device.createShaderModule( { code:FRAG_SRC } ), 
        targets     : [ { format : format } ] 
    }
});
```

Lets start with primitive object.
```js
{ 
  topology  : 'triangle-list', // point-list, line-list, line-strip, triangle-strip
  cullMode  : 'back', // front, none
  frontFace : 'ccw', // cw
}
```
***Topology*** is just like WebGL's draw mode. It just tells the shader how the vertices line up in the buffer. Are they arrange as triangles, line, points, etc. Most often your going to stick with **triangle-list** as all regular mesh data are layed out as triangles.

***CullMode*** just means which side of the triangle to ignore. By setting **back** you're telling the gpu to not render any face that's points away from the camera. The vertex shader will still process through all the vertices but the back facing ones won't make it to fragment shader stage.

***FrontFace*** just lets you define the winding of the front face. There are times when you'd want to change the winding, like a mesh comes from an app that uses clockwise winding instead. Or you want to render a skybox / skydome, flipping the front face winding will allow you to skip generating specialized geometry for those niche use cases.

Next we'll go over the vertex descriptor.
```js
{
  entryPoint : 'main', 
  module     : device.createShaderModule( { code:VERT_SRC } ),
  buffers    : [
    { // RELATED TO SHADER CODE -- @location(0) pos : vec3<f32>;
      arrayStride : 3 * 4, 
      attributes  : [
        { 
          shaderLocation : 0, 
          format         : 'float32x3', 
          offset         : 0
        }
      ]
    },
  ]
}
```

***EntryPoint*** is just the name of function in your shader that will be called first when it executes. For simplicity sake we will always just leave it as **main** since this is typically the case in languages like java, c#, c, rust. The option is there if you feel like changing things up.

***Module*** is the spot where we an prep our shader source for compiling.

***Buffers*** is when we start to define what the buffers mean when the shader takes them in as input. ***ArrayStride*** is how big in bytes one chunk of data is. Vertices are usually setup as a Vector3 which means it has 3 floats with 4 bytes each. This can mean more when your dealing with interleaved data but I'll dedicate a chapter to just that idea, but for now we'll just focus on a single buffer per attribute. The ***attributes*** array goes further to define the actual data from our buffer. In WebGPU you have **slots** where you can assign attributes to be bound to and each one has a number. In the shader we can use @location(n) to say which slot should have this data then in the descriptor we match up @location to shaderLocation. Since in the shader we define our first attribute with **vec3(f32)** means you will set the format to **float32x3**. With offset you can keep it at zero till you do more advanced stuff like interleaved data. Keep the location number handy because when we get to the actual rendering we'll need it to bind the actual buffer to that shader slot.

We'll finish by looking at the fragment descriptor.
```js
{ 
  entryPoint  : 'main', 
  module      : device.createShaderModule( { code:FRAG_SRC } ), 
  targets     : [ { format : format } ] 
}
```

***EntryPoint*** and ***Module*** are the same as the vertex descriptor, but ***Targets*** is something unique to the fragment shader. A Target is the texture to draw to that's been assigned to a frame buffer. Normally you'll only have 1 target to deal with but when you want to start doing post processing and the likes of deferred rendering, you'll setup multiple textures to draw too. For example in deferred rendering you'll setup at least two targets, Color and Normal. Then in your fragment shader you will output two values instead of the usual 1 color. This is done so you can store information to use later on in your lighting calculations after you've completed rendering all your models. It's an optimization thing people do but there are plenty of other use cases beyond what I just described. Lastly, targets will need to the **format** string we used in a previous chapter when linking the API to the canvas. This is the preferred format for your computer that was given to you by the canvas. That format value has to be set on every shader you want to compile. It's kind of a pita, but it is what it is.


That's all the bare bone stuff you need to get started with render pipelines. There are more settings like bindgroup layouts, uniforms, depth buffers, etc that will need to be configured for a pipeline but we'll get to those in the future as we need them.

### Further Reading

- https://dmnsgn.me/blog/from-glsl-to-wgsl-the-future-of-shaders-on-the-web/
- https://www.construct.net/en/blogs/ashleys-blog-2/porting-webgl-shaders-webgpu-1576
- https://sotrh.github.io/learn-wgpu/beginner/tutorial3-pipeline/#what-s-a-pipeline


### Code Samples
||||
| - | -: | -: |
| Raw Code | <a href="/learn_webgpu/lessons/004_pipeline/raw_code.html" target="_blank">Run</a> | <a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/004_pipeline/raw_code.html" target="_blank">Source</a>
| Abstracted Code | <a href="/learn_webgpu/lessons/004_pipeline/abstract_code.html" target="_blank">Run</a> | <a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/004_pipeline/abstract_code.html" target="_blank">Source</a>


<div style="float:left">

[Previous Page](/lessons/003_buffers/index.md)

</div>

<div style="float:right">

[Next Page](/lessons/005_renderpass/index.md)

</div>