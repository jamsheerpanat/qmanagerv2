async function run() {
  try {
    const res = await fetch('http://localhost:3001/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@qmanager.local', password: 'Admin@123' }) 
    });
    const data = await res.json();
    const token = data.access_token;
    
    // First let's test submit-for-approval
    const subRes = await fetch('http://localhost:3001/quotations/ff39c840-e40f-4dd4-8044-c97cd4b604d2/submit-for-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    console.log("Submit:", subRes.status, await subRes.text());
    
    // Then approve
    const appRes = await fetch('http://localhost:3001/quotations/ff39c840-e40f-4dd4-8044-c97cd4b604d2/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ comments: "Test" })
    });
    console.log("Approve:", appRes.status, await appRes.text());
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
