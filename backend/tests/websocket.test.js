const { io: Client } = require('socket.io-client');
const { startServer, server } = require('../src/server');

const testWebSockets = async () => {
  console.log('🧪 Starting Real-Time WebSocket Location Stream Verification Test...\n');
  await startServer();

  const clientSocket = Client('http://127.0.0.1:5000', {
    transports: ['polling', 'websocket'],
    reconnection: true
  });

  const testSessionId = 'SOS-WS-TEST-2026';
  let receivedUpdate = false;

  clientSocket.on('connect_error', (err) => {
    console.log('⚠️ Connect error:', err.message);
  });

  clientSocket.on('connect', () => {
    console.log(`✅ WebSocket Client Connected successfully: id=${clientSocket.id}`);

    // Subscribe to tracking session
    clientSocket.emit('sos:join-tracking', testSessionId);
    console.log(`📡 Emitted sos:join-tracking for ${testSessionId}`);

    // Listen for broadcasted location update
    clientSocket.on('sos:location-update', (data) => {
      console.log('⚡ Received WebSocket event: sos:location-update');
      console.log(`   Coordinates: ${data.lat}° N, ${data.lng}° E (Speed: ${data.speed} m/s)`);
      if (data.sessionId === testSessionId && data.lat === 28.6295) {
        receivedUpdate = true;
      }
    });

    // Stream a location update through the socket after slight delay for room join
    setTimeout(() => {
      console.log('📡 Emitting sos:stream-location via WebSocket...');
      clientSocket.emit('sos:stream-location', {
        sessionId: testSessionId,
        lat: 28.6295,
        lng: 77.2075,
        speed: 3.2,
        accuracy: 4
      });
    }, 400);
  });

  // Check result after 2.5 seconds
  setTimeout(() => {
    clientSocket.disconnect();
    server.close();

    if (receivedUpdate) {
      console.log('\n========================================================');
      console.log('🎉 WEBSOCKET REAL-TIME STREAMING TEST PASSED (100% OK)!');
      console.log('========================================================\n');
      process.exit(0);
    } else {
      console.error('\n❌ WebSocket stream failed to receive broadcast.');
      process.exit(1);
    }
  }, 2500);
};

testWebSockets();
