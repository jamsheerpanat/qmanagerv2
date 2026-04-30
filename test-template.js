async function run() {
  try {
    const res = await fetch('http://localhost:3001/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@qmanager.local', password: 'Admin@123' }) 
    });
    const data = await res.json();
    const token = data.access_token;
    
    // First let's get the templates
    const tmplRes = await fetch('http://localhost:3001/settings/templates', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const templates = await tmplRes.json();
    console.log("Templates:", templates.length);
    if(templates.length > 0) {
      const t = templates[0];
      const patchRes = await fetch(`http://localhost:3001/settings/templates/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description: "Test update" })
      });
      console.log("Patch Template:", patchRes.status, await patchRes.text());
    }
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
