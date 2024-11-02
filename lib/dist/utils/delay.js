"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delay = function (ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
};
exports.default = delay;
