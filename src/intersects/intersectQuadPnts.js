export default function intersectQuadPnts( ray, v0, v1, v2, v3, cullBackface=true ){
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Figure out the normal direction of the quad
    // To find normal direction, take 3 sequential corners, get two vector 
    // lengths then cross apply in counter-clockwise order
    const a     = vec3_sub( [0,0,0], v0, v1 );
    const b     = vec3_sub( [0,0,0], v2, v1 );
    const norm  = vec3_cross( [0,0,0], b, a );
    vec3_norm( norm, norm );

    if( cullBackface && vec3_dot( ray.direction, norm ) > 0 ) return null;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Determine if the ray intersects the same plane as the quad.
    const denom = vec3_dot( ray.vecLength, norm );    // Dot product of ray Length and plane normal
    if( Math.abs( denom ) <= 0.000001 ) return null;

    const t = vec3_dot( vec3_sub( [0,0,0], v1, ray.posStart ), norm ) / denom;
    if( t < 0 ) return null;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // First Diagonal Test - Projecting intersection point onto Left Side of Quad
    const ip    = ray.posAt( t );
    const dm    = vec3_sub( [0,0,0], ip, v1 );
    const u     = vec3_dot( dm, a );
    const v     = vec3_dot( dm, b );

    return (
        u >= 0.0 && u <= vec3_dot( a, a )
        &&
        v >= 0.0 && v <= vec3_dot( b, b )
    )? t : null;
}