import Fungi from './Fungi.js';

export default class WebGPU{
    // #region MAIN
    name    = 'webgpu';
    canvas  = null;
    context = null;
    adapter = null;
    device  = null;
    format  = null;

    async init( canvas, props={} ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( !navigator.gpu ) throw new Error( 'WebGPU not available' );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const optAdapter = {
            powerPreference         : 'low-power', // 'high-performance', // 
            forceFallbackAdapter    : false, // Fallback Adapters are currently not supported in browsers
        };

        this.adapter = await navigator.gpu.requestAdapter( optAdapter );
        if( !this.adapter ) throw new Error( 'WebGPU adapter not found' );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const optDevice = {
            label               : 'FungiDevice',
            defaultQueue        : { label : 'FungiQueue' },
            requiredFeatures    : [],
            requiredLimits      : {
                maxBindGroups : 4,
            },
        };

        this.device = await this.adapter.requestDevice( optDevice );
        if( !this.device ) throw new Error( 'WebGPU device not found' );

        this.device.lost.then( this.onLost );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.canvas     = canvas;
        this.context    = canvas.getContext( 'webgpu' );
        this.format     = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device      : this.device,
            format      : this.format,
            alphaMode   : 'opaque',     // premultiplied
            colorSpace  : 'srgb',       // display-p3
        });

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        console.log( 'Fungi.WebGPU Ready' );
        return this;
    }

    dispose(){ this.device.destroy(); }
    onLost = (e)=>{ console.log( 'WebGPU Device is lost', e.message, e.reason ) };
    // #endregion

    // #region BUFFERS    
    deleteBuffer( ref ){ ref.destroy(); }

    createBuffer( data, bufType, dataType=Fungi.FLOAT ){
        let isData  = true;
        let isTyped = true;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const opt   = {
            label               : 'buffer',
            size                : 0,
            usage               : GPUBufferUsage.COPY_DST,
            mappedAtCreation    : false,
        };

        // What type of buffer is it
        switch( bufType ){
            case Fungi.VERTEX:  opt.usage |= GPUBufferUsage.VERTEX; break;
            case Fungi.UNIFORM: opt.usage |= GPUBufferUsage.UNIFORM; break;
            default:{
                console.error( 'Unknown buffer type', bufType );
                return;
            }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Is Data set or creating a blank buffer
        if( ArrayBuffer.isView( data ) || data instanceof ArrayBuffer ){
            opt.size = data.byteLength;
        }else if( Array.isArray( data ) ){
            opt.size = data.length * Fungi.BYTESIZE[ dataType ];
            isTyped  = false;
        }else if( Number.isInteger( data ) ){
            opt.size = data;
            isData   = false;
        }

        // Buffer size MUST be in multiple of 4s, Add padding as needed
        opt.size = Math.ceil( opt.size / 4 ) * 4;

        // Non-type data can't use writeBuffer, need to use Mapped 
        if( isData && !isTyped ) opt.mappedAtCreation = true;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create, Save info & push data
        const obj = {
            gRef : this.device.createBuffer( opt ),
            size : opt.size,
        };

        if( isData ){
            // Typed arrays can use writeBuffer
            if( isTyped ) this.device.queue.writeBuffer( obj.gRef, 0, data );
            else{
                // Non-typed arrays need to use MappedRange
                let tAry;
                switch( dataType ){
                    case Fungi.FLOAT: tAry = new Float32Array( obj.gRef.getMappedRange() ); break;
                }

                tAry.set( data );
                obj.gRef.unmap();
            }
        }

        return obj;
    }
    // #endregion
}