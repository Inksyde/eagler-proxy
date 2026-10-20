const WebSocket = require('ws');
const net = require('net');

// -------------------------------------------------------------
// YOUR EXACT PLAY.HOSTING DETAILS:
const JAVA_SERVER_IP = 'fridayssmp3.play.hosting'; 
const JAVA_SERVER_PORT = 25575;                    
// -------------------------------------------------------------

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`Eaglercraft WebSocket Proxy listening on port ${PORT}...`);

wss.on('connection', (ws) => {
  console.log('Eaglercraft browser client connected! Connecting to play.hosting...');

  // Create a TCP connection directly to your play.hosting server
  const tcpClient = new net.Socket();

  tcpClient.connect(JAVA_SERVER_PORT, JAVA_SERVER_IP, () => {
    console.log('Successfully bridged to fridayssmp3.play.hosting:25575');
  });

  // Forward Browser WebSocket packets -> play.hosting TCP packets
  ws.on('message', (message) => {
    tcpClient.write(message);
  });

  // Forward play.hosting TCP packets -> Browser WebSocket packets
  tcpClient.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  ws.on('close', () => {
    console.log('Browser client disconnected.');
    tcpClient.destroy();
  });

  tcpClient.on('close', () => {
    console.log('play.hosting TCP connection closed.');
    ws.close();
  });

  tcpClient.on('error', (err) => {
    console.error('play.hosting TCP Error:', err.message);
    ws.close();
  });
});
