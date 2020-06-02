import Koa from "koa";
import KoaStatic from "koa-static";
import path from "path";
import fs from "fs";

const app = new Koa();

app
    .use(async (ctx, next) => {
        await next();
        if (ctx.method === "GET" && ctx.path.endsWith('/')) {
            const staticPath = path.join(process.cwd(), decodeURI(ctx.path));
            console.log(staticPath);
            if (fs.lstatSync(staticPath).isDirectory()) {
                const files = fs.readdirSync(staticPath);
                ctx.body = files.map((fn) => {
                    if (fs.lstatSync(staticPath+fn).isDirectory()) {
                        return { label: fn, value: encodeURI(fn) + "/", isLeaf: false};
                    } else {
                        return { label: fn, value: encodeURI(fn), isLeaf: true};
                    }
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
    })
    .use(KoaStatic("."))
    .listen(80);