---
layout: post
title: Automatically Fixing Relative Imports with ESLint
date: "2021-10-10"
author: Jeff Chen
tags: code
---

I was recently working in a fairly new React/TypeScript codebase that was growing quickly. Because of its rapid growth, it used the default of relative paths for all local imports. This was becoming a problem for developer experience: relative paths make it harder to reorganize files in a codebase, since the developer making that change will also need to update all of that file's imports.

Absolute imports were the answer—I needed to both set up TypeScript to support them and transform all of the project's relative imports into absolute ones.

<!-- excerpt -->

## TypeScript `baseUrl`

TypeScript has a `baseUrl` option that lets it absolutely resolve imports at `${PROJECT_ROOT}/baseUrl`—for example, with a `baseUrl` of `src`, the file `src/pages/LoginPage.tsx` could be imported as `import LoginPage from 'pages/LoginPage`. This setting is great! Unfortunately, it only solved half of my problem: to get the full benefits of absolute imports, I'd need to transform all of the thousands of relative imports in the codebase into absolute ones.

## ESLint to the rescue!

ESLint is a pluggable linter for JavaScript and TypeScript. In particular, it supports both **reporting** and **fixing** lint errors. While there's already a plugin to mark relative imports as errors, that plugin doesn't automatically fix those imports. So, I rolled up my sleeves.

## Setting up the plugin

I started by creating an empty npm project named `eslint-plugin-absolute-imports`. It's important that the project name is prefixed with `eslint-plugin`—otherwise, it won't be supported by ESLint. I set its entrypoint to `index.js`, which basically looked like this:

```javascript
module.exports.rules = {
  "only-absolute-imports": {
    meta: {
      fixable: true, // if this isn't set, ESLint will throw an error if you report a fix
    },
    create: function (context) {
      // detect & fix errors
    },
  },
};
```

Then, in the base project's ESLint configuration, I added `eslint-plugin-absolute-imports` to `plugins` and `absolute-imports/only-absolute-imports: 1` to `rules`. Note that the rulename elides the `eslint-plugin-` prefix—it took me a long time to figure that out.

With the plugin setup, I verified that ESLint was running my plugin by adding a `console.log` statement to `create()`, running `npx eslint src/App.tsx`, and verifying that logs showed up.

## Parsing `import` statements

ESLint makes parsing statements pretty easy—in `create`, I just had to declare the types of AST nodes I cared about and a function to parse them:

```javascript
function create(context) {
  return {
    ImportDeclaration(node) {
      const source = node.source.value;
      if (source.startsWith(".")) {
        // relative dependency!
        context.report({
          node,
          message: `Relative imports are not allowed!`,
        });
      }
    },
  };
}
```

[AST explorer](https://astexplorer.net) was invaluable for both finding the nodes I cared about and understanding their shape.

## Converting relative imports

First, I needed to find the base path that absolute imports should start from, which involves finding the project's `tsconfig.json` or `jsconfig.json`:

```javascript
import fs from "fs";
import path from "path";

function findDirWithFile(filename) {
  // start at our CWD and traverse upwards until we either hit the root "/" or find a directory with our file
  let dir = path.resolve(filename);
  do {
    dir = path.dirname(dir);
  } while (!fs.existsSync(path.join(dir, filename)) && dir !== "/");

  if (!fs.existsSync(path.join(dir, filename))) {
    return;
  }

  return dir;
}

function getBaseUrl() {
  const baseDir = findDirWithFile("package.json");
  let url = "";

  // tsconfig.json will override jsconfig.json
  ["jsconfig.json", "tsconfig.json"].forEach(filename => {
    const fpath = path.join(baseDir, filename);
    if (fs.existsSync(fpath)) {
      const config = JSON.parse(fs.readFileSync(fpath));
      if (config && config.compilerOptions && config.compilerOptions.baseUrl) {
        url = config.compilerOptions.baseUrl;
      }
    }
  });

  return path.join(baseDir, url);
}
```

Then, all that remains is to absolutize the relative paths:

```javascript
function create(context) {
  const baseUrl = getBaseUrl();

  return {
    ImportDeclaration(node) {
      const importSource = node.source.value;
      if (importSource.startsWith(".")) {
        // get the absolute path of the file being linted
        const filename = context.getFilename();
        const absoluteImportPath = path.normalize(
          path.join(path.dirname(filename), importSource);
        );
        const expectedPath = path.relative(baseUrl, absolutePath);

        if (importSource !== expectedPath) {
          context.report({
            node,
            message: `Relative imports are not allowed. Use \`${expectedPath}\` instead of \`${importSource}\`.`,
            fix: function(fixer) {
              return fixer.replaceText(node.source, `'${expectedPath}'`);
            },
          });
        }
      }
    },
  };
}
```

I ran `npx eslint --fix src` to autofix all of my relative imports, and that was that!

You can find the full code on [GitHub](https://www.github.com/jchen1/eslint-plugin-absolute-imports) or just install the plugin via [NPM](https://www.npmjs.com/package/eslint-plugin-absolute-imports).
