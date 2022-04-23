import type { TVec3 }   from 'oito';
import { vec3 }         from 'oito';
import Ray              from '../Ray';
import intersectPlane   from './intersectPlane';

// TODO : Need to handle precalc the 4 points of a quad AND handle scale, rotation and translation
export default function intersectQuad( ray: Ray, centerPos: TVec3, w: number, h:number ) : number | null{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //Figure out the 4 points in the quad based on center position and known width/height;
    //Note: If the quad has been rotated or scaled, need to apply those to the 4 points as well.
    const   v0 = vec3.add( centerPos, [-w,  h, 0], [0,0,0] ),
            v1 = vec3.add( centerPos, [-w, -h, 0], [0,0,0] ),
            v2 = vec3.add( centerPos, [ w, -h, 0], [0,0,0] );
            //v3 = Vec3.add( centerPos, [ w,  h, 0] );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Figure out the normal direction of the quad
    // To find normal direction, take 3 sequential corners, get two vector 
    // lengths then cross apply in counter-clockwise order
    const a     = vec3.sub( v0, v1, [0,0,0] );
    const b     = vec3.sub( v2, v1, [0,0,0] );
    const norm  = vec3.norm( vec3.cross( b, a, [0,0,0] ) );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Determine if the ray intersects the same plane of the quad.
    const t = intersectPlane( ray, centerPos, norm );
    if( t == null ) return null;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // First Diagonal Test - Projecting intersection point onto Left Side of Quad
    const ip    = ray.posAt( t );
    let   tt    = 0;

    vec3.sub( ip, v0, a );    // Top Corner to Plane Intersection Point
    vec3.sub( v1, v0, b );    // Left Edge
    tt = vec3.dot( a, b ) / vec3.lenSq( b ); // PROJECTION : |a|.|b| / |b|.|b| 
    
    if( tt < 0 || tt > 1 ) return null;

    // Second Diagonal Test - Projecting intersection point onto bottom Side of Quad
    vec3.sub( ip, v1, a );    // Bottom Corner to Plane Intersection Point
    vec3.sub( v2, v1, b );    // Bottom Edge
    tt = vec3.dot( a, b ) / vec3.lenSq( b );

    if( tt < 0 || tt > 1 ) return null;

    return t;
}