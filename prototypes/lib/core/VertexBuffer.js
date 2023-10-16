import Fungi from '../Fungi.js';

export default class VertexBuffer{
    gRef        = null;         // GPU Reference
    loc         = 0;            // Attribute Location
    type        = Fungi.VERTEX; // What Type of buffer is it
    dataType    = Fungi.FLOAT;  // Data Type
    components  = 3;            // How many components, 3 If Vec3, etc
    compacity   = 0;            // Total byte size of buffer
    size        = 0;            // Currently used bytes
    isStatic    = true;         // WebGL2: Is the buffer going to be updated often

    constructor( dType=Fungi.FLOAT, comLen=3, isStatic=true ){
        this.dataType   = dType
        this.components = comLen;
        this.isStatic   = isStatic;
    }

    // TODO: Allow rewriting buffers or replacing with bigger ones
    set( data ){
        if( !this.gRef ){
            const result = Fungi.api.createBuffer( data, this.type, this.dataType, this.isStatic );
            this.gRef       = result.gRef;
            this.compacity  = result.size;
            this.size       = result.size;
        }
        return this;
    }

    dispose(){
        if( this.gRef ){
            Fungi.api.deleteBuffer( this.gRef );
            this.gRef = null;
        }
    }
}
