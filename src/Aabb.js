
import { vec3 } from 'gl-matrix';
import Sphere   from './Sphere.js';

export default class Aabb{
    // #region MAIN
    min = [ -1,-1,-1 ];
    max = [  1, 1, 1 ];
    constructor(){}
    // #endregion

    // #region GETTERS
    getCenter( out=[0,0,0] ){
        out[ 0 ] = ( this.min[ 0 ] + this.max[ 0 ] ) * 0.5;
        out[ 1 ] = ( this.min[ 1 ] + this.max[ 1 ] ) * 0.5;
        out[ 2 ] = ( this.min[ 2 ] + this.max[ 2 ] ) * 0.5;
        return out;
    }

    getSize( out=[0,0,0] ){
        out[ 0 ] = this.max[ 0 ] - this.min[ 0 ];
        out[ 1 ] = this.max[ 1 ] - this.min[ 1 ];
        out[ 2 ] = this.max[ 2 ] - this.min[ 2 ];
        return out;
    }

    getHalfSize( out=[0,0,0] ){
        out[ 0 ] = ( this.max[ 0 ] - this.min[ 0 ] ) * 0.5;
        out[ 1 ] = ( this.max[ 1 ] - this.min[ 1 ] ) * 0.5;
        out[ 2 ] = ( this.max[ 2 ] - this.min[ 2 ] ) * 0.5;
        return out;
    }

    // https://github.com/juj/MathGeoLib/blob/master/src/Geometry/AABB.cpp#L155
    getMinimalEnclosingSphere(){
        const radius = vec3.len( this.getSize() ) * 0.5;
        return new Sphere( this.getCenter(), radius );
    }

    // https://github.com/juj/MathGeoLib/blob/master/src/Geometry/AABB.cpp#L160
    getMaximalContainedSphere(){
        const half = this.getHalfSize();
        return new Sphere( this.getCenter(), Math.in( half[0],half[1],half[2] ) );
    }

    // #endregion
}