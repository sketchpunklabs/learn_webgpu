import Fungi from '../Fungi.js';

/*
const u = new UniformBuffer( [
    { name:'v0', type:'vec2f' },
    { name:'v1', type:'f32' },
    { name:'v2', type:'vec3f' }
] );

u.view.v1 = 2;
u.view.v0 = [3,4];
u.view.v2 = [9,8,7];

console.log( new Float32Array( u.localBuf ) );
*/

export default class UniformBuffer{
    // #region MAIN
    gRef        = null;             // GPU Reference
    type        = Fungi.UNIFORM;    // What Type of buffer is it
    view        = {};               // User access to partitions of localBuf
    localBuf    = null;             // Byte Array

    constructor( json=null ){
        if( json ) this.fromJson( json );
    }  
    // #endregion

    // #region SETTERS
    fromJson( json ){
        const info    = calcSTD140( json );
        const aryBuf  = new ArrayBuffer( info.byteSize );
        this.localBuf = aryBuf;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let v;
        for( let i=0; i < json.length; i++ ){
            if( this.view[ json[i].name ] ){ console.error( 'Uniform view name duplicated: ', json[i].name ); return this; }

            // Build View Property
            if( info.view[i].tlen === 1 )
                this._singeValueView(  json[i].name, info.view[i] );
            else
                this._vectorValueView( json[i].name, info.view[i] );

            // Set Default Values
            if( json[i].default !== undefined ){
                this.view[ json[i].name ] = json[i].default;
            }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._buildBuffer();
        return this;
    }
    // #endregion

    // #region METHODS
    clone(){}

    update(){}

    dispose(){
        if( this.gRef ){ Fungi.api.deleteBuffer( this.gRef ); this.gRef = null; }
    }
    // #endregion

    // #region PRIVATE METHODS
    _buildBuffer(){
        if( !this.gRef ){
            this.gRef = Fungi.api.createBuffer( this.localBuf, this.type, 0, false ).gRef;
        }
    }
    
    _singeValueView( name, view ){
        const buf = new view.type( this.localBuf, view.offset, view.tlen );
        Object.defineProperty( this.view, name, {
            get(){ return buf[0]; },
            set( value ){ buf[0] = value; },
        });
    }

    _vectorValueView( name, view ){
        const buf = new view.type( this.localBuf, view.offset, view.tlen );
        Object.defineProperty( this.view, name, {
            get(){ return buf; },
            set( value ){ buf.set( value ); },
        });
    }
    // #endregion
}


// #region HELPERS
// Size, needed Space, byte per comp, typearray

const TYPES = {
    f32     : [  4,  4, 4, Float32Array ],
    i32     : [  4,  4, 4, Int32Array ],
    u32     : [  4,  4, 4, Uint32Array ],
    vec2f   : [  8,  8, 4, Float32Array ],
    vec3f   : [ 12, 16, 4, Float32Array ],
    vec4f   : [ 16, 16, 4, Float32Array ],
    mat4x4f : [ 64, 64, 4, Float32Array ],
}

const TYPES2 = [
    [  4,  4, 4, Float32Array ], // f32     : 
    [  4,  4, 4, Int32Array ], //i32     : 
    [  4,  4, 4, Uint32Array ], //u32     : 
    [  8,  8, 4, Float32Array ], //vec2f   : 
    [ 12, 16, 4, Float32Array ], //vec2f   : 
    [ 16, 16, 4, Float32Array ], //vec4f   : 
    [ 64, 64, 4, Float32Array ], //mat4x4f : 
]

function calcSTD140( list ){
    let space  = 16;
    let offset = 0;
    let size;
    let pad, f;

    const out = [];

    for( const itm of list ){
        // size = TYPES[ itm.type ];   // Get size & alignment
        size = TYPES2[ itm.type ];  
        
        f    = space / size[1];     // Get fractional placement on the 16 byte chunk
        f   -= Math.floor( f );     

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Fractional Alignment
        // cases like f32+vec2f+f32, Padding needed between first f32 and vec2f
        if( f !== 0 ){
            // console.log( "FRACTIONAL", f, space, size[1], Math.abs( size[1] - ( 16-space ) ) );
            pad     = Math.abs( size[1] - ( 16 - space ) );
            space   = Math.max( 0, space - pad );
            offset += pad;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Alignment
        if( space < size[1] ){
            offset += space;
            space   = 16;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        out.push( {
            offset  : offset,
            bytes   : size[0],
            tlen    : size[0] / size[2], // Type Length
            type    : size[3],
        } )

        space  = Math.max( 0, space - size[0] );    // Remove space used by this var
        offset += size[0];                          // Move starting byte for next var
    }

    return {
        byteSize : Math.ceil( offset / 16 ) * 16,
        view     : out,
    };
}

// calcUniform( [
//     { name:'v0', type:'vec3f' },    
//     { name:'v1', type:'f32' },
// ] )

// calcUniform( [
//     { name:'v1', type:'f32' },
//     { name:'v1', type:'f32' },
//     { name:'v0', type:'vec3f' },
// ] );

// calcUniform( [
//     { name:'v1', type:'f32' },
//     { name:'v1', type:'f32' },
//     { name:'v1', type:'vec2f' },
// ] );

// calcUniform( [
//     { name:'v1', type:'f32' },
//     { name:'v1', type:'f32' },
//     { name:'v1', type:'vec2f' },
//     { name:'v1', type:'vec2f' },
// ] );

// calcUniform( [
//     { name:'v1', type:'vec2f' },
//     { name:'v1', type:'f32' },
//     { name:'v1', type:'vec3f' },
// ] );
// #endregion