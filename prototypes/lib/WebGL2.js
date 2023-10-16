import Fungi from './Fungi.js';

export default class WebGL2{
    // #region MAIN
    name    = 'webgl2';
    canvas  = null;
    context = null;

    async init( canvas, props={} ){
        this.canvas  = canvas;
        this.context = canvas.getContext( 'webgl2', { alpha: false } ); // { antialias: false, xrCompatible:true, premultipliedAlpha: true } );
		if( !this.context ) throw new Error( 'WebGL context is not available.' );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Setup some defaults
        const c = this.context;
        c.cullFace( c.BACK );           // Back is also default
        c.frontFace( c.CCW );           // Dont really need to set it, its ccw by default.
        c.enable( c.DEPTH_TEST );       // Shouldn't use this, use something else to add depth detection
        c.enable( c.CULL_FACE );        // Cull back face, so only show triangles that are created clockwise
        c.depthFunc( c.LEQUAL );        // Near things obscure far things
        c.blendFunc( c.SRC_ALPHA,       // Setup default alpha blending
            c.ONE_MINUS_SRC_ALPHA) ;

        canvas.addEventListener( 'webglcontextlost', this.onLost, { once:true } );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        console.log( 'Fungi.WebGL2 Ready' );
        return this;
    }

    onLost = (e)=>{ console.log( 'WebGL context is lost', e ) };
    // #endregion

    // #region CONSTANTS
    // ARRAY 	= 34962;
    // ELEMENT	= 34963;
    // UNIFORM	= 35345;
    // STATIC	= 35044;
    // DYNAMIC	= 35048;
    // USHORT	= 5123;
    // UINT	= 5125;
    // FLOAT	= 5126;

    // #endregion

    // #region BUFFERS
    // https://github.com/sketchpunk/temp/blob/master/Fungi_v5_5/fungi/core/Buffer.js
    
    // #region BUFFERS
    deleteBuffer( ref ){ this.context.deleteBuffer( ref ); }

    createBuffer( data, bufType, dataType=Fungi.FLOAT, isStatic=true ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // What type of buffer is it
        let bType;
        switch( bufType ){
            case Fungi.VERTEX   : bType = WebGLRenderingContext.ARRAY_BUFFER; break;
            case Fungi.ELEMENT  : bType = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER; break;
            case Fungi.UNIFORM  : bType = WebGLRenderingContext.UNIFORM_BUFFER; break;
            default:{
                console.log( 'UNKNOWN BUFFER TYPE', bufType );
                break;
            }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Is Data set or creating a blank buffer
        let content;
        if( ArrayBuffer.isView( data ) ){
            content = data;
        }else if( Array.isArray( data ) ){
            // Content MUST be a TypedArray, create one now
            switch( dataType ){
                case Fungi.FLOAT : content = new Float32Array( data ); break;
                default:{
                    console.log( 'UNKNOWN DATA TYPE FOR TypeARRAY CONVERSION' );
                    break;
                }
            }
        } // }else if( Number.isInteger( data ) ){
        

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Buffer and push initial data if available
        const usage = ( isStatic )
            ? WebGLRenderingContext.STATIC_DRAW
            : WebGLRenderingContext.DYNAMIC_DRAW
        
        const obj = {
            gRef : this.context.createBuffer(),
            size : ( content )? content.byteLength : data,
        }
        
        this.context.bindBuffer( bType, obj.gRef );     // Set it as active

        if( content )   this.context.bufferData( bType, content, usage );   // Fill Buffer
        else            this.context.bufferData( bType, data, usage );      // Empty Buffer

        this.context.bindBuffer( bType, null );         // Deactivate
        
        return obj;
    }
    // #endregion
}

/*
    case WebGLRenderingContext.BYTE: return `s${norm}8${x}`;
    case WebGLRenderingContext.UNSIGNED_BYTE: return `u${norm}8${x}`;
    case WebGLRenderingContext.SHORT: return `s${norm}16${x}`;
    case WebGLRenderingContext.UNSIGNED_SHORT: return `u${norm}16${x}`;
    case WebGLRenderingContext.UNSIGNED_INT: return `u${norm}32${x}`;
    case WebGLRenderingContext.FLOAT: return `float32${x}`;

    case WebGLRenderingContext.TRIANGLES: return 'triangle-list';
    case WebGLRenderingContext.TRIANGLE_STRIP: return 'triangle-strip';
    case WebGLRenderingContext.LINES: return 'line-list';
    case WebGLRenderingContext.LINE_STRIP: return 'line-strip';
    case WebGLRenderingContext.POINTS: return 'point-list';


update_data( buf, type_ary ){
    let b_len = type_ary.byteLength;
    this.gl.ctx.bindBuffer( buf.type, buf.id );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if( type_ary instanceof Float32Array ) 		buf.data_type = FLOAT;
    else if( type_ary instanceof Uint16Array ) 	buf.data_type = USHORT;
    else if( type_ary instanceof Uint32Array )	buf.data_type = UINT;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // if the data size is of capacity on the gpu, can set it up as sub data.
    if( b_len <= buf.capacity ) this.gl.ctx.bufferSubData( buf.type, 0, type_ary, 0, null );
    else{
        buf.capacity = b_len;
        // if( this.byte_len > 0) gl.ctx.bufferData( this.type, null, gl.ctx.DYNAMIC_DRAW ); // Clean up previus data
        this.gl.ctx.bufferData( buf.type, type_ary, buf.usage );
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    this.gl.ctx.bindBuffer( buf.type, null ); // unbind buffer
    buf.byte_len = b_len;
}
*/