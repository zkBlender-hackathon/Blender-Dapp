"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const circomlibjs_1 = require("circomlibjs");
const fixed_merkle_tree_1 = require("fixed-merkle-tree");
let tree = new fixed_merkle_tree_1.MerkleTree(10, [], {
    hashFunction: (left, right) => String((0, circomlibjs_1.poseidon)([left, right])),
    zeroElement: "3042774122929058629117742057409317273972932196304097622662323601237587181833",
});
exports.default = tree;
