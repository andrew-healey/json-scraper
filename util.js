//Worry about prototype pollution

/**
 * Given a root (usually a snip), generate a string based on that root and the inputs. The input must be a regex of our format.
 */
const getString = (input, inputInfo) => {
  if (typeof input === "string") return input.replace(/\$\{([^{}]+)\}/g, (_, key) => inputInfo[key]);
  throw new TypeError("A string generation value must be a string.");
};

const replaceEachString = (root, inputInfo) =>
  Object.keys(root).reduce((last, next) => ({ ...last,
    [next]: (typeof root[next] === "string") ? getString(root[next], inputInfo) : replaceEachString(root[next],inputInfo),
  }), {});

const getVars = (obj) =>
  Object.keys(obj).reduce((last, next) => (next.startsWith("$") ? {
    ...last,
    [next.slice(1)]: obj[next]
  } : last), {});

const flatObject = json => Object.keys(json).reduce((last, next) => ({ ...last,
  ...(typeof json[next] === "object" ? flatObject(json[next]) : {
    [next]: json[next]
  })
}), {});

module.exports = {
  getString,
  replaceEachString,
  getVars,
  flatObject
};
