export default function pointInObb( pnt, bCenter, bHalf, xNorm, yNorm, zNorm ){
    const d = vec3.sub( [0,0,0], pnt, bCenter );
    return  Math.abs( vec3.dot( d, xNorm ) ) <= bHalf[ 0 ] &&
            Math.abs( vec3.dot( d, yNorm ) ) <= bHalf[ 1 ] &&
            Math.abs( vec3.dot( d, zNorm ) ) <= bHalf[ 2 ];
}