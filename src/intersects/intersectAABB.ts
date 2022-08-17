import type { TVec3 }   from "oito";
import { vec3 }         from "oito";
import Ray              from "../Ray";

// https://gist.github.com/DomNomNom/46bb1ce47f68d255fd5d
/** returns the ray LENGTH, use directionAt() */
export default function intersectAABB( ray:Ray, min: TVec3, max: TVec3 ): [number, number] | null {
    const tMin = vec3.sub( min, ray.posStart, [0,0,0] );
    const tMax = vec3.sub( max, ray.posStart, [0,0,0] );
    vec3.div( tMin, ray.direction );
    vec3.div( tMax, ray.direction );

    const t1    = vec3.min( tMin, tMax, [0,0,0] );
    const t2    = vec3.max( tMin, tMax, [0,0,0] );
    const tNear = Math.max( Math.max( t1[0], t1[1] ), t1[2] );
    const tFar  = Math.min( Math.min( t2[0], t2[1] ), t2[2] );

    return ( tNear < tFar )? [tNear, tFar] : null;
}