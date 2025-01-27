function vec3_sum( out, ...ary ){
    out[ 0 ] = ary[ 0 ][ 0 ];
    out[ 1 ] = ary[ 0 ][ 1 ];
    out[ 2 ] = ary[ 0 ][ 2 ];

    for( let i=1; i < ary.length; i++ ){
        out[ 0 ] += ary[ i ][ 0 ];
        out[ 1 ] += ary[ i ][ 1 ];
        out[ 2 ] += ary[ i ][ 2 ];
    }

    return out;
}

class Sphere{
    constructor( pos, radius=1 ){
        this.center = vec3.copy( [0,0,0], pos );
        this.radius = radius;
    }
}

class Obb{
    // #region MAIN
    pos     = [0,0,0];
    rot     = [0,0,0,1];
    half    = [1,1,1];

    xAxis   = [1,0,0];
    yAxis   = [0,1,0];
    zAxis   = [0,0,1];
    constructor(){}
    // #endregion

    // #region METHODS
    updateAxes(){
        vec3.transformQuat( this.xAxis, [1,0,0], this.rot );
        vec3.transformQuat( this.yAxis, [0,1,0], this.rot );
        vec3.transformQuat( this.zAxis, [0,0,1], this.rot );
        return this;
    }
    // #endregion

    // #region GETTERS
    getPoints(){
        const xp    = vec3.scale( [0,0,0], this.xAxis, this.half[0] );
        const yp    = vec3.scale( [0,0,0], this.yAxis, this.half[1] );
        const zp    = vec3.scale( [0,0,0], this.zAxis, this.half[2] );
        const xn    = vec3.negate( [0,0,0], xp );
        const yn    = vec3.negate( [0,0,0], yp );
        const zn    = vec3.negate( [0,0,0], zp );
        const pnts  = new Array( 8 );

        pnts[ 0 ] = vec3_sum( [0,0,0], this.pos, xn, yn, zn );
        pnts[ 1 ] = vec3_sum( [0,0,0], this.pos, xn, yn, zp );
        pnts[ 2 ] = vec3_sum( [0,0,0], this.pos, xp, yn, zp );
        pnts[ 3 ] = vec3_sum( [0,0,0], this.pos, xp, yn, zn );
        pnts[ 4 ] = vec3_sum( [0,0,0], this.pos, xn, yp, zn );
        pnts[ 5 ] = vec3_sum( [0,0,0], this.pos, xn, yp, zp );
        pnts[ 6 ] = vec3_sum( [0,0,0], this.pos, xp, yp, zp );
        pnts[ 7 ] = vec3_sum( [0,0,0], this.pos, xp, yp, zn );

        return pnts;
    }
    
    // Get the smallest possible sphere to contain
    // https://github.com/juj/MathGeoLib/blob/master/src/Geometry/OBB.cpp#L245
    getMinimalEnclosingSphere(){
        const xp    = vec3.scale( [0,0,0], this.xAxis, this.half[0] );
        const yp    = vec3.scale( [0,0,0], this.yAxis, this.half[1] );
        const zp    = vec3.scale( [0,0,0], this.zAxis, this.half[2] );
        const v     = vec3_sum( [0,0,0], xp, yp, zp );
        return new Sphere( this.pos, vec3.len( v ) );
    }

    // Maxium possible sphere that fits inside the box
    // https://github.com/juj/MathGeoLib/blob/master/src/Geometry/OBB.cpp#L253
    getMaximalContainedSphere(){
        return new Sphere( this.pos, Math.min( this.half[0], this.half[1], this.half[2] ) );
    }
    // #endregion
}

// Back points, Forward
// const ba = [ c[0] - x[0] + y[0] - z[0], c[1] - x[1] + y[1] - z[1], c[2] - x[2] + y[2] - z[2] ];
// const bb = [ c[0] - x[0] - y[0] - z[0], c[1] - x[1] - y[1] - z[1], c[2] - x[2] - y[2] - z[2] ];
// const bc = [ c[0] + x[0] - y[0] - z[0], c[1] + x[1] - y[1] - z[1], c[2] + x[2] - y[2] - z[2] ];
// const bd = [ c[0] + x[0] + y[0] - z[0], c[1] + x[1] + y[1] - z[1], c[2] + x[2] + y[2] - z[2] ];
// const fa = [ c[0] - x[0] + y[0] + z[0], c[1] - x[1] + y[1] + z[1], c[2] - x[2] + y[2] + z[2] ];
// const fb = [ c[0] - x[0] - y[0] + z[0], c[1] - x[1] - y[1] + z[1], c[2] - x[2] - y[2] + z[2] ];
// const fc = [ c[0] + x[0] - y[0] + z[0], c[1] + x[1] - y[1] + z[1], c[2] + x[2] - y[2] + z[2] ];
// const fd = [ c[0] + x[0] + y[0] + z[0], c[1] + x[1] + y[1] + z[1], c[2] + x[2] + y[2] + z[2] ];