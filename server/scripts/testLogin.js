async function testLogin(port) {
    const url = `http://localhost:${port}/auth/login`;
    console.log(`Attempting login on port ${port}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`✅ Login successful on port ${port}!`);
            console.log('Token:', data.token ? 'Received' : 'Missing');
            return true;
        } else {
            console.error(`❌ Login failed on port ${port}:`, data);
            return false;
        }
    } catch (error) {
        console.log(`⚠️ Could not connect to port ${port}: ${error.message}`);
        return false;
    }
}

async function main() {
    const ports = [3001, 3000];
    for (const port of ports) {
        if (await testLogin(port)) return;
    }
    console.error('❌ Could not login on any common port.');
}

main();
