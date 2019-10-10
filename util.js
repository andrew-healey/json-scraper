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


//TODO refactor so it's good
const getVars=(input,prop,root)=>((typeof input) === "object")?
  (
    (input=>prop.startsWith("$")?{...root,[prop]:input}:{...root,...input})
    (Object.keys(input).reduce((last,next)=>getVars(input[next],next,last),{}))//If starts with $: add getVar'd input to root, else add all keys to root, but their values are all getVar'd
  ):
  (
    prop.startsWith("$")?
    {...root,[prop.slice(1)]:input}:
    root
  );

module.exports = {
  getString,
  replaceEachString,
  getVars,
};
