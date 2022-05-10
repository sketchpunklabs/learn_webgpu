# Context

The title of this section is miss leading. When it comes to the HTML Canvas, the context is usually the end all be all when it comes to getting access to a drawing API, but it's not the case for **WebGPU**. The context in this situation does not give you access to the api, but just a means to connect the API to the Canvas. For anyone who's used to **WebGL** or **2D** context, I'm going to call it that for now to make the transition a bit easier. The ***true WebGPU*** context comes from the Adapter & Device.


### Adapter

What is the Adapter? The official documents say it's the available WebGPU implementations on your computer. Probably the easier answer is, whatever on your machine that can run WebGPU for you, be it the graphics card, some integrated chip or even some software that emulates a graphics card.

Requesting an adapter can take in some optional parameters, but the official documentation doesn't give any detailed information beyond the fact that when it comes to multiple things that can run WebGPU for you, these options give you a way to choose which one to use by saying you want one that must have X feature available in that implementation.

To get the adapter is different then your typical api calls as this one uses promises / async. You'll need to use **.then()** or **await** inside async function to get the WebGPU adapter. It makes sense why it has to be this way, it might take a second or two to find the right adapter and initialize it for use & you don't to freeze up the browser in the process.

```js
const adapter = await navigator.gpu.requestAdapter( { /* options */ } );
if( !adapter ){ alert( 'Unable to obtain webgpu adapter' ); return; }
```

### Device

Device is the API *"Context"* we're looking for. It's very similar to WebGL's context as it contains all the methods needed to work with the GPU. It also acts as the container for all the resources you create with it: shaders, textures, buffers, etc.

You can think of device as just an instance of the adapter. The follow line can act as a mental picture.
```js
device = new Adapter( 'My_Graphics_Card' );
```

Sadly, it's not as simple as that but it's not hard to get a device reference. Here's all you really need.
```js
const device = await adapter.requestDevice( { /* options */ } );
if( !device ){ alert( 'Unable to obtain webgpu device' ); return; }

// Set a callback to alert when device is no longer available
device.lost.then( info=>console.error( 'Device was lost.', info ) );
```

!> When the device is lost, all it resources go with it. When that happens, you'll need to re-initialize all your gpu resources. Depending on how you structure your code your only option might be to refresh the page. Keep in mind the state of your application if this happens.

### Glue it all together

With Adapter & Device on hand, we have one more step to go. We need to link the device to the canvas, so the graphics API knows where the final pixels will be displayed. It's kind of funky to do this especially since it's never been done with other APIs. I suspect it's because WebGPU can be used beyond the browser, you can make desktop app with Rust & WebGPU for example. So in that sense, the separation of the API from Canvas makes sense.

?> Curious about Rust & WebGPU: https://wgpu.rs/

What to do? First, we need to get the format value from the adapter, but we need the canvas context to do it. Since WebGPU runs on top of other Graphics API, some formats work better on different systems. I know in early days of WebGPU I tried using a different format which worked well on windows but would crash WebGPU on apple computers. At this point the API now has a way for us to get the best format to use while still leaving the option to experiment with other formats.

?> Format is just data layout for a pixel, ex: Pixel has RGBA, stored as Float32

?> Store format somewhere, you'll need it for every shader you compile

After that, we just need to package the device, format, the canvas's **device pixel size**. The alpha mode is only needed since the current version of WebGPU gives you warnings about it & I don't like to see warnings in my console log. Pass that all along to our webgpu canvas context and walla, everything is ready for actual use.

```js
const format = ctx.getPreferredFormat( adapter );

ctx.configure({
    device                  : device, 
    format                  : format, 
    size                    : [ canvas.width, canvas.height ],
    compositingAlphaMode    : 'opaque'
});
```

### Raw Code & Abstractions
So thats the end. The following links will have the raw code & abstraction in relation to this lesson.

**Raw Code** -
<a href="/learn_webgpu/lessons/002_context/raw_code.html" target="_blank">Run</a> :: 
<a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/002_context/raw_code.html" target="_blank">Source</a>

**Abstracted Code** - 
<a href="/learn_webgpu/lessons/002_context/abstract_code.html" target="_blank">Run</a> :: 
<a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/002_context/abstract_code.html" target="_blank">Source</a>

[Previous Page](/lessons/001_canvas/index.md)