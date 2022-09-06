function sdfBox3D( pos, centroid, halfSize ){
    // fn sdfBox3D(p: vec3<f32>, b: vec3<f32>) -> f32 {  p= vector length of pnt to center of box, B half size of box
    //   let q = abs(p) - b;
    //   return length(max(q, vec3<f32>(0.))) + min(max(q.x, max(q.y, q.z)), 0.);
    // }

    const p = vec3.sub( [0,0,0], pos, centroid );
    vec3_abs( p, p );

    const q    = vec3.sub( [0,0,0], p, halfSize );
    const len  = vec3.len( vec3.max( [0,0,0], [0,0,0], q ) );
    const axis = Math.min( 0.0, Math.max( q[0], q[1], q[2] ) );
    return len + axis;
}