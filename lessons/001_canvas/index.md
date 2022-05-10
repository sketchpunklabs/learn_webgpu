# Canvas

The html canvas is the starting point for any hardware accelerated drawing, be it the **2D Context**, **WebGL** or **WebGPU**. So without question the first thing you need to start doing some **WebGPU** is to create one. There are two basic ways you can go about creating your canvas :

HTML Way
```html
<canvas id="pgCanvas"></canvas>
```

Javascript Way
```js
const elm = document.createElement( 'canvas' );
document.body.appendChild( elm );
```

### Check for WebGPU
Technically the first think you'd want to do is make sure you can use the WebGPU API in your browser of choice. Doing the check is pretty easy, you just need to test for the existence of the gpu property on the navigator global object.

```js
if( !navigator.gpu ){
  alert( 'WebGPU not available' );
}else{
  // Make Glorious 3D Content
}
```

### Context
The context is an object you can request from the canvas that gives you back an object with methods & constants you need to draw using that particular API. If you asked for the **2D** context you can then use a whole host of methods to draw circles, squares, polygons, etc. In our case, we want access to the **WebGPU** context, which will give us everything we need to utilize our computer's **GPU** to draw 3D graphics *really really* fast.

The first thing you needs is a reference to the html canvas element. If you created one with javascript then your already halfway done. If not, then you'll need to use javascript to get access to it. You can do so in many ways.

```js
const canvas = document.querySelector( 'canvas' );      // first canvas available
const canvas = document.getElementById( 'pgCanvas' );   // get a specific one with an id 
```

Once you have the canvas reference, you then just call its getContext method with the name of the API you want access to, which is ***webgpu***.

```js
const ctx = canvas.getContext( 'webgpu' );
```

That's it! You now have the power of the GPU at your grasp, BUT unlike **2D** & **WebGL** we need a few extra steps to gain access the **GPU** which we'll go through in the next lesson.

### Setting the size
Before we go & finish getting access to the GPU, we can finish setting up the canvas. One of the last things you need to do is properly setup it's size. This is pretty important because depending on your display, things might look a bit blurry if you don't. This is typical for dense displays that have pixels smaller then normal or maybe the PC has zoom setup to make things look larger then they really are.

For those special displays you will have two sets of width & height. One you can call the ***Device Size***, this is the ***true*** pixel count of your display. You need this to properly setup your **WebGPU** frame buffers so that you are drawing on every available pixel in the area you want to draw to. The second can be called the ***CSS Size***, this is what the webpage thinks is the pixel size.

The easiest way to tell if your device has different sizes between ***Device*** & ***CSS*** is by checking the value of devicePixelRatio. If you get back a value other then one, then your display doesn't have a 1 to 1 ratio, meaning 1 Device Pixel != 1 CSS Pixel. You can use this ratio to scale the size you want to compute the true size that you'll need for **WebGPU**.

The following code is how you go about setting up your canvas size to make everyone happy.
```js
const cssWidth      = 400;
const cssHeight     = 400;
const dpr           = window.devicePixelRatio || 1;

// Need to round, you can't have a fraction of a pixel, can you?
const deviceWidth   = Math.round( cssWidth * dpr );
const deviceHeight  = Math.round( cssHeight * dpr );

// Internally set with the right size
canvas.width        = deviceWidth;
canvas.height       = deviceHeight;

// Externally set with the right size
canvas.style.width  = cssWidth + 'px';
canvas.style.height = cssHeight + 'px';
```

### Raw Code & Abstractions
In this lesson we stepped through the raw code of how to setup our canvas for **WebGPU**. BUT! Raw code isn't good enough, it's boiler plate stuff that you don't want to copy & paste all the time. This is where the notion of **Abstraction** comes into play. Every library you've seen for **WebGL** & will see for **WebGPU** is just someone's **abstraction** or more bluntly put, is someone's interpretation of how they perceive is the best way to utilize the graphics API. There is no ***best*** way really, some people might prefer Object oriented, others functional, some might want heavy abstraction with no direct API being visible while others might prefer light abstraction to be "close to the bare metal" as some would say.

The abstraction I'm laying forth is just what I think is good for learning maybe even for prototyping but most likely not what you'd want for your production code. The goal is teach you two ways to go about things & for you to go about it in your way at the end.

**Raw Code** -
<a href="/learn_webgpu/lessons/001_canvas/raw_code.html" target="_blank">Run</a> :: 
<a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/001_canvas/raw_code.html" target="_blank">Source</a>

**Abstracted Code** - 
<a href="/learn_webgpu/lessons/001_canvas/abstract_code.html" target="_blank">Run</a> :: 
<a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/001_canvas/abstract_code.html" target="_blank">Source</a>

?> Fun Tip : You can use the 2D canvas as a texture source. You can do 2D drawing with it & then have it converted to a gpu texture that you can then render in your 3D scene.

[Next Page](/lessons/002_context/index.md)