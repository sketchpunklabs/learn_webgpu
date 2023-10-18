import Object3D from './Object3D.js';

// Draw TriangleMesh, Lines, Points?

export default class Renderable extends Object3D{
    geo = null;
    mat = null;

    /*
    - WebGPU, May need to create One UniformBuffer and BindGroup to hold modelMatrix, etc
    */
}