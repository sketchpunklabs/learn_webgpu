export default class Fungi{
    // #region Values
    static api          = null;
    static clearColor   = [0.2,0.2,0.2,1.0];
    static events       = new EventTarget();
    // #endregion

    // #region CONSTANTS
    static BYTESIZE = [4,2,4];
    static FLOAT    = 0;
    static UINT16   = 1;
    static UINT32   = 2;

    static VERTEX   = 0;
    static UNIFORM  = 1;
    static ELEMENT  = 2;
    // #endregion

    // #region API Loaders
    static async useWebGPU( canvas, props={} ){
        const mod = await import( './WebGPU.js' );
        return !!( this.api = await new mod.default().init( canvas, props ) );
    }

    static async useWebGL2( canvas, props={} ){
        const mod = await import( './WebGL2.js' );
        return !!( this.api = await new mod.default().init( canvas, props ) );
    }

    static ready( props={} ){
        props = Object.assign( {
            canvas  : '',
            api     : 'webgpu',
        }, props );

        if( props.canvas === '' )                       props.canvas = document.querySelector( 'canvas' );
        else if( typeof props.canvas === 'string' )     props.canvas = document.getElementById( props.canvas );

        return Promise.all([
            new Promise( ( resolve, reject ) => window.addEventListener( 'load', resolve, { once:true } ) ),
            ( props.api === 'webgpu' )
                ? Fungi.useWebGPU( props.canvas, props )
                : Fungi.useWebGL2( props.canvas, props )
        ]);
    }
    // #endregion

    // #region METHODS
    static setCanvasSize( w, h ){
        const dpr       = window.devicePixelRatio || 1;

        // Internally set with the size
        // Need to round, you can't have a fraction of a pixel, can you?
        this.api.canvas.width         = Math.round( w * dpr );
        this.api.canvas.height        = Math.round( h * dpr );

        // Externally set with the size
        this.api.canvas.style.width   = w + 'px';
        this.api.canvas.style.height  = h + 'px';
    }
    // #endregion

    // #region EVENTS
    on( evtName, fn ){ this.events.addEventListener( evtName, fn ); return this; }
    off( evtName, fn ){ this.events.removeEventListener( evtName, fn ); return this; }
    once( evtName, fn ){ this.events.addEventListener( evtName, fn, { once:true } );  return this; }
    emit( evtName, data=null ){
        this.events.dispatchEvent( ( !data )
            ? new Event( evtName, { bubbles:false, cancelable:true, composed:false } ) 
            : new CustomEvent( evtName, { detail:data, bubbles:false, cancelable:true, composed:false } )
        );
        return this;
    }
    // #endregion
}