import Koa from "koa";
import KoaStatic from "koa-static";
import path from "path";
import fs from "fs";

const app = new Koa();

app
    .use(async (ctx, next) => {
        const JSONfirst = ctx.request.header.accept.split(",")[0] === "application/json";
        if (!JSONfirst) {
            await next();
            if (ctx.body !== undefined) return;
        }
        if (ctx.body === undefined && ctx.method === "GET" && ctx.path.endsWith('/')) {
            const staticPath = path.join(process.cwd(), decodeURI(ctx.path));
            console.log(staticPath);
            if (fs.lstatSync(staticPath).isDirectory()) {
                const files = fs.readdirSync(staticPath);
                ctx.body = files.map((fn) => {
                    return { label: fn, value: encodeURI(fn),
                        isLeaf: !fs.lstatSync(staticPath+fn).isDirectory()
                    };
                }).sort((a, b) => {
                    const arr = a.label.split(/(\.|_|-)/g);
                    const brr = b.label.split(/(\.|_|-)/g);
                    if (arr.length !== brr.length) {
                        return arr.length - brr.length;
                    }
                    for (let idx = 0; idx < arr.length; idx++) {
                        const aa = arr[idx];
                        const bb = brr[idx];
                        if (parseInt(aa) < parseInt(bb)) { return -1; }
                        if (parseInt(aa) > parseInt(bb)) { return 1; }
                        if (parseInt(aa) == parseInt(bb)) { return 0; }
                        if (aa < bb) { return -1; }
                        if (aa > bb) { return 1; }
                    }
                });
            }
        }
        if (ctx.body !== undefined) return;
        if (JSONfirst) {
            await next();
        }
    })
    .use(KoaStatic("."))
    .listen(80);