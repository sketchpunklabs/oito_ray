function intersectSphereAABB( pos, radius, bMin, bMax ){
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Closest Point to AABB
    const x = ( pos[0] > bMax[0] )? bMax[0] :
              ( pos[0] < bMin[0] )? bMin[0] : pos[0];

    const y = ( pos[1] > bMax[1] )? bMax[1] :
              ( pos[1] < bMin[1] )? bMin[1] : pos[1];

    const z = ( pos[2] > bMax[2] )? bMax[2] :
              ( pos[2] < bMin[2] )? bMin[2] : pos[2];

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // vec3 length squared
    const sqDist = ( pos[0] - x )**2 +
                   ( pos[1] - y )**2 +
                   ( pos[2] - z )**2;

    return sqDist < radius*radius;
}
