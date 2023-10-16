export default class Object3D{
    // #region MAIN
    matrix      = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); // Matrix from World Transform
    world       = { pos:[0,0,0], rot:[0,0,0,1], scl:[1,1,1] }; // World Transform
    pos         = [0,0,0];      // Local Transform
    rot         = [0,0,0,1];
    scl         = [1,1,1];
    isDirty     = false;        // Does the World Transform need to be updated
    
    children    = [];           // Child Objects
    parent      = null;         // Reference to parent object
    // #endregion

    // #region PARENT-CHILD RELATIONSHIP
    addChild( obj ){
        this.children.push( obj.unparent() );
        obj.parent = this;
        return this;
    }

    removeChild( obj ){
        const idx = this.children.indexOf( obj );
        if( idx != -1 ){
            this.children.splice( idx, 1 );
            obj.parent = null;
        }
        return this;
    }

    unparent(){
        if( this.parent ) this.parent.removeChild( this );
        return this;
    }
    // #endregion
}