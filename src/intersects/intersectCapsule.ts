import type { TVec3 }   from "oito";
import { vec3 }         from "oito";
import Ray              from "../Ray";
import { intersectSphere, RaySphereResult } from "./intersectSphere";

export class RayCapsuleResult{
    pos = [0,0,0];
    t   = 0;
}

export function intersectCapsule( ray: Ray, radius: number, vecStart: TVec3, vecEnd: TVec3, result ?: RayCapsuleResult ): boolean{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const A         = vecStart;
    const B         = vecEnd;
    const radiusSq  = radius * radius;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Start calculating lengths and cross products
    const AB    = vec3.sub( B, A, [0,0,0] );                // Vector Length of Capsule Segment
    const AO    = vec3.sub( ray.posStart, A, [0,0,0] );     // Vector length between start of ray and capsule line
    const AOxAB = vec3.cross( AO, AB, [0,0,0] );            // Perpendicular Vector between Cap Line & delta of Ray Origin & Capsule Line Start
    const VxAB  = vec3.cross( ray.direction, AB, [0,0,0] );	// Perpendicular Vector between Ray Dir & capsule line
    const ab2   = vec3.lenSq( AB );                         // Length Squared of Capsule Line
    const a     = vec3.lenSq( VxAB );                       // Length Squared of Perp Vec Length of Perp Vec of Ray&Cap
    const b		= 2 * vec3.dot( VxAB,AOxAB );
    const c     = vec3.lenSq( AOxAB ) - ( radiusSq * ab2 );
    const d     = b * b - 4 * a * c;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Checking D seems to be related to distance from capsule. If not within radius, D will be under 0
    if( d < 0 ) return false;

    // T is less then 0 then ray goes through both end caps.
    const t = ( -b - Math.sqrt( d ) ) / ( 2 * a );
    if( t < 0 ){
        const pos = ( vec3.lenSq( A, ray.posStart ) < vec3.lenSq( B, ray.posStart ) )? A : B;
        if( result ){
            const sphereResult  = new RaySphereResult();
            const isHit         = intersectSphere( ray, pos, radius, sphereResult );

            if( isHit ){
                result.t = sphereResult.tMin;
                vec3.copy( sphereResult.posEntry, result.pos );
            }
            
            return isHit;
        }else return intersectSphere( ray, pos, radius, result );   
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Limit intersection between the bounds of the cylinder's end caps.
    const iPos          = ray.directionAt( t );
    const iPosLen       = vec3.sub( iPos, A, [0,0,0] );     // Vector Length Between Intersection and Cap line Start
    const tLimit        = vec3.dot( iPosLen, AB ) / ab2;    // Projection of iPos onto Cap Line
    const sphereResult  = ( result )? new RaySphereResult() : undefined;   
    let isHit           = false

     // Hit Cylinder part
    if( tLimit >= 0 && tLimit <= 1 ){
        if( result ){
            result.t = t;
            vec3.copy( iPos, result.pos );
        }
        return true;
    
    // Check Sphere Caps
    }else if( tLimit < 0 )  isHit = intersectSphere( ray, A, radius, sphereResult ); 
    else  if( tLimit > 1 )  isHit = intersectSphere( ray, B, radius, sphereResult ); 

    // Save Results if requested
    if( isHit && result && sphereResult ){
        result.t = t;
        vec3.copy( sphereResult.posEntry, result.pos );
    }

    return isHit;
}