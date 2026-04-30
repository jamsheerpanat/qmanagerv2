async function run() {
  try {
    const res = await fetch('http://localhost:3001/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@qmanager.local', password: 'Admin@123' }) 
    });
    const data = await res.json();
    const token = data.access_token;
    
    // Test ai-summarize
    const aiRes = await fetch('http://localhost:3001/quotations/ff39c840-e40f-4dd4-8044-c97cd4b604d2/ai-summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    console.log("AI Summarize:", aiRes.status, await aiRes.text());
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
