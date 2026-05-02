const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3001/quotations', {
      companyId: "dummy",
      customerId: "dummy",
      serviceTypeId: "dummy"
    });
    console.log(res.data);
  } catch(e) {
    console.error(e.response?.data);
  }
}
test();
