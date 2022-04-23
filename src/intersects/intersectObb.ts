in_obb( box, tran, out ){
    let bbRayDelta	= Vec3.sub( tran.pos, this.origin ),	// Distance between Ray start and Box Position
        //wMat		= box.target.worldMatrix,	// Alias to the world matrix object
        axis 		= new Vec3(),				// Current Axis being tested.
        tMin 		= 0,
        tMax 		= 1000000,
        minAxis		= 0,						// Which axis hit, X:0, Y:1, Z:2
        p, nomLen, denomLen, tmp, min, max;
        
    for(let i=0; i < 3; i++){
        p = i * 4;

        // axis.set(wMat[p],wMat[p+1],wMat[p+2]); //Get Right(0,1,2), Up(4,5,6) and Forward(8,9,10) direction from Matrix
        switch( i ){
            case 0: axis.from_quat( tran.rot, Vec3.LEFT ); break;
            case 1: axis.from_quat( tran.rot, Vec3.UP );  break;
            case 2: axis.from_quat( tran.rot, Vec3.FORWARD ); break;
        }

        nomLen		= Vec3.dot( axis, bbRayDelta ); 	// Get the length of Axis and distance to ray position
        denomLen	= Vec3.dot( this.vec_len, axis );	// Get Length of ray and axis

        if( Math.abs( denomLen ) > 0.00001 ){	// Can't divide by Zero
            min = ( nomLen + box.worldBounds[0][i] ) / denomLen;
            max = ( nomLen + box.worldBounds[1][i] ) / denomLen;

            if( min > max ){ tmp = min; min = max; max = tmp; }		// Swap
            if( min > tMin ){ tMin = min; minAxis = i; }			// Biggest Min
            if( max < tMax ) tMax = max;							// Smallest Max

            if(tMax < tMin) return false;
        }else if(-nomLen + box.worldBounds[0][i] > 0 || -nomLen + box.worldBounds[1][i] < 0) return false;  // Are almost parallel check
    }

    if(out !== undefined){
        out.min		= tMin;
        out.max		= tMax;
        out.nAxis	= minAxis; // 0 : X, 1 : Y, 2 : Z
        out.nDir	= ( this.aabb[ minAxis ] == 1 )? 1 : -1;
    }
    return true;
}
