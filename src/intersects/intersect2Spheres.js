export default function intersect2Spheres( aPos, aRadius, bPos, bRadius ){
    const sqRng  =  ( aRadius + bRadius ) ** 2;     // Max distance
    const sqDist =  ( aPos[0] - bPos[0] ) ** 2 +    // Distance between the 2 centers
                    ( aPos[1] - bPos[1] ) ** 2 + 
                    ( aPos[2] - bPos[2] ) ** 2;
    return sqDist <= sqRng;
}