# Buffers

A major part of any graphic API is the buffer as it's the storage for most if not all the data being passed or generated on the GPU. For the most part the buffer can be viewed as just a large byte array with no definition of it's data type. Data types only come into play when you start to assign a buffer to an attribute or texture, so in a sense a single buffer can be treated as float32 for one shader then as a Uint32 on another without changing the underlining data. There really isn't a use case for this but it is possible if you wanted to go crazy one day and see what happens :)

Buffers can be broken down into a few different types, each one has it's rules & quirks on how to use them but they all follow the same steps when it comes to creating & updating the data. Each type deserves it's own chapter, so with this one we will focus on **Vertex Buffers** since it's the type you'll end up using the most.

### Vertex Buffers
This is your bread & butter when it comes to 3D rendering as this is the primary storage for all your 3D models. When it comes to meshes, you'll need to deal with 3 data types when it the time comes to assign them as attributes of a pipeline ( shader ). All data related to the vertex will always be a Float32 while the data defining the faces ( triangles ) will either be Uint16 or Uint32.

I know in the beginning I said buffer's don't really have types. The thing is you need an ArrayBuffer or one of its type array wrappers to push data to the gpu. At a bare minimum you need vertices to render any mesh, so lets start with defining a simple triangle.

```js
const vertices = new Float32Array( [0,0,0, 0,1,0, 1,0,0 ] );
```

Vertices will always exist as float data. It's the case because the location of a point in space can be anywhere in the positive or negative direction along with having a value less then 1. You can think of it as taking tiny steps to reach one full step, so you need floats to be able to define a number that exists between 0 and 1, like 0.5 can be your half step across the virtual world. Now, behind the scenes you can access the actual ArrayBuffer by doing ***console.log( vertices.buffer )*** which will tell you it's an array buffer with 36 bytes.

Why does that matter? Because when you create a buffer you need to give it a byte size. Looking at the code, you might not even have a clue how many bytes the vertices are taking up. You can tell that its taking up 9 floats but how many bytes? When it comes to the data type of Float32, it means a single float number uses up 32 bits of information. What's a bit? TIS BINARY, those lovely 1s & 0s... I digress. So, since each byte is made from 8 bits, 32 bits equals out to be 4 lovely bytes. So in the end we have 9 floats times 4 bytes giving you 36 bytes in total. So thats how big we need to set the buffer before we copy our data into it.

This is normally how you see people compute the total bytes of a float array.
```js
const byteSize = vertices.length * Float32Array.BYTES_PER_ELEMENT;
```

BUT if you want to be clever & skip the math, just ask the type array how many bytes it takes up
```js
const byteSize = vertices.byteLength;
```

After going through bits this & bytes that, we have one more thing we need to decide. Is the buffer going to be static or is it going to be updated often. Static means it's not going to change, most meshes don't change their raw data in the buffer so most often then not it's going to be static. If for some reason you're doing some advanced procedural generation or some other reason to dynamically alter the bytes in your buffer you'll need to set it up as dynamic. When we talk about Uniform buffers, you'll always end up setting those up as dynamic since they will change often.

```js
const isStatic = true;
const usage = ( isStatic )? 
    GPUBufferUsage.VERTEX : 
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

const props = {
    size                : vertices.byteLength,
    usage               : usage,
    mappedAtCreation    : true,
};

const buf = device.createBuffer( props );
```

What's this mappedAtCreation thingy? This is something new in WebGPU that you didn't have to worry about in WebGL. In the old API you would just call a method with your vertices float array & it'll upload the data to the gpu's buffer on the spot. With WebGPU things tend to work more asynchronously & transferring data between cpu memory to gpu memory gets complicated behind the scenes. You can read further on the subject of the WHY, but for our purposes all we need to know is that we have to ask the API to give us a "cargo ship" so that we can then dump are cargo on it then let it sail away back to gpu land. So mappedAtCreation is our way of calling this ship to dock at the harbor.

```js
// Get ArrayBuffer, Wrap it with a Float32Array then copy our data to it.
new Float32Array( buf.getMappedRange() ).set( vertices );

// Let go of the data so it can be transferred to the GPU.
buf.unmap();
```

### Further Reading

https://github.com/toji/webgpu-best-practices/blob/main/buffer-uploads.md

### Code Samples
||||
| - | -: | -: |
| Raw Code | <a href="/learn_webgpu/lessons/003_buffers/raw_code.html" target="_blank">Run</a> | <a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/003_buffers/raw_code.html" target="_blank">Source</a>
| Abstracted Code | <a href="/learn_webgpu/lessons/003_buffers/abstract_code.html" target="_blank">Run</a> | <a href="https://github.com/sketchpunklabs/learn_webgpu/blob/main/lessons/003_buffers/abstract_code.html" target="_blank">Source</a>


<div style="float:left">

[Previous Page](/lessons/002_context/index.md)

</div>

<div style="float:right">

[Next Page](/lessons/002_context/index.md)

</div>