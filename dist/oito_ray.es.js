import { mat4, vec3 } from "oito";
class Ray {
  constructor() {
    this.posStart = [0, 0, 0];
    this.posEnd = [0, 0, 0];
    this.direction = [0, 0, 0];
    this.vecLength = [0, 0, 0];
  }
  posAt(t, out) {
    out = out || [0, 0, 0];
    out[0] = this.vecLength[0] * t + this.posStart[0];
    out[1] = this.vecLength[1] * t + this.posStart[1];
    out[2] = this.vecLength[2] * t + this.posStart[2];
    return out;
  }
  directionAt(len, out) {
    out = out || [0, 0, 0];
    out[0] = this.direction[0] * len + this.posStart[0];
    out[1] = this.direction[1] * len + this.posStart[1];
    out[2] = this.direction[2] * len + this.posStart[2];
    return out;
  }
  fromScreenProjection(x, y, w, h, projMatrix, camMatrix) {
    const nx = x / w * 2 - 1;
    const ny = 1 - y / h * 2;
    const invMatrix = mat4.invert(projMatrix);
    mat4.mul(camMatrix, invMatrix, invMatrix);
    const clipNear = [nx, ny, -1, 1];
    const clipFar = [nx, ny, 1, 1];
    mat4.transformVec4(invMatrix, clipNear);
    mat4.transformVec4(invMatrix, clipFar);
    for (let i = 0; i < 3; i++) {
      clipNear[i] /= clipNear[3];
      clipFar[i] /= clipFar[3];
    }
    vec3.copy(clipNear, this.posStart);
    vec3.copy(clipFar, this.posEnd);
    vec3.sub(clipFar, clipNear, this.vecLength);
    vec3.norm(this.vecLength, this.direction);
    return this;
  }
  fromEndPoints(a, b) {
    vec3.copy(a, this.posStart);
    vec3.copy(b, this.posEnd);
    vec3.sub(b, a, this.vecLength);
    vec3.norm(this.vecLength, this.direction);
    return this;
  }
}
function nearPoint(ray, p, distLimit = 0.1) {
  const v = vec3.sub(p, ray.posStart, [0, 0, 0]);
  vec3.mul(v, ray.vecLength);
  const t = (v[0] + v[1] + v[2]) / vec3.lenSq(ray.vecLength);
  if (t < 0 || t > 1)
    return null;
  const lenSqr = vec3.lenSq(ray.posAt(t, v), p);
  return lenSqr <= distLimit * distLimit ? t : null;
}
function intersectPlane(ray, planePos, planeNorm) {
  const denom = vec3.dot(ray.vecLength, planeNorm);
  if (denom <= 1e-6 && denom >= -1e-6)
    return null;
  const t = vec3.dot(vec3.sub(planePos, ray.posStart, [0, 0, 0]), planeNorm) / denom;
  return t >= 0 ? t : null;
}
function intersectCircle(ray, radius, planePos, planeNorm) {
  const t = intersectPlane(ray, planePos, planeNorm);
  if (t == null)
    return null;
  const pnt = ray.posAt(t);
  const lenSq = vec3.lenSq(pnt, planePos);
  return lenSq <= radius * radius ? t : null;
}
function intersectQuad(ray, centerPos, w, h) {
  const v0 = vec3.add(centerPos, [-w, h, 0], [0, 0, 0]), v1 = vec3.add(centerPos, [-w, -h, 0], [0, 0, 0]), v2 = vec3.add(centerPos, [w, -h, 0], [0, 0, 0]);
  const a = vec3.sub(v0, v1, [0, 0, 0]);
  const b = vec3.sub(v2, v1, [0, 0, 0]);
  const norm = vec3.norm(vec3.cross(b, a, [0, 0, 0]));
  const t = intersectPlane(ray, centerPos, norm);
  if (t == null)
    return null;
  const ip = ray.posAt(t);
  let tt = 0;
  vec3.sub(ip, v0, a);
  vec3.sub(v1, v0, b);
  tt = vec3.dot(a, b) / vec3.lenSq(b);
  if (tt < 0 || tt > 1)
    return null;
  vec3.sub(ip, v1, a);
  vec3.sub(v2, v1, b);
  tt = vec3.dot(a, b) / vec3.lenSq(b);
  if (tt < 0 || tt > 1)
    return null;
  return t;
}
class RaySphereResult {
  constructor() {
    this.tMin = 0;
    this.tMax = 0;
    this.posEntry = [0, 0, 0];
    this.posExit = [0, 0, 0];
  }
}
function intersectSphere(ray, origin, radius, results) {
  const radiusSq = radius * radius;
  const rayToCenter = vec3.sub(origin, ray.posStart, [0, 0, 0]);
  const tProj = vec3.dot(rayToCenter, ray.direction);
  const oppLenSq = vec3.lenSq(rayToCenter) - tProj * tProj;
  if (oppLenSq > radiusSq)
    return false;
  if (results) {
    if (oppLenSq == radiusSq) {
      results.tMin = tProj;
      results.tMax = tProj;
      ray.directionAt(tProj, results.posEntry);
      vec3.copy(results.posEntry, results.posExit);
      return true;
    }
    const oLen = Math.sqrt(radiusSq - oppLenSq);
    const t0 = tProj - oLen;
    const t1 = tProj + oLen;
    if (t1 < t0) {
      results.tMin = t1;
      results.tMax = t0;
    } else {
      results.tMin = t0;
      results.tMax = t1;
    }
    ray.directionAt(t0, results.posEntry);
    ray.directionAt(t1, results.posExit);
  }
  return true;
}
class RayCapsuleResult {
  constructor() {
    this.pos = [0, 0, 0];
    this.t = 0;
  }
}
function intersectCapsule(ray, radius, vecStart, vecEnd, result) {
  const A = vecStart;
  const B = vecEnd;
  const radiusSq = radius * radius;
  const AB = vec3.sub(B, A, [0, 0, 0]);
  const AO = vec3.sub(ray.posStart, A, [0, 0, 0]);
  const AOxAB = vec3.cross(AO, AB, [0, 0, 0]);
  const VxAB = vec3.cross(ray.direction, AB, [0, 0, 0]);
  const ab2 = vec3.lenSq(AB);
  const a = vec3.lenSq(VxAB);
  const b = 2 * vec3.dot(VxAB, AOxAB);
  const c = vec3.lenSq(AOxAB) - radiusSq * ab2;
  const d = b * b - 4 * a * c;
  if (d < 0)
    return false;
  const t = (-b - Math.sqrt(d)) / (2 * a);
  if (t < 0) {
    const pos = vec3.lenSq(A, ray.posStart) < vec3.lenSq(B, ray.posStart) ? A : B;
    if (result) {
      const sphereResult2 = new RaySphereResult();
      const isHit2 = intersectSphere(ray, pos, radius, sphereResult2);
      if (isHit2) {
        result.t = sphereResult2.tMin;
        vec3.copy(sphereResult2.posEntry, result.pos);
      }
      return isHit2;
    } else
      return intersectSphere(ray, pos, radius, result);
  }
  const iPos = ray.directionAt(t);
  const iPosLen = vec3.sub(iPos, A, [0, 0, 0]);
  const tLimit = vec3.dot(iPosLen, AB) / ab2;
  const sphereResult = result ? new RaySphereResult() : void 0;
  let isHit = false;
  if (tLimit >= 0 && tLimit <= 1) {
    if (result) {
      result.t = t;
      vec3.copy(iPos, result.pos);
    }
    return true;
  } else if (tLimit < 0)
    isHit = intersectSphere(ray, A, radius, sphereResult);
  else if (tLimit > 1)
    isHit = intersectSphere(ray, B, radius, sphereResult);
  if (isHit && result && sphereResult) {
    result.t = t;
    vec3.copy(sphereResult.posEntry, result.pos);
  }
  return isHit;
}
class NearSegmentResult {
  constructor() {
    this.segPosition = [0, 0, 0];
    this.rayPosition = [0, 0, 0];
    this.distanceSq = 0;
    this.distance = 0;
  }
}
function nearSegment(ray, p0, p1, results) {
  const u = vec3.sub(p1, p0, [0, 0, 0]), v = ray.vecLength, w = vec3.sub(p0, ray.posStart, [0, 0, 0]), a = vec3.dot(u, u), b = vec3.dot(u, v), c = vec3.dot(v, v), d = vec3.dot(u, w), e = vec3.dot(v, w), D = a * c - b * b;
  let tU = 0, tV = 0;
  if (D < 1e-6) {
    tU = 0;
    tV = b > c ? d / b : e / c;
  } else {
    tU = (b * e - c * d) / D;
    tV = (a * e - b * d) / D;
  }
  if (tU < 0 || tU > 1 || tV < 0 || tV > 1)
    return null;
  if (results) {
    ray.posAt(tV, results.rayPosition);
    vec3.lerp(p0, p1, tU, results.segPosition);
    results.distanceSq = vec3.lenSq(results.segPosition, results.rayPosition);
    results.distance = Math.sqrt(results.distanceSq);
  }
  return [tU, tV];
}
const AXIS = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
class RayBBoxResult {
  constructor() {
    this.tMin = 0;
    this.tMax = 0;
    this.entryAxis = 0;
    this.entryNorm = [0, 0, 0];
    this.exitAxis = 0;
    this.exitNorm = [0, 0, 0];
  }
}
class AABBRay {
  constructor(ray) {
    this.vecLengthInv = [0, 0, 0];
    this.direction = [0, 0, 0];
    if (ray)
      this.fromRay(ray);
  }
  fromRay(ray) {
    vec3.invert(ray.vecLength, this.vecLengthInv);
    this.direction[0] = this.vecLengthInv[0] < 0 ? 1 : 0;
    this.direction[1] = this.vecLengthInv[1] < 0 ? 1 : 0;
    this.direction[2] = this.vecLengthInv[2] < 0 ? 1 : 0;
  }
}
class BoundingBox {
  constructor(min, max) {
    this.bounds = [[0, 0, 0], [0, 0, 0]];
    if (min && max)
      this.setBounds(min, max);
  }
  get min() {
    return this.bounds[0];
  }
  set min(v) {
    vec3.copy(v, this.bounds[0]);
  }
  get max() {
    return this.bounds[1];
  }
  set max(v) {
    vec3.copy(v, this.bounds[1]);
  }
  setBounds(min, max) {
    vec3.copy(min, this.bounds[0]);
    vec3.copy(max, this.bounds[1]);
    return this;
  }
  rayIntersects(ray, raybox, results) {
    let tMin, tMax, min, max, minAxis = 0, maxAxis = 0;
    const bounds = this.bounds;
    tMin = (bounds[raybox.direction[0]][0] - ray.posStart[0]) * raybox.vecLengthInv[0];
    tMax = (bounds[1 - raybox.direction[0]][0] - ray.posStart[0]) * raybox.vecLengthInv[0];
    min = (bounds[raybox.direction[1]][1] - ray.posStart[1]) * raybox.vecLengthInv[1];
    max = (bounds[1 - raybox.direction[1]][1] - ray.posStart[1]) * raybox.vecLengthInv[1];
    if (max < tMin || min > tMax)
      return false;
    if (min > tMin) {
      tMin = min;
      minAxis = 1;
    }
    if (max < tMax) {
      tMax = max;
      maxAxis = 1;
    }
    min = (bounds[raybox.direction[2]][2] - ray.posStart[2]) * raybox.vecLengthInv[2];
    max = (bounds[1 - raybox.direction[2]][2] - ray.posStart[2]) * raybox.vecLengthInv[2];
    if (max < tMin || min > tMax)
      return false;
    if (min > tMin) {
      tMin = min;
      minAxis = 2;
    }
    if (max < tMax) {
      tMax = max;
      maxAxis = 2;
    }
    if (results) {
      results.tMin = tMin;
      results.tMax = tMax;
      results.entryAxis = minAxis;
      results.exitAxis = maxAxis;
      vec3.copy(AXIS[minAxis], results.entryNorm);
      if (raybox.direction[minAxis] == 0)
        vec3.negate(results.entryNorm);
      vec3.copy(AXIS[maxAxis], results.exitNorm);
      if (raybox.direction[maxAxis] == 1)
        vec3.negate(results.exitNorm);
    }
    return true;
  }
  rayIntersect(ray, results) {
    let tmin, tmax, tymin, tymax, tzmin, tzmax;
    const bmin = this.bounds[0];
    const bmax = this.bounds[1];
    let minAxis = 0;
    let maxAxis = 0;
    const xinv = 1 / ray.direction[0];
    if (xinv >= 0) {
      tmin = (bmin[0] - ray.posStart[0]) * xinv;
      tmax = (bmax[0] - ray.posStart[0]) * xinv;
    } else {
      tmin = (bmax[0] - ray.posStart[0]) * xinv;
      tmax = (bmin[0] - ray.posStart[0]) * xinv;
    }
    const yinv = 1 / ray.direction[1];
    if (yinv >= 0) {
      tymin = (bmin[1] - ray.posStart[1]) * yinv;
      tymax = (bmax[1] - ray.posStart[1]) * yinv;
    } else {
      tymin = (bmax[1] - ray.posStart[1]) * yinv;
      tymax = (bmin[1] - ray.posStart[1]) * yinv;
    }
    if (tmin > tymax || tymin > tmax)
      return false;
    if (tymin > tmin || tmin !== tmin) {
      tmin = tymin;
      minAxis = 1;
    }
    if (tymax < tmax || tmax !== tmax) {
      tmax = tymax;
      maxAxis = 1;
    }
    const zinv = 1 / ray.direction[2];
    if (zinv >= 0) {
      tzmin = (bmin[2] - ray.posStart[2]) * zinv;
      tzmax = (bmax[2] - ray.posStart[2]) * zinv;
    } else {
      tzmin = (bmax[2] - ray.posStart[2]) * zinv;
      tzmax = (bmin[2] - ray.posStart[2]) * zinv;
    }
    if (tmin > tzmax || tzmin > tmax)
      return false;
    if (tzmin > tmin || tmin !== tmin) {
      tmin = tzmin;
      minAxis = 2;
    }
    if (tzmax < tmax || tmax !== tmax) {
      tmax = tzmax;
      maxAxis = 2;
    }
    if (tmax < 0)
      return false;
    if (results) {
      if (tmin >= 0) {
        results.tMin = tmin;
        results.tMax = tmax;
      } else {
        results.tMin = tmax;
        results.tMax = tmin;
      }
      const inv = [xinv, yinv, zinv];
      results.entryAxis = minAxis;
      results.exitAxis = maxAxis;
      vec3.copy(AXIS[minAxis], results.entryNorm);
      if (inv[minAxis] >= 0)
        vec3.negate(results.entryNorm);
      vec3.copy(AXIS[maxAxis], results.exitNorm);
      if (inv[maxAxis] < 0)
        vec3.negate(results.exitNorm);
    }
    return true;
  }
}
class RayObbResult {
  constructor() {
    this.tMin = 0;
    this.tMax = 0;
    this.entryAxis = 0;
    this.entryNorm = [0, 0, 0];
    this.exitAxis = 0;
    this.exitNorm = [0, 0, 0];
  }
}
class OrientedBBox {
  constructor(min, max) {
    this.minBound = [0, 0, 0];
    this.maxBound = [0, 0, 0];
    this.worldPosition = [0, 0, 0];
    this.orientation = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    if (min && max)
      this.setBounds(min, max);
  }
  get min() {
    return this.minBound;
  }
  set min(v) {
    vec3.copy(v, this.minBound);
  }
  get max() {
    return this.maxBound;
  }
  set max(v) {
    vec3.copy(v, this.maxBound);
  }
  setBounds(min, max) {
    vec3.copy(min, this.minBound);
    vec3.copy(max, this.maxBound);
    return this;
  }
  applyTransform(tran) {
    vec3.transformQuat([1, 0, 0], tran.rot, this.orientation[0]);
    vec3.transformQuat([0, 1, 0], tran.rot, this.orientation[1]);
    vec3.transformQuat([0, 0, 1], tran.rot, this.orientation[2]);
    vec3.copy(tran.pos, this.worldPosition);
  }
  rayIntersect(ray, result) {
    const rayDelta = vec3.sub(this.worldPosition, ray.posStart, [0, 0, 0]);
    let tMin = 0;
    let tMax = 1e6;
    let minAxis = 0;
    let maxAxis = 0;
    let axis;
    let nomLen;
    let denomLen;
    let tmp;
    let min;
    let max;
    for (let i = 0; i < 3; i++) {
      axis = this.orientation[i];
      nomLen = vec3.dot(axis, rayDelta);
      denomLen = vec3.dot(ray.vecLength, axis);
      if (Math.abs(denomLen) > 1e-5) {
        min = (nomLen + this.minBound[i]) / denomLen;
        max = (nomLen + this.maxBound[i]) / denomLen;
        if (min > max) {
          tmp = min;
          min = max;
          max = tmp;
        }
        if (min > tMin) {
          tMin = min;
          minAxis = i;
        }
        if (max < tMax) {
          tMax = max;
          maxAxis = i;
        }
        if (tMax < tMin)
          return false;
      } else if (-nomLen + this.minBound[i] > 0 || -nomLen + this.maxBound[i] < 0)
        return false;
    }
    if (result) {
      result.tMin = tMin;
      result.tMax = tMax;
      vec3.copy(this.orientation[minAxis], result.entryNorm);
      if (1 / ray.vecLength[minAxis] >= 0)
        vec3.negate(result.entryNorm);
      vec3.copy(this.orientation[maxAxis], result.exitNorm);
      if (1 / ray.vecLength[maxAxis] < 0)
        vec3.negate(result.exitNorm);
    }
    return true;
  }
}
export { AABBRay, BoundingBox, NearSegmentResult, OrientedBBox, Ray, RayBBoxResult, RayCapsuleResult, RayObbResult, RaySphereResult, intersectCapsule, intersectCircle, intersectPlane, intersectQuad, intersectSphere, intersectCircle as intersectTri, nearPoint, nearSegment };
