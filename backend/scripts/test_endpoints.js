const http = require('http');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('=== 1. Checking GET /api/templates ===');
  const tRes = await getJson('http://localhost:5000/api/templates');
  console.log('Templates status:', tRes.status);
  const firstTmpl = tRes.data?.templates?.[0];
  console.log('Sample template ID:', firstTmpl?.id, 'has target_face_url property:', 'target_face_url' in (firstTmpl || {}));

  console.log('\n=== 2. Checking POST /api/generate/photoshoot validation ===');
  const psRes = await postJson('http://localhost:5000/api/generate/photoshoot', {});
  console.log('Photoshoot empty body status (expect 400):', psRes.status);
  console.log('Photoshoot message:', psRes.data?.message);

  console.log('\n=== 3. Checking POST /api/generate/remix validation ===');
  const remixRes = await postJson('http://localhost:5000/api/generate/remix', {});
  console.log('Remix empty body status (expect 400):', remixRes.status);
  console.log('Remix message:', remixRes.data?.message);

  console.log('\n=== ALL ENDPOINT CHECKS COMPLETE ===');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});
