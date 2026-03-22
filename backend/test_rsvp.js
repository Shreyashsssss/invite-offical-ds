const http = require('http');

const data = JSON.stringify({
  guestName: 'Antigravity Test',
  guestEmail: 'test@antigravity.ai',
  guestPhone: '1234567890',
  signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/rsvp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response body:', body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
