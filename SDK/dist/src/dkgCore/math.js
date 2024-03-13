"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lagrangeInterpolationZpAtZeroMulBabyJubPoint = exports.lagrangeInterpolationZpAtZero = exports.babyJubPointEqual = exports.modInverse = exports.fx = exports.Fp = void 0;
const circomlib_1 = require("circomlib");
// to test math lib
const BASE = circomlib_1.babyJub.Base8;
exports.Fp = circomlib_1.babyJub.subOrder;
function fx(coef, x) {
    let _fx = 0n;
    for (const index in coef) {
        _fx += coef[index] * x ** BigInt(index);
    }
    return _fx % exports.Fp;
}
exports.fx = fx;
function modInverse(a, p = exports.Fp) {
    let [old_r, r] = [a, p];
    let [old_s, s] = [BigInt(1), BigInt(0)];
    while (r !== BigInt(0)) {
        const quotient = old_r / r;
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
    }
    if (old_r > BigInt(1)) {
        // 'a' and 'p' are not coprime, hence the inverse doesn't exist
        return undefined;
    }
    // Ensure the result is positive
    const result = old_s < BigInt(0) ? old_s + p : old_s;
    return result;
}
exports.modInverse = modInverse;
function babyJubPointEqual(P, Q) {
    return P[0] == Q[0] && P[1] == Q[1];
}
exports.babyJubPointEqual = babyJubPointEqual;
function lagrangeInterpolationZpAtZero(indexes, values, Zp = exports.Fp) {
    if (indexes.length !== values.length)
        return undefined;
    const mod = (n) => ((n % Zp) + Zp) % Zp;
    let _f = 0n;
    for (let i = 0; i < indexes.length; i++) {
        let lambda = values[i];
        for (let j = 0; j < indexes.length; j++) {
            if (i === j)
                continue;
            const jVal = indexes[j];
            const iVal = indexes[i];
            const denominator = mod(iVal - jVal);
            const inverse = modInverse(denominator, Zp);
            if (inverse === undefined)
                return undefined; // Inverse doesn't exist
            lambda = mod(lambda * jVal);
            lambda = mod(lambda * inverse);
        }
        _f = mod(_f + lambda);
    }
    return _f;
}
exports.lagrangeInterpolationZpAtZero = lagrangeInterpolationZpAtZero;
function lagrangeInterpolationZpAtZeroMulBabyJubPoint(indexes, Di, Zp = exports.Fp) {
    if (indexes.length !== Di.length)
        return undefined;
    const mod = (n) => ((n % Zp) + Zp) % Zp;
    let D = [0n, 1n];
    for (let i = 0; i < indexes.length; i++) {
        let lambda = 1n;
        for (let j = 0; j < indexes.length; j++) {
            if (i === j)
                continue;
            const jVal = indexes[j];
            const iVal = indexes[i];
            const denominator = mod(iVal - jVal);
            const inverse = modInverse(denominator, Zp);
            if (inverse === undefined)
                return undefined; // Inverse doesn't exist
            lambda = mod(lambda * jVal);
            lambda = mod(lambda * inverse);
        }
        D = circomlib_1.babyJub.addPoint(D, circomlib_1.babyJub.mulPointEscalar(Di[i], lambda));
    }
    return D;
}
exports.lagrangeInterpolationZpAtZeroMulBabyJubPoint = lagrangeInterpolationZpAtZeroMulBabyJubPoint;
