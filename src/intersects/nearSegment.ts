import type { TVec3 }   from "oito";
import { vec3 }         from "oito";
import Ray              from "../Ray";

export class NearSegmentResult{
    segPosition = [0,0,0];
    rayPosition = [0,0,0];
    distanceSq  = 0;
    distance    = 0;
}

/** Returns [ T of Segment, T of RayLen ] */
export function nearSegment( ray: Ray, p0: TVec3, p1: TVec3, results ?: NearSegmentResult ) : Array<number> | null{
    // http://geomalgorithms.com/a07-_distance.html
    const   u = vec3.sub( p1, p0, [0,0,0] ),
            v = ray.vecLength,
            w = vec3.sub( p0, ray.posStart, [0,0,0] ),
            a = vec3.dot( u, u ), // always >= 0
            b = vec3.dot( u, v ),
            c = vec3.dot( v, v ), // always >= 0
            d = vec3.dot( u, w ),
            e = vec3.dot( v, w ),
            D = a * c - b * b;    // always >= 0

    let tU = 0, // T Of Segment 
        tV = 0; // T Of Ray

    // Compute the line parameters of the two closest points
    if( D < 0.000001 ){	            // the lines are almost parallel
        tU = 0.0;
        tV = ( b > c ? d/b : e/c ); // use the largest denominator
    }else{
        tU = ( b*e - c*d ) / D;
        tV = ( a*e - b*d ) / D;
    }


    if( tU < 0 || tU > 1 || tV < 0 || tV > 1 ) return null;
    
    // Segment Position : u.scale( tU ).add( p0 )
    // Ray Position :     v.scale( tV ).add( this.origin ) ];
    if( results ){
        ray.posAt( tV, results.rayPosition );
        vec3.lerp( p0, p1, tU, results.segPosition );
        results.distanceSq = vec3.lenSq( results.segPosition, results.rayPosition );
        results.distance   = Math.sqrt( results.distanceSq );
    }

    return [ tU, tV ];
}