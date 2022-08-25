// https://github.com/sindresorhus/is-absolute-url/blob/master/index.js
import {join} from "path";
import imageSize from "image-size";

export function isAbsoluteURL(url) {
    if (typeof url !== "string") {
        throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``);
    }

    // Don't match Windows paths `c:\`
    if (/^[a-zA-Z]:\\/.test(url)) {
        return false;
    }

    // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
    // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}

export function sizeImage(image, opts = {}) {
    // only supports local images with absolute paths
    if (!isAbsoluteURL(image) && image.startsWith("/")) {
        const path = join(process.cwd(), opts.basepath || "", image);
        try {
            return imageSize(path);
        } catch (e) {
            console.warn(`Error getting dimensions for ${image} (path: ${path})!`, e);
        }
    }
}

// replaces all properties of source with those of target
export function replace(source, target) {
    for (const property in source) {
        delete source[property];
    }

    Object.assign(source, target);
}
