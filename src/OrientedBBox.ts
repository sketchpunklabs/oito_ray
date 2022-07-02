//#region IMPORT
import type { TVec3, Transform }    from "oito";
import { vec3 }                     from 'oito';
import type Ray                     from './Ray.js';
//#endregion

export class RayObbResult{
    tMin        = 0;        // 0 > 1
    tMax        = 0;        // 0 > 1
    entryAxis   = 0;         // 0 : X, 1 : Y, 2 : Z
    entryNorm   = [0,0,0];   // -1 or 1 , Positive or Negative Axis
    exitAxis    = 0;         // 0 : X, 1 : Y, 2 : Z
    exitNorm    = [0,0,0];   // -1 or 1 , Positive or Negative Axis
}

export class OrientedBBox{
    minBound        = [0,0,0];
    maxBound        = [0,0,0];
    // worldMinBound   = [0,0,0];
    // worldMaxBound   = [0,0,0];
    worldPosition   = [0,0,0];
    orientation : Array< TVec3 > = [
        [1,0,0],
        [0,1,0],
        [0,0,1],
    ];

    constructor( min ?: TVec3, max ?: TVec3 ){
        if( min && max ) this.setBounds( min, max );
    }

    get min(): TVec3{ return this.minBound; }
    set min( v: TVec3 ){ vec3.copy( v, this.minBound ); }

    get max(): TVec3{ return this.maxBound; }
    set max( v: TVec3 ){ vec3.copy( v, this.maxBound ); }

    setBounds( min: TVec3, max: TVec3 ): this{
        vec3.copy( min, this.minBound );
        vec3.copy( max, this.maxBound );
        // vec3.copy( min, this.worldMinBound );
        // vec3.copy( max, this.worldMaxBound );
        return this;
    }

    applyTransform( tran: Transform ): void{
        // Transform Bounds
        // tran.transformVec3( this.minBound, this.worldMinBound );
        // tran.transformVec3( this.maxBound, this.worldMaxBound );

        // Get Axis Orientation
        vec3.transformQuat( [1,0,0], tran.rot, this.orientation[0] );
        vec3.transformQuat( [0,1,0], tran.rot, this.orientation[1] );
        vec3.transformQuat( [0,0,1], tran.rot, this.orientation[2] );

        // Box Position
        vec3.copy( tran.pos, this.worldPosition );
    }

    rayIntersect( ray: Ray, result ?: RayObbResult ): boolean{
        const rayDelta	= vec3.sub( this.worldPosition, ray.posStart, [0,0,0] ); // Distance between Ray start and Box Position
        let tMin 		= 0;
        let tMax 		= 1000000;
        let minAxis		= 0;    // Which axis hit, X:0, Y:1, Z:2
        let maxAxis     = 0;
        let axis        : TVec3;
        let nomLen      : number;
        let denomLen    : number;
        let tmp         : number; 
        let min         : number;
        let max         : number;

        for( let i=0; i < 3; i++){
            axis        = this.orientation[ i ];
            nomLen		= vec3.dot( axis, rayDelta ); 	    // Get the length of Axis and distance to ray position
            denomLen	= vec3.dot( ray.vecLength, axis );  // Get Length of ray and axis
    
            if( Math.abs( denomLen ) > 0.00001 ){	// Can't divide by Zero
                min = ( nomLen + this.minBound[i] ) / denomLen;
                max = ( nomLen + this.maxBound[i] ) / denomLen;

                // Transformed Bounding Box doesn't work
                // min = ( nomLen + this.worldMinBound[i] ) / denomLen; 
                // max = ( nomLen + this.worldMaxBound[i] ) / denomLen;
    
                if( min > max ){  tmp = min; min = max; max = tmp; }    // Swap
                if( min > tMin ){ tMin = min; minAxis = i; }			// Biggest Min
                if( max < tMax ){ tMax = max; maxAxis = i; }			// Smallest Max
    
                if( tMax < tMin ) return false;
            }else if(
                -nomLen + this.minBound[i] > 0 || 
                -nomLen + this.maxBound[i] < 0 ) return false;  // Are almost parallel check
        }
    
        if( result ){
            result.tMin		= tMin;
            result.tMax		= tMax;

            // Normal directions negate incorrectly at some extreme angles.
            // TODO: Maybe using Dot product & orientation array to help determine
            // the correct sign for the axis
            vec3.copy( this.orientation[ minAxis ], result.entryNorm );
            if( (1 / ray.vecLength[ minAxis ]) >= 0 ) vec3.negate( result.entryNorm );

            vec3.copy( this.orientation[ maxAxis ], result.exitNorm );
            if( (1 / ray.vecLength[ maxAxis ]) < 0 )  vec3.negate( result.exitNorm );
        }
        return true;
    }
}

/*
    b0 --- b1  t0 --- t1
     |     |    |     |
     |     |    |     |
    b3 --- b2  t3 --- t2
    const b0 = [x1,y1,z1]; 
    const b1 = [x2,y1,z1];
    const b2 = [x2,y1,z2];
    const b3 = [x1,y1,z2];
    const t0 = [x1,y2,z1];
    const t1 = [x2,y2,z1];
    const t2 = [x2,y2,z2];
    const t3 = [x1,y2,z2];

    for( let i=0; i < 4; i++ ){
        let ii = (i + 1) % 4;
        Debug.ln.add( pnts[ i ], pnts[ ii ], 0x00ff00 );        // Bottom square
        Debug.ln.add( pnts[ i+4 ], pnts[ ii+4 ], 0x00ff00 );    // Top square
        Debug.ln.add( pnts[ i ], pnts[ i+4 ], 0x00ff00 );       // Sides
    }

setWorldTransform( wt ){
    wt.transformVec( this.localBounds[0], this.worldBounds[0] );
    wt.transformVec( this.localBounds[1], this.worldBounds[1] );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Scaling in the negative direction screws up the min -> max bounds.
    // Check each axis and if the scale is negative, flip the values
    let tmp, i = 0;
    for( i=0; i < 3; i++ ){
        if( wt.scl[i] < 0 ){
            tmp = this.worldBounds[1][i];
            this.worldBounds[1][i] = this.worldBounds[0][i];
            this.worldBounds[0][i] = tmp;
        }
    }

    return this;	
}
*/