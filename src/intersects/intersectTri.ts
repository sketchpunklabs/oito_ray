import type { TVec3 }   from 'oito';
import { vec3 }         from 'oito';
import Ray              from '../Ray';

// https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/moller-trumbore-ray-triangle-intersection
export default function intersectTri( ray: Ray, v0: TVec3, v1: TVec3, v2: TVec3, out ?: TVec3, cullFace=true ): boolean{
    const v0v1  = vec3.sub( v1, v0, [0,0,0] );
    const v0v2  = vec3.sub( v2, v0, [0,0,0] );
    const pvec 	= vec3.cross( ray.direction, v0v2, [0,0,0] );
    const det   = vec3.dot( v0v1, pvec );

    if( cullFace && det < 0.000001 ) return false;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const idet  = 1 / det;
    const tvec  = vec3.sub( ray.posStart, v0, [0,0,0] );
    const u     = vec3.dot( tvec, pvec ) * idet;

    if( u < 0 || u > 1 ) return false;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const qvec  = vec3.cross( tvec, v0v1, [0,0,0] );
    const v     = vec3.dot( ray.direction, qvec ) * idet;

    if( v < 0 || u+v > 1 ) return false;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if( out ){
        const len = vec3.dot( v0v2, qvec ) * idet;
        ray.directionAt( len, out );
    }

    return true;
}


/*

// Closure version which is more memory efficent, better to use when dealing with large number of
		// triangles. No need to recreate vector objects for each call.
		static ray_tri_closure( cull_face=true ){
			let v0v1 = new Vec3(),
				v0v2 = new Vec3(),
				pvec = new Vec3(),
				tvec = new Vec3(),
				qvec = new Vec3(),
				v, u, det, idet, len;

			return ( ray, v0, v1, v2, out )=>{
				v0v1.from_sub( v1, v0 );
				v0v2.from_sub( v2, v0 );
				pvec.from_cross( ray.dir, v0v2 );
				det = Vec3.dot( v0v1, pvec );

				if( cull_face && det < 0.000001 ) return false;

				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				idet = 1 / det,
				tvec.from_sub( ray.origin, v0 ),
				u = Vec3.dot( tvec, pvec ) * idet;

				if( u < 0 || u > 1 ) return false;

				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				qvec.from_cross( tvec, v0v1 ),
				v = Vec3.dot( ray.dir, qvec ) * idet;

				if( v < 0 || u+v > 1 ) return false;

				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				out = out || new Vec3();
				len = Vec3.dot( v0v2, qvec ) * idet;

				ray.get_by_len( len, out );
				return true;
			}
		}

----------------------------------------------------

Ray.pointInTriangle = pointInTriangle;
function pointInTriangle(p, a, b, c) {
    c.vsub(a,v0);
    b.vsub(a,v1);
    p.vsub(a,v2);
 
    var dot00 = v0.dot( v0 );
    var dot01 = v0.dot( v1 );
    var dot02 = v0.dot( v2 );
    var dot11 = v1.dot( v1 );
    var dot12 = v1.dot( v2 );
 
    var u,v;
 
    return  ( (u = dot11 * dot02 - dot01 * dot12) >= 0 ) &&
            ( (v = dot00 * dot12 - dot01 * dot02) >= 0 ) &&
            ( u + v < ( dot00 * dot11 - dot01 * dot01 ) );
}
----------------------------------------------------

bool PointInTriangle(Vector3 p, Vector3 tp1, Vector3 tp2, Vector3 tp3 )
{
bool a = InternalSide(p,tp1,tp2,tp3);
bool b = InternalSide(p,tp2,tp1,tp3);
bool c = InternalSide(p,tp3,tp1,tp2);
return ( a&&b&&c);
}
bool InternalSide(Vector3 p1, Vector3 p2, Vector3 a, Vector3 b)
{
Vector3 cp1 = (b-a).crossProduct(p1-a);
Vector3 cp2 = (b-a).crossProduct(p2-a);
return (cp1.dot(cp2) >= 0);
}
----------------------------------------------------

intersectTriangle( a, b, c, backfaceCulling, target ) {

		// Compute the offset origin, edges, and normal.

		// from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

		_edge1.subVectors( b, a );
		_edge2.subVectors( c, a );
		_normal.crossVectors( _edge1, _edge2 );

		// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
		// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
		//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
		//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
		//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
		let DdN = this.direction.dot( _normal );
		let sign;

		if ( DdN > 0 ) {

			if ( backfaceCulling ) return null;
			sign = 1;

		} else if ( DdN < 0 ) {

			sign = - 1;
			DdN = - DdN;

		} else {

			return null;

		}

		_diff.subVectors( this.origin, a );
		const DdQxE2 = sign * this.direction.dot( _edge2.crossVectors( _diff, _edge2 ) );

		// b1 < 0, no intersection
		if ( DdQxE2 < 0 ) {

			return null;

		}

		const DdE1xQ = sign * this.direction.dot( _edge1.cross( _diff ) );

		// b2 < 0, no intersection
		if ( DdE1xQ < 0 ) {

			return null;

		}

		// b1+b2 > 1, no intersection
		if ( DdQxE2 + DdE1xQ > DdN ) {

			return null;

		}

		// Line intersects triangle, check if ray does.
		const QdN = - sign * _diff.dot( _normal );

		// t < 0, no intersection
		if ( QdN < 0 ) {

			return null;

		}

		// Ray intersects triangle.
		return this.at( QdN / DdN, target );

	}

*/