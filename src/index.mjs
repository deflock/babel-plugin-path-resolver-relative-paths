import {relativeAndAbsolute, stripExtension} from '@deflock/path';

/**
 * @param {Object} t
 * @returns {Object}
 */
export default function visitor({types: t}) {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                if (state.opts.file_regex) {
                    const r = new RegExp(state.opts.file_regex);
                    if (!r.test(state.file.opts.filename)) {
                        return;
                    }
                }

                let importPath = path.node.source.value;

                if (importPath.indexOf('::') === -1 && importPath[0] !== '.') {
                    return;
                }

                const stripExts = ['.jsx', '.esm', '.mjs', '.js'];

                for (let i = 0; i < stripExts.length; i++) {
                    importPath = stripExtension(importPath, stripExts[i]);
                }

                const absolutePath = state.opts.pathResolver.absolute(importPath, state.file.opts.filename, {
                    aliasType: 'js',
                    isFromDir: false,
                });

                const relative = relativeAndAbsolute(absolutePath, state.file.opts.filename, {
                    isBasePathFile: true,
                    relativePrependDot: true,
                }).relative;

                path.node.source = t.stringLiteral(relative);
            },
        },
    };
}
