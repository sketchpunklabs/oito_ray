function closestPointAABB( pos, bMin, bMax, out=[0,0,0] ){
    out[0] = ( pos[0] > bMax[0] )? bMax[0] :
             ( pos[0] < bMin[0] )? bMin[0] : pos[0];

    out[1] = ( pos[1] > bMax[1] )? bMax[1] :
             ( pos[1] < bMin[1] )? bMin[1] : pos[1];

    out[2] = ( pos[2] > bMax[2] )? bMax[2] :
             ( pos[2] < bMin[2] )? bMin[2] : pos[2];

    return out;
}