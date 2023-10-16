import Fungi from '../Fungi.js';

export default class PerspectiveCamera{
    // #region MAIN
    fov    = 45;
    aspect = 1;
    near   = 0.01
    far    = 100;

    matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    pos    = [0,0,0];
    rot    = [0,0,0,1];
    scl    = [1,1,1];

    constructor( aspect, fov=45, near=0.01, far=100 ){
        this.aspect = aspect;
        this.fov    = fov;
        this.near   = near;
        this.far    = far;
        this.update();
    }
    // #endregion

    // #region METHOD
    update(){
        const fov = this.fov * Math.PI / 180; // To Radians
        if( Fungi.api.name === 'webgpu' )   perspective01(  this.matrix, fov, this.aspect, this.near, this.far );
        else                                perspectiveN11( this.matrix, fov, this.aspect, this.near, this.far );
    }
    // #endregion
}

// #region HELPER 
// WEBGL NDC are X= -1:1, Y= -1:1, Z= -1:1
// FOV is in RADIANS
// https://glmatrix.net/docs/mat4.js.html#line1508
function perspectiveN11( out, fov, aspect, near, far ){
    const f = 1.0 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if( far != null && far !== Infinity ){
        const nf = 1 / ( near - far );
        out[10]  = ( far + near ) * nf;
        out[14]  = 2 * far * near * nf;
    }else{
        out[10] = -1;
        out[14] = -2 * near;
    }
  }

// WEBGPU NDC are X= -1:1, Y= -1:1, Z= 0:1
// FOV is in RADIANS
// https://github.com/greggman/wgpu-matrix/blob/main/src/mat4-impl.ts#L756
function perspective01( out, fov, aspect, near, far ){  
    const f = Math.tan( Math.PI * 0.5 - 0.5 * fov );

    out[0]  = f / aspect;
    out[1]  = 0;
    out[2]  = 0;
    out[3]  = 0;
  
    out[4]  = 0;
    out[5]  = f;
    out[6]  = 0;
    out[7]  = 0;
  
    out[8]  = 0;
    out[9]  = 0;
    out[11] = -1;
  
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
  
    if( far === Infinity ){
        out[10]  = -1;
        out[14]  = -near;
    }else{
        const nf = 1 / ( near - far );
        out[10]  = far * nf;
        out[14]  = far * near * nf;
    }
}
// #endregion