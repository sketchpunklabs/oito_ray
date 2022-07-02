//#region IMPORT
import type { TVec3 }   from "oito";
import { vec3 }         from 'oito';

import type Ray     from './Ray.js';
//#endregion

const AXIS = [ [1,0,0], [0,1,0], [0,0,1] ];

export class RayBBoxResult{
    tMin        = 0;        // 0 > 1
    tMax        = 0;        // 0 > 1

    entryAxis   = 0;         // 0 : X, 1 : Y, 2 : Z
    entryNorm   = [0,0,0];   // -1 or 1 , Positive or Negative Axis
    exitAxis    = 0;         // 0 : X, 1 : Y, 2 : Z
    exitNorm    = [0,0,0];   // -1 or 1 , Positive or Negative Axis
}


// Optimization trick from ScratchAPixel
export class AABBRay{
    vecLengthInv    = [ 0, 0, 0 ];  // Inverted Vector Length
    direction       = [ 0, 0, 0 ];  // Direction Indices, 0 or 1

    constructor( ray ?: Ray ){
        if( ray ) this.fromRay( ray );
    }

    fromRay( ray: Ray ): void{
        ///this.vecLenInv.fromInvert( ray.vecLength );
        vec3.invert( ray.vecLength, this.vecLengthInv );

        // Determine which bound will result in tMin so there will be no need to test if tMax < tMin to swop.
        this.direction[ 0 ] = ( this.vecLengthInv[0] < 0 )? 1 : 0;
        this.direction[ 1 ] = ( this.vecLengthInv[1] < 0 )? 1 : 0;
        this.direction[ 2 ] = ( this.vecLengthInv[2] < 0 )? 1 : 0;
    }
}


export class BoundingBox{
    bounds = [ [0,0,0], [0,0,0] ];
    constructor( min ?: TVec3, max ?: TVec3 ){
        if( min && max ) this.setBounds( min, max );
    }

    get min(): TVec3{ return this.bounds[ 0 ]; }
    set min( v: TVec3 ){
        //this.bounds[ 0 ].copy( v );
        vec3.copy( v, this.bounds[ 0 ] );
    }

    get max(): TVec3{ return this.bounds[ 1 ]; }
    set max( v: TVec3 ){ 
        //this.bounds[ 1 ].copy( v );
        vec3.copy( v, this.bounds[ 1 ] );
    }

    setBounds( min: TVec3, max: TVec3 ): this{
        vec3.copy( min, this.bounds[ 0 ] );
        vec3.copy( max, this.bounds[ 1 ] );
        return this;
    }

//     grow( v ){
//         vec3_min( this.min, this.min, v );
//         vec3_max( this.max, this.max, v );
//     }

//     area(){
//         const s = vec3_sub( [0,0,0], this.max, this.min );
//         return s[0]*s[1] + s[1]*s[2] + s[2]*s[0];
//     }

    /*
    //https://tavianator.com/2011/ray_box.html
    fastIntersect( ray, bmin, bmax ){
        // Modified to use invDirection to remove any divisions
        const tx1  = ( bmin[0] - ray.posStart[0] ) * ray.invDirection[0];
        const tx2  = ( bmax[0] - ray.posStart[0] ) * ray.invDirection[0];
        const tmin = Math.min( tx1, tx2 );
        const tmax = Math.max( tx1, tx2 );
        
        const ty1  = ( bmin[1] - ray.posStart[1] ) * ray.invDirection[1];
        const ty2  = ( bmax[1] - ray.posStart[1] ) * ray.invDirection[1];
        
        tmin       = Math.max( tmin, Math.min( ty1, ty2 ) ), 
        tmax       = Math.min( tmax, Math.max( ty1, ty2 ) );
        
        const tz1  = ( bmin[2] - ray.posStart[2] ) * ray.invDirection[2];
        const tz2  = ( bmax[2] - ray.posStart[2] ) * ray.invDirection[2];

        tmin       = Math.max( tmin, Math.min( tz1, tz2 ) ), 
        tmax       = Math.min( tmax, Math.max( tz1, tz2 ) );
        
        // if tmin < 0, origin is inside the box
        return (tmax >= tmin && tmax > 0)? tmin : Infinity;
    }
    */

    /** Optimize version that uses AABBRay  */
    rayIntersects( ray: Ray, raybox: AABBRay, results ?: RayBBoxResult ): boolean{
        let tMin, tMax, min, max, minAxis = 0, maxAxis = 0;
        const bounds = this.bounds;

        //X Axis ---------------------------
        tMin = ( bounds[	raybox.direction[0]] [0] - ray.posStart[0] ) * raybox.vecLengthInv[0];
        tMax = ( bounds[1 -	raybox.direction[0]] [0] - ray.posStart[0] ) * raybox.vecLengthInv[0];

        //Y Axis ---------------------------
        min = ( bounds[		raybox.direction[1]] [1] - ray.posStart[1] ) * raybox.vecLengthInv[1];
        max = ( bounds[1 - 	raybox.direction[1]] [1] - ray.posStart[1] ) * raybox.vecLengthInv[1];

        if(max < tMin || min > tMax) return false;	// if it criss crosses, its a miss
        if(min > tMin){ tMin = min; minAxis = 1; }	// Get the greatest min
        if(max < tMax){ tMax = max; maxAxis = 1; }	// Get the smallest max

        //Z Axis ---------------------------
        min = ( bounds[		raybox.direction[2]] [2] - ray.posStart[2] ) * raybox.vecLengthInv[2];
        max = ( bounds[1 - 	raybox.direction[2]] [2] - ray.posStart[2] ) * raybox.vecLengthInv[2];

        if(max < tMin || min > tMax) return false;	// if criss crosses, its a miss
        if(min > tMin){ tMin = min; minAxis = 2; }	// Get the greatest min
        if(max < tMax){ tMax = max; maxAxis = 2; }	// Get the smallest max

        //Finish ------------------------------
        // var ipos = dir.clone().scale(tMin).add(ray.start); //with the shortest distance from start of ray, calc intersection
        if( results ){
            results.tMin	    = tMin;
            results.tMax        = tMax;
            results.entryAxis	= minAxis; // 0 : X, 1 : Y, 2 : Z
            results.exitAxis    = maxAxis;

            vec3.copy( AXIS[ minAxis ], results.entryNorm );
            if( raybox.direction[ minAxis ] == 0 ) vec3.negate( results.entryNorm );

            vec3.copy( AXIS[ maxAxis ], results.exitNorm );
            if( raybox.direction[ maxAxis ] == 1)  vec3.negate( results.exitNorm );
        }
        return true;
    }

    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    rayIntersect( ray: Ray, results ?: RayBBoxResult ): boolean{
        let tmin, tmax, tymin, tymax, tzmin, tzmax;
    
        const bmin  = this.bounds[ 0 ];
        const bmax  = this.bounds[ 1 ];
        let minAxis = 0;
        let maxAxis = 0;

        // X Axis ---------------------------
        const xinv = 1 / ray.direction[ 0 ];
        if( xinv >= 0 ){
            tmin = ( bmin[0] - ray.posStart[0] ) * xinv;
            tmax = ( bmax[0] - ray.posStart[0] ) * xinv;
        }else{
            tmin = ( bmax[0] - ray.posStart[0] ) * xinv;
            tmax = ( bmin[0] - ray.posStart[0] ) * xinv;
        }

        // Y Axis ---------------------------
        const yinv = 1 / ray.direction[ 1 ];
        if( yinv >= 0 ){
            tymin = ( bmin[1] - ray.posStart[1] ) * yinv;
            tymax = ( bmax[1] - ray.posStart[1] ) * yinv;
        }else{
            tymin = ( bmax[1] - ray.posStart[1] ) * yinv;
            tymax = ( bmin[1] - ray.posStart[1] ) * yinv;
        }

        if( tmin > tymax || tymin > tmax ) return false;
        
        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN
        if( tymin > tmin || tmin !== tmin ){ tmin = tymin; minAxis = 1; }
        if( tymax < tmax || tmax !== tmax ){ tmax = tymax; maxAxis = 1; }

        // Z Axis ---------------------------
        const zinv = 1 / ray.direction[ 2 ];
        if( zinv >= 0 ){
            tzmin = ( bmin[2] - ray.posStart[2] ) * zinv;
            tzmax = ( bmax[2] - ray.posStart[2] ) * zinv;
        }else{
            tzmin = ( bmax[2] - ray.posStart[2] ) * zinv;
            tzmax = ( bmin[2] - ray.posStart[2] ) * zinv;
        }

        if( tmin > tzmax || tzmin > tmax ) return false;
        if( tzmin > tmin || tmin !== tmin ){ tmin = tzmin; minAxis = 2; }
        if( tzmax < tmax || tmax !== tmax ){ tmax = tzmax; maxAxis = 2; }
        if( tmax < 0 ) return false;

        // Finish ------------------------------
        if( results ){
            if( tmin >= 0 ){ results.tMin = tmin; results.tMax = tmax; }
            else{            results.tMin = tmax; results.tMax = tmin; }
            
            const inv           = [ xinv, yinv, zinv ];
            results.entryAxis	= minAxis; // 0 : X, 1 : Y, 2 : Z
            results.exitAxis    = maxAxis;

            vec3.copy( AXIS[ minAxis ], results.entryNorm );
            if( inv[ minAxis ] >= 0 ) vec3.negate( results.entryNorm );

            vec3.copy( AXIS[ maxAxis ], results.exitNorm );
            if( inv[ maxAxis ] < 0 ) vec3.negate( results.exitNorm );
        }

        return true;
    }
}