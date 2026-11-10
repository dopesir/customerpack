import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/packs/route';

async function testPackCreation() {
  console.log('Testing Pack Creation without file...');
  try {
    const formData = new FormData();
    formData.append('supplierName', 'Precision Engineering Pvt Ltd');
    formData.append('customerName', 'Havells India');
    formData.append('submissionRef', 'RFQ-2026-09');
    formData.append('deadline', '2026-09-15');

    const req = new NextRequest('http://localhost:3000/api/packs', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    const data = await res.json();
    console.log('Status code:', res.status);
    console.log('Response success:', data.success, 'Pack ID:', data.pack?.id);
    if (!data.success) console.log('Error:', data.error);
  } catch (err) {
    console.error('Test error without file:', err);
  }

  console.log('\nTesting Pack Creation WITH sample PDF file...');
  try {
    const formData = new FormData();
    formData.append('supplierName', 'Precision Engineering Pvt Ltd');
    formData.append('customerName', 'Havells India');
    
    const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    formData.append('files', blob, 'Customer_Vendor_Requirements.pdf');

    const req = new NextRequest('http://localhost:3000/api/packs', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    const data = await res.json();
    console.log('Status code with file:', res.status);
    console.log('Response success with file:', data.success, 'Pack ID:', data.pack?.id);
    if (!data.success) console.log('Error with file:', data.error);
  } catch (err) {
    console.error('Test error with file:', err);
  }
}

testPackCreation();
