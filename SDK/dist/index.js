"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dkg_1 = require("./src/adapter/dkg");
const blender_1 = require("./src/adapter/blender");
// export { DKGHelper, MixerHelper };
// export default {
//   DKGHelper,
//   MixerHelper,
// };
exports.default = { BlenderHelper: blender_1.BlenderHelper, DKGHelper: dkg_1.DKGHelper };
