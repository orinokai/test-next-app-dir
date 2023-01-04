const { Server } = require("http");
const { promises } = require("fs");
// We copy the file here rather than requiring from the node module
const { Bridge } = require("./bridge");
const { augmentFsModule, getMaxAge, getMultiValueHeaders, getPrefetchResponse, getNextServer } = require('./handlerUtils')


const { config }  = require("../../../.next/required-server-files.json")
let staticManifest
try {
  staticManifest = require("../../../.next/static-manifest.json")
} catch {}
const path = require("path");
const pageRoot = path.resolve(path.join(__dirname, "../../../.next", "server"));
exports.handler = ((conf, app, pageRoot, staticManifest = [], mode = 'ssr') => {
    var _a;
    // Change working directory into the site root, unless using Nx, which moves the
    // dist directory and handles this itself
    const dir = path.resolve(__dirname, app);
    if (pageRoot.startsWith(dir)) {
        process.chdir(dir);
    }
    // This is just so nft knows about the page entrypoints. It's not actually used
    try {
        // eslint-disable-next-line n/no-missing-require
        require.resolve('./pages.js');
    }
    catch { }
    const ONE_YEAR_IN_SECONDS = 31536000;
    (_a = process.env).NODE_ENV || (_a.NODE_ENV = 'production');
    // We don't want to write ISR files to disk in the lambda environment
    conf.experimental.isrFlushToDisk = false;
    // This is our flag that we use when patching the source
    // eslint-disable-next-line no-underscore-dangle
    process.env._REVALIDATE_SSG = 'true';
    for (const [key, value] of Object.entries(conf.env)) {
        process.env[key] = String(value);
    }
    // Set during the request as it needs to get it from the request URL. Defaults to the URL env var
    let base = process.env.URL;
    augmentFsModule({ promises, staticManifest, pageRoot, getBase: () => base });
    // We memoize this because it can be shared between requests, but don't instantiate it until
    // the first request because we need the host and port.
    let bridge;
    const getBridge = (event) => {
        if (bridge) {
            return bridge;
        }
        const url = new URL(event.rawUrl);
        const port = Number.parseInt(url.port) || 80;
        base = url.origin;
        const NextServer = getNextServer();
        const nextServer = new NextServer({
            conf,
            dir,
            customServer: false,
            hostname: url.hostname,
            port,
        });
        const requestHandler = nextServer.getRequestHandler();
        const server = new Server(async (req, res) => {
            try {
                await requestHandler(req, res);
            }
            catch (error) {
                console.error(error);
                throw new Error('Error handling request. See function logs for details.');
            }
        });
        bridge = new Bridge(server);
        bridge.listen();
        return bridge;
    };
    return async function handler(event, context) {
        var _a, _b, _c;
        let requestMode = mode;
        const prefetchResponse = getPrefetchResponse(event, mode);
        if (prefetchResponse) {
            return prefetchResponse;
        }
        // Ensure that paths are encoded - but don't double-encode them
        event.path = new URL(event.rawUrl).pathname;
        // Next expects to be able to parse the query from the URL
        const query = new URLSearchParams(event.queryStringParameters).toString();
        event.path = query ? `${event.path}?${query}` : event.path;
        const graphToken = event.netlifyGraphToken;
        if (graphToken && requestMode !== 'ssr') {
            // Prefix with underscore to help us determine the origin of the token
            // allows us to write better error messages
            // eslint-disable-next-line no-underscore-dangle
            process.env._NETLIFY_GRAPH_TOKEN = graphToken;
        }
        const { headers, ...result } = await getBridge(event).launcher(event, context);
        // Convert all headers to multiValueHeaders
        const multiValueHeaders = getMultiValueHeaders(headers);
        if (event.headers['x-next-debug-logging']) {
            const response = {
                headers: multiValueHeaders,
                statusCode: result.statusCode,
            };
            console.log('Origin response:', JSON.stringify(response, null, 2));
        }
        if ((_b = (_a = multiValueHeaders['set-cookie']) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.includes('__prerender_bypass')) {
            delete multiValueHeaders.etag;
            multiValueHeaders['cache-control'] = ['no-cache'];
        }
        // Sending SWR headers causes undefined behaviour with the Netlify CDN
        const cacheHeader = (_c = multiValueHeaders['cache-control']) === null || _c === void 0 ? void 0 : _c[0];
        if (cacheHeader === null || cacheHeader === void 0 ? void 0 : cacheHeader.includes('stale-while-revalidate')) {
            if (requestMode === 'odb') {
                const ttl = getMaxAge(cacheHeader);
                // Long-expiry TTL is basically no TTL, so we'll skip it
                if (ttl > 0 && ttl < ONE_YEAR_IN_SECONDS) {
                    // ODBs currently have a minimum TTL of 60 seconds
                    result.ttl = Math.max(ttl, 60);
                }
                const ephemeralCodes = [301, 302, 307, 308, 404];
                if (ttl === ONE_YEAR_IN_SECONDS && ephemeralCodes.includes(result.statusCode)) {
                    // Only cache for 60s if default TTL provided
                    result.ttl = 60;
                }
                if (result.ttl > 0) {
                    requestMode = `odb ttl=${result.ttl}`;
                }
            }
            multiValueHeaders['cache-control'] = ['public, max-age=0, must-revalidate'];
        }
        multiValueHeaders['x-nf-render-mode'] = [requestMode];
        console.log(`[${event.httpMethod}] ${event.path} (${requestMode === null || requestMode === void 0 ? void 0 : requestMode.toUpperCase()})`);
        return {
            ...result,
            multiValueHeaders,
            isBase64Encoded: result.encoding === 'base64',
        };
    };
})(config, "../../..", pageRoot, staticManifest, 'ssr');