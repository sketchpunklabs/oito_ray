
import type { TVec3 }   from 'oito';
import { vec3 }         from 'oito';
import Ray              from '../Ray';

export class RaySphereResult{
    tMin        = 0;        // 0 > 1
    tMax        = 0;        // 0 > 1
    posEntry    = [0,0,0];
    posExit     = [0,0,0];
}

// This function is the better Sphere intersection BUT its for an infinite ray
// So the T value is creates is for the Ray.Dir instead of Ray.vec_len
export function intersectSphere( ray: Ray, origin: TVec3, radius: number, results ?: RaySphereResult ): boolean{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const radiusSq		= radius * radius;
    const rayToCenter	= vec3.sub( origin, ray.posStart, [0,0,0] );		
    const tProj			= vec3.dot( rayToCenter, ray.direction ); 		// Project the length to the center onto the Ray

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Get length of projection point to center and check if its within the sphere
    // Opposite^2 = hyptenuse^2 - adjacent^2
    const oppLenSq = vec3.lenSq( rayToCenter ) - ( tProj * tProj );
    if( oppLenSq > radiusSq ) return false;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if( results ){
        //-----------------------------
        // if a parallel ray right on the radius, exit & entry is the same
        if( oppLenSq == radiusSq ){
            results.tMin = tProj;
            results.tMax = tProj;

            ray.directionAt( tProj, results.posEntry );
            vec3.copy( results.posEntry, results.posExit );
            return true;
        }

        //-----------------------------
        // Separate positions for entry and exit
		const oLen  = Math.sqrt(  radiusSq - oppLenSq ); // Opposite = sqrt( hyptenuse^2 - adjacent^2 )
		const t0    = tProj - oLen;
		const t1    = tProj + oLen;

        // Swap
		if( t1 < t0 ){
            results.tMin = t1; 
            results.tMax = t0; 
        }else{
            results.tMin = t0; 
            results.tMax = t1; 
        }

        ray.directionAt( t0, results.posEntry );
        ray.directionAt( t1, results.posExit );
    }

    return true;
}


/*

		//This function does more math then RayInSphere function, but this function isn't an intersection
		//of an infinite ray, but a segment. The ray object contains both Segment and Direction data.
		//The T values this produces is based on the ray segment and will work with Ray.getPos()
		//http://nic-gamedev.blogspot.com/2011/11/using-vector-mathematics-and-bit-of_09.html
		static segInSphere(ray, pos, radius, out){
			var rayLenSqr		= ray.vec_len.len_sqr(),					// Ray's Length Squared
				rayToSphere		= Vec3.sub(pos, ray.origin),			// Vector length from Sphere Pos to Ray Origin.
				raySphereDot	= Vec3.dot(ray.vec_len, rayToSphere),	// Vector Len . Vector Len of Ray To Sphere
				t				= raySphereDot / rayLenSqr,				// Normalize based on ray length
				ipos 			= ray.getPos(t),						// Closets ray point to Sphere Center
				iSphereLenSqr 	= ipos.len_sqr(pos),					// Length Sqr from Sphere to iPos
				radiusSqr 		= radius * radius;						// r^2

			//......................................
			if(iSphereLenSqr > radiusSqr) return false;
			if(iSphereLenSqr == radiusSqr){
				if(out){ out.min = out.max = t; }
			 	return true;
			}

			//......................................
			if(out){
				//Opposite = sqrt(hyptenuse^2 - adjacent^2)
				var oLen	= Math.sqrt( (radiusSqr - iSphereLenSqr) / rayLenSqr ),
					t0		= t + oLen,
					t1		= t - oLen;
				if( t0 > t1 ){ var tmp = t0; t0 = t1; t1 = tmp; } //Swap
				out.min = t0;
				out.max = t1;
			}
			return true;
		}


intersectSphere( sphere, target ) {

    _vector.subVectors( sphere.center, this.origin );
    const tca = _vector.dot( this.direction );
    const d2 = _vector.dot( _vector ) - tca * tca;
    const radius2 = sphere.radius * sphere.radius;

    if ( d2 > radius2 ) return null;

    const thc = Math.sqrt( radius2 - d2 );

    // t0 = first intersect point - entrance on front of sphere
    const t0 = tca - thc;

    // t1 = second intersect point - exit point on back of sphere
    const t1 = tca + thc;

    // test to see if both t0 and t1 are behind the ray - if so, return null
    if ( t0 < 0 && t1 < 0 ) return null;

    // test to see if t0 is behind the ray:
    // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
    // in order to always return an intersect point that is in front of the ray.
    if ( t0 < 0 ) return this.at( t1, target );

    // else t0 is in front of the ray, so return the first collision point scaled by t0
    return this.at( t0, target );

}

*/