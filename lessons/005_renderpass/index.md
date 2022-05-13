# Render Pass
In this chapter we are finally at a point where we can finally get something rendering. We have the canvas all setup along with having full access to WebGPU's API. From there we stored some geometry in a buffer then built our pipeline shaders. Now we bring it all together with a render pass where the shaders will execute on the data that's in the buffer.

The steps you need to do is very similar to WebGL except that instead binding things and doing the draw calls on the spot, we **"Record"** all those actions into something called a **Command Encoder**. Doing this allows WebGPU to work asynchronously compared to other older APIs. Take this example, you can actually write into multiple command encoders at the same time then pass them at once to execution on the gpu. There are even **Render Bundles** which you can record a section of instructions & reuse them in more then one frame freeing up time in the render loop.


### Pre-Rendering

We need to set a few things up before we start doing on rendering work. First thing we need is the get the current buffer from the **swap chain**. What the hell is a swap chain, you might ask? Behind the scenes there are usually 2 big images, one is currently being displayed to you while the other one is in reserve to be drawn into it. Once the second image is ready, the two images swop. For the next frame you can start drawing on the first picture, this is how you draw things from frame to frame. Things a lil more manual in WebGPU land then it was in WebGL, so it's just one of those things you need to do at the start of each frame render. It's just a single line of code from our canvas context to grab a view of the currently available texture we can use to draw into.

```js
const texScreen = ctx.getCurrentTexture().createView();
```

After that we have to define our Render Pass Descriptor. This object can be reused for each frame with one hitch being you need to update the **view** value before you start rendering each frame. The next item is the colorAttachment property, this array matches up with the **targets** array that we setup for the fragment shader in the previous chapter. So each target in the pipeline is actually a color attachment texture that you setup here. The final thing you can do here is setup the default color for every pixel at the start of each frame. The color values are normalized, so its easy to set a gray scale color but you'll need to do a lil math to get a particular color.

```js
const renderPassDesc = {
  colorAttachments : [{
    view        : texScreen, 
    clearValue  : { r:0, g:0, b:0, a:1 },
    loadOp      : 'clear',
    storeOp     : 'store',
  }]
};
```

Next up is creating our command encoder and beginning the process of recording. This is when we pass in our descriptor which is like the first command we encode which resets all the pixels in the screen texture with the default color you picked.

```js
const cmdEncode  = device.createCommandEncoder();
const renderPass = cmdEncode.beginRenderPass( renderPassDesc );
```

Now we begin the drawing part of the process. First we bind the pipeline which will run our shader. Then we bind our geometry and we do it by setting each butter to the location bind point of our pipeline. Remember @location? That number is what is set to bind a buffer to that particular variable in our shader. Then we draw by saying how many elements to draw. You can count each **Vertex** as one element. If we use the raw float array that holds are geometry, we can use the length of that array to help compute how many vertices exist in that array. Vertices are made of XYZ values, so it takes 3 floats to make a single vertex element or position. Dividing the total floats by 3 is enough to give you the total element count or in our case, total vertices available.

```js
// Bind Shader
renderPass.setPipeline( pipeline );

// RELATED TO SHADER :: @location(0) pos : vec3<f32>;
renderPass.setVertexBuffer( 0, bufVerts );

// Element Count = total_floats / 3_float_components_xyz
renderPass.draw( rawVerts.length / 3 );
```

One important thing to note is that the render pass's draw method is one of many. **Draw** itself is for drawing geometry that does not have any indices, so it's element count is equal to that of the count of vertices. If you have geometry that does have indices then you would use **drawIndexed** where it's element count is just the length of ints in the flat data array. There are others but we'll talk about them in a future chapter.

?> Fun Tip : You can fill up a buffer with lots of vertices and for frame slowly increment the element count to animate new vertices popping into the scene without updating the data in the buffer.

Lastly we close our pass and tell the encoder that your finished. All thats left is to submit it to the render queue on the gpu. As you see we have to pass in an array of command encoders. This allows you to work on more then one encoder at a time then send it up in one go for rendering.

```js
renderPass.end();
device.queue.submit( [ cmdEncode.finish() ] );
```


### Code Samples
||||
| - | -: | -: |
| Raw Code | <a href="/learn_webgpu/lessons/005_renderpass/raw_code.html" target="_blank">Run</a> | <a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/005_renderpass/raw_code.html" target="_blank">Source</a>
| Abstracted Code | <a href="/learn_webgpu/lessons/005_renderpass/abstract_code.html" target="_blank">Run</a> | <a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/005_renderpass/abstract_code.html" target="_blank">Source</a>


<div style="float:left">

[Previous Page](/lessons/004_pipeline/index.md)

</div>

<div style="float:right">

[Next Page](/lessons/006_/index.md)

</div>