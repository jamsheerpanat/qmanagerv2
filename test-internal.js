async function run() {
  try {
    const res = await fetch('http://localhost:3001/internal/quotations/ff39c840-e40f-4dd4-8044-c97cd4b604d2', {
      headers: { 'x-internal-pdf-render': '1' }
    });
    console.log("Internal fetch:", res.status, await res.text());
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
