"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.difference = difference;
function difference(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const onlyInFirst = arr1.filter((item) => !set2.has(item));
    const onlyInSecond = arr2.filter((item) => !set1.has(item));
    return [onlyInFirst, onlyInSecond];
}
