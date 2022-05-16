import type { TVec3 }   from "oito";
import { vec3 }         from "oito";
import Ray              from "../Ray";

/** T returned is scale to vector length, not direction */
export default function intersectPlane( ray:Ray, planePos: TVec3, planeNorm: TVec3 ) : number | null {
    // ((planePos - rayOrigin) dot planeNorm) / ( rayVecLen dot planeNorm )
    // pos = t * rayVecLen + rayOrigin;
    const denom = vec3.dot( ray.vecLength, planeNorm );           // Dot product of ray Length and plane normal
    if( denom <= 0.000001 && denom >= -0.000001 ) return null;  // abs(denom) < epsilon, using && instead to not perform absolute.

    const t = vec3.dot( vec3.sub( planePos, ray.posStart, [0,0,0] ), planeNorm ) / denom;
    return ( t >= 0 )? t : null;
}