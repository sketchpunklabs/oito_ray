import * as THREE from 'three';

export function from3JSScreenProjection( ray, xMouse, yMouse, App ){
    const size      = new THREE.Vector2();
    const proj      = App.camera.projectionMatrix.toArray();    // Need Projection Matrix
    const camWorld  = App.camera.matrixWorld.toArray();         // World Space Transform of Camera
    App.renderer.getSize( size );                               // Need Size of Canvas

    // Setup Ray
    ray.fromScreenProjection( xMouse, yMouse, size.x, size.y, proj, camWorld );
    return ray;
}