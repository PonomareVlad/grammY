import { bundle } from "https://deno.land/x/emit@0.28.0/mod.ts";
import { createCache } from "https://deno.land/x/deno_cache@0.6.0/mod.ts";

// Parse args
const [release, source = `https://deno.land/x/grammy@${release}/types.ts`] =
    Deno.args;
if (!release) throw new Error("No release specified!");

// Rewrite imports from .deno.ts to .web.ts
const cache = createCache();
const load = (specifier: string) => {
    if (specifier.endsWith(".deno.ts")) {
        const baseLength = specifier.length - ".deno.ts".length;
        specifier = specifier.substring(0, baseLength) + ".web.ts";
    }
    return cache.load(specifier);
};

console.log(`Bundling version '${release}' from ${source} ...`);
// Bundle code
const { code: bundledCode } = await bundle(source, {
    load,
    compilerOptions: {
        sourceMap: false,
        inlineSources: false,
        inlineSourceMap: false,
    },
});

console.log("Emitting ...");
// Strip the huge inline source map which is somehow generated anyway
await Deno.writeTextFile(
    "../out/web-types.mjs",
    bundledCode.replace(/\/\/# sourceMappingURL=.*\n/, ""),
);
await Deno.writeTextFile(
    "../out/web-types.d.ts",
    'export * from "./types";\n',
);

console.log("Done.");
