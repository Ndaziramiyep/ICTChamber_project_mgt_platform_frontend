/**
 * Only used by Jest to transpile the handful of ESM-only packages in MSW's dependency tree
 * (e.g. `rettime`) that ts-jest's transform (registered for .ts/.tsx only) never sees.
 */
module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};
