const localtunnel = require('localtunnel');
(async () => {
    const tunnel = await localtunnel({ port: 3002 });
    console.log('TUNNEL_URL=', tunnel.url);
    tunnel.on('close', () => {
        console.log('tunnels are closed');
    });
})();
