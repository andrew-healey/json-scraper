//TODO Worry about prototype pollution

const runExtensions = (str, inputInfo, extensions) =>
    extensions.reduce((last, next) => last.replace(next.regex, (...props) => next.edit(inputInfo, props)), str);

/**
 * Given a root (usually a snip), generate a string based on that root and the inputs. The input must be a regex of our format.
 */
const getString = (input, inputInfo, extensions = [{
    regex: /\$\{([^{}]+)\}/g,
    edit: (info,[_, key]) => info[key],
}]) => {
    if (typeof input === "string") return runExtensions(input, inputInfo, extensions);
    throw new TypeError("A string generation value must be a string.");
};

const replaceEachString = (root, inputInfo, extensions) =>
    (root instanceof Array? Object.values: i=>i )(Object.keys(root).reduce((last, next) => ({ ...last,
        [next]: (typeof root[next] === "string") ? getString(root[next], inputInfo, extensions) : replaceEachString(root[next], inputInfo, extensions),
    }), {}));


//TODO refactor
const getVars = (input, prop, root) => ((typeof input) === "object") ?

    (obj => prop.startsWith("$") || prop.startsWith("%") ? (input instanceof Array ? { ...root,
        [prop.slice(1)]: input.map((elem, i) => getVars(elem, prop[0] + i, {})[i])
    } : { ...root,
        [prop.slice(1)]: obj
    }) : { ...root,
        ...obj
    })
    (Object.keys(input).reduce((last, next) => getVars(input[next], next, last), {})) : //If starts with $: add getVar'd input to root, else add all keys to root, but their values are all getVar'd) :
    (
        prop.startsWith("$") || prop.startsWith("%") ? { ...root,
            [prop.slice(1)]: input
        } :
        root
    );

const setNames = (input, names) =>
    typeof input === "object" ?
    (
        input instanceof Array ?
        input.map(elem => setNames(elem, names)) :
        (Object.keys(input).reduce((last, prop) =>
            Object.keys(names).includes("$" + prop) || Object.keys(names).includes("%" + prop) ? { ...last,
                [typeof (names["$" + prop]||names["%" + prop])=="string"?"$"+(names["$" + prop]||names["%" + prop]):("$"+prop)]: setNames(input[prop], names["$" + prop]||names["%"+prop])
            } :
            (
                Object.keys(names).includes(prop) ? { ...last,
                    [prop]: setNames(input[prop], names[prop])
                } :
                last
            ), {}))) :
    (
        input
    );

module.exports = {
    getString,
    replaceEachString,
    getVars,
    setNames,
};
