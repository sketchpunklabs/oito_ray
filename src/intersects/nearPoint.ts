import type { TVec3 }   from "oito";
import { vec3 }         from "oito";
import Ray              from "../Ray";

export default function nearPoint( ray: Ray, p: TVec3, distLimit=0.1 ) : number | null{
    /* closest_point_to_line3D
    let dx	= bx - ax,
        dy	= by - ay,
        dz	= bz - az,
        t	= ( (px-ax)*dx + (py-ay)*dy + (pz-az)*dz ) / ( dx*dx + dy*dy + dz*dz ) ; */
    const v = vec3.sub( p, ray.posStart, [0,0,0] );
    vec3.mul( v, ray.vecLength );

    const t = ( v[0] + v[1] + v[2] ) / vec3.lenSq( ray.vecLength );

    if( t < 0 || t > 1 ) return null;                   // Over / Under shoots the Ray Segment
    const lenSqr = vec3.lenSq( ray.posAt( t, v ), p );  // Distance from point to nearest point on ray.

    return ( lenSqr <= (distLimit*distLimit) )? t : null;
}