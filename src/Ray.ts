import type { TVec3, TMat4 }    from 'oito';
import { vec3, mat4 }           from 'oito';

export default class Ray{
    posStart    = [0,0,0];  // Origin
    posEnd      = [0,0,0];
    direction   = [0,0,0];  // Direction from Start to End
    vecLength   = [0,0,0];  // Vector Length between start to end

    //#region GETTERS / SETTERS
    /** Get position of the ray from T Scale of VecLen */
    posAt( t: number, out ?: TVec3 ) : TVec3 {
        // RayVecLen * t + RayOrigin
        // also works lerp( RayOrigin, RayEnd, t )

        out      = out || [0,0,0];
        out[ 0 ] = this.vecLength[ 0 ] * t + this.posStart[ 0 ];
        out[ 1 ] = this.vecLength[ 1 ] * t + this.posStart[ 1 ];
        out[ 2 ] = this.vecLength[ 2 ] * t + this.posStart[ 2 ];
        return out;
    }

    /** Get position of the ray from distance from origin */
    directionAt( len: number, out ?: TVec3 ) : TVec3 {
        out      = out || [0,0,0];
        out[ 0 ] = this.direction[ 0 ] * len + this.posStart[ 0 ];
        out[ 1 ] = this.direction[ 1 ] * len + this.posStart[ 1 ];
        out[ 2 ] = this.direction[ 2 ] * len + this.posStart[ 2 ];        
        return out;
    }

    fromScreenProjection( x: number, y:number, w:number, h:number, projMatrix: TMat4, camMatrix: TMat4 ) : Ray{
        // http://antongerdelan.net/opengl/raycasting.html
		// Normalize Device Coordinate
        const nx  = x / w * 2 - 1;
        const ny  = 1 - y / h * 2;

        // inverseWorldMatrix = invert( ProjectionMatrix * ViewMatrix ) OR
		// inverseWorldMatrix = localMatrix * invert( ProjectionMatrix ) 
        const invMatrix = mat4.invert( projMatrix )
        mat4.mul( camMatrix, invMatrix, invMatrix );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // https://stackoverflow.com/questions/20140711/picking-in-3d-with-ray-tracing-using-ninevehgl-or-opengl-i-phone/20143963#20143963
        // Clip Cords would be [nx,ny,-1,1];
        const clipNear   = [ nx, ny, -1, 1 ];
        const clipFar    = [ nx, ny, 1, 1 ];

        // using 4d Homogeneous Clip Coordinates
        mat4.transformVec4( invMatrix, clipNear );
        mat4.transformVec4( invMatrix, clipFar );

        // Normalize by using W component
        for( let i=0; i < 3; i++){
            clipNear[ i ]	/= clipNear[ 3 ];
            clipFar [ i ] 	/= clipFar [ 3 ];
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        vec3.copy( clipNear, this.posStart );           // Starting Point of the Ray
        vec3.copy( clipFar, this.posEnd );              // The absolute end of the ray
        vec3.sub( clipFar, clipNear, this.vecLength );  // Vector Length
        vec3.norm( this.vecLength, this.direction );    // Normalized Vector Length
        return this;
    }

    fromEndPoints( a: TVec3, b: TVec3 ): this{
        vec3.copy( a, this.posStart );                  // Starting Point of the Ray
        vec3.copy( b, this.posEnd );                    // The absolute end of the ray
        vec3.sub( b, a, this.vecLength );               // Vector Length
        vec3.norm( this.vecLength, this.direction );    // Normalized Vector Length
        return this;
    }
    //#endregion /////////////////////////////////////////////////////////////////
}