import type { TVec3 }   from 'oito';
import { vec3 }         from 'oito';
import Ray              from '../Ray';
import intersectPlane   from './intersectPlane';

/** T Value is scaled for Vector Length, Not Direction */
export default function intersectCircle( ray: Ray, radius: number, planePos: TVec3, planeNorm: TVec3  ) : number | null{
    const t = intersectPlane( ray, planePos, planeNorm );
    if( t == null ) return null;

    const pnt   = ray.posAt( t );
    const lenSq = vec3.lenSq( pnt, planePos );
    return ( lenSq <= radius*radius )? t : null;
}