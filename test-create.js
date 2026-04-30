async function run() {
  try {
    const res = await fetch('http://localhost:3001/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@qmanager.local', password: 'Admin@123' }) 
    });
    const data = await res.json();
    const token = data.access_token;
    
    const createRes = await fetch('http://localhost:3001/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        companyId: "163cec9c-b727-42c7-ac1d-4c09fe007c69",
        customerId: "f5790172-37e3-4a92-ba8e-fe5792ba501a",
        serviceTypeId: "5581c144-1ccb-4605-aa51-48e06b5593c2",
        projectTitle: "Test",
        projectLocation: "Test",
        scopeSummary: "Testing scope"
      })
    });
    console.log("Create Quotation:", createRes.status, await createRes.text());
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
