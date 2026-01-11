// SPDX-License-Identifier: 0BSD
const dohServers = [
    'https://security.cloudflare-dns.com/dns-query',
    'https://dns.google/dns-query',
    'https://dns.quad9.net/dns-query',
    'https://doh.opendns.com/dns-query',
];
const contype = 'application/dns-message';
const jsontype = 'application/dns-json';
const dohPath = ''; // 空字符串允许所有路径

export default {
    async fetch(request, env, ctx) {
        const { method, headers, url } = request;
        const { searchParams, pathname } = new URL(url);
        
        // Health check 端点
        if (pathname === '/health') {
            const healthStatus = {
                status: 'healthy',
                service: 'DoH Proxy',
                timestamp: new Date().toISOString(),
                upstreamDNS: dohServers,
                version: '1.1.0'
            };
            
            return new Response(JSON.stringify(healthStatus, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }
        
        // 检查路径（空字符串时允许所有路径）
        if (dohPath && !pathname.startsWith(dohPath)) {
            return new Response(null, { status: 404 });
        }
        
        // 准备请求参数
        let fetchOptions = {};
        let queryString = '';
        
        // GET 请求 - DNS 参数格式
        if (method === 'GET' && searchParams.has('dns')) {
            queryString = '?dns=' + searchParams.get('dns');
            fetchOptions = {
                method: 'GET',
                headers: { 'Accept': contype }
            };
        } 
        // POST 请求 - 二进制格式
        else if (method === 'POST' && headers.get('content-type') === contype) {
            fetchOptions = {
                method: 'POST',
                headers: {
                    'Accept': contype,
                    'Content-Type': contype,
                },
                body: request.body,
            };
        } 
        // GET 请求 - JSON 格式
        else if (method === 'GET' && headers.get('Accept') === jsontype) {
            queryString = new URL(url).search;
            fetchOptions = {
                method: 'GET',
                headers: { 'Accept': jsontype }
            };
        } 
        else {
            return new Response(null, { status: 404 });
        }
        
        // 尝试所有 DoH 服务器，使用第一个成功的
        let lastError = null;
        
        for (const dohServer of dohServers) {
            try {
                const res = await fetch(dohServer + queryString, fetchOptions);
                
                // 如果响应成功，立即返回
                if (res.ok) {
                    return new Response(res.body, {
                        status: res.status,
                        headers: {
                            ...Object.fromEntries(res.headers),
                            'Access-Control-Allow-Origin': '*',
                            'X-DoH-Server': dohServer, // 标记使用的服务器
                        }
                    });
                }
                
                lastError = `${dohServer} returned status ${res.status}`;
            } catch (error) {
                lastError = `${dohServer} failed: ${error.message}`;
                // 继续尝试下一个服务器
                continue;
            }
        }
        
        // 所有服务器都失败
        return new Response(`All DoH servers failed. Last error: ${lastError}`, { 
            status: 502,
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });
    }
};
