/* https://github.com/XenKys/disgroove/blob/dev/examples/permissions.js */
function hasPermission(userPermissions, permission) {
  return (BigInt(userPermissions) & permission) === permission;
}

module.exports = {
  hasPermission,
};
