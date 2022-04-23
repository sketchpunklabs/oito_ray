import type { TVec3 }   from "oito";
import { vec3 }         from "oito";
import Ray              from "../Ray";


    /** Returns [ T of Segment, T of RayLen ] */
export default function nearSegment( ray: Ray, p0: TVec3, p1: TVec3 ) : Array<number> | null{
    // http://geomalgorithms.com/a07-_distance.html
    // const u = Vec3.sub( p1, p0 ),
    //         v = this.vecLen.clone(),
    //         w = Vec3.sub( p0, this.origin ),
    //         a = Vec3.dot( u, u ), // always >= 0
    //         b = Vec3.dot( u, v ),
    //         c = Vec3.dot( v, v ), // always >= 0
    //         d = Vec3.dot( u, w ),
    //         e = Vec3.dot( v, w ),
    //         D = a * c - b * b;    // always >= 0
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

    return ( tU < 0 || tU > 1 || tV < 0 || tV > 1) ?
        null : [ tU, tV ];

    // Segment Position : u.scale( tU ).add( p0 )
    // Ray Position :     v.scale( tV ).add( this.origin ) ];
}