// SPDX-License-Identifier: 0BSD
const doh = 'https://security.cloudflare-dns.com/dns-query';
const contype = 'application/dns-message';
const jsontype = 'application/dns-json';
const dohPath = ''; // 空字符串允许所有路径

export default {
    async fetch(request, env, ctx) {
        const { method, headers, url } = request;
        const { searchParams, pathname } = new URL(url);
        
        // 检查路径（空字符串时允许所有路径）
        if (dohPath && !pathname.startsWith(dohPath)) {
            return new Response(null, { status: 404 });
        }
        
        try {
            let res;
            
            // GET 请求 - DNS 参数格式
            if (method === 'GET' && searchParams.has('dns')) {
                res = await fetch(doh + '?dns=' + searchParams.get('dns'), {
                    method: 'GET',
                    headers: { 'Accept': contype }
                });
            } 
            // POST 请求 - 二进制格式
            else if (method === 'POST' && headers.get('content-type') === contype) {
                res = await fetch(doh, {
                    method: 'POST',
                    headers: {
                        'Accept': contype,
                        'Content-Type': contype,
                    },
                    body: request.body,
                });
            } 
            // GET 请求 - JSON 格式
            else if (method === 'GET' && headers.get('Accept') === jsontype) {
                res = await fetch(doh + new URL(url).search, {
                    method: 'GET',
                    headers: { 'Accept': jsontype }
                });
            } 
            else {
                return new Response(null, { status: 404 });
            }
            
            return new Response(res.body, {
                status: res.status,
                headers: {
                    ...Object.fromEntries(res.headers),
                    'Access-Control-Allow-Origin': '*',
                }
            });
        } catch (error) {
            return new Response('Proxy error', { status: 502 });
        }
    }
};
