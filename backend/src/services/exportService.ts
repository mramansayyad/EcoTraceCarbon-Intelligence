import { storage, db } from '../config/firebase-admin';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';
import { Activity } from '../models/Activity';
import { getDashboardData } from './dashboardService';
import { generateWeeklyInsights } from './geminiService';
import { getDaysAgo } from '../utils/dateHelpers';

export async function generateCSVString(uid: string): Promise<string> {
  const activitiesSnapshot = await db.collection('activities')
    .where('uid', '==', uid)
    .orderBy('timestamp', 'desc')
    .get();

  const activities = activitiesSnapshot.docs.map(doc => doc.data() as Activity);

  const csvData = activities.map(act => ({
    Timestamp: act.timestamp,
    Category: act.category,
    Subcategory: act.subcategory,
    Value: act.value,
    Details: JSON.stringify(act.details),
    'Emissions (kg CO2e)': act.kg_co2e
  }));

  return stringify(csvData, {
    header: true,
    columns: ['Timestamp', 'Category', 'Subcategory', 'Value', 'Details', 'Emissions (kg CO2e)']
  });
}

export async function generatePDFReportStream(uid: string): Promise<PDFKit.PDFDocument> {
  const doc = new PDFDocument({ margin: 50 });

  // Title
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#111A14').text('EcoTrace Carbon Footprint Report', { align: 'center' });
  doc.moveDown();

  // Date generated
  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#86EFAC').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown(2);

  // Fetch Dashboard Stats & Profile
  const dashboard = await getDashboardData(uid);
  const userDoc = await db.collection('users').doc(uid).get();
  const userName = userDoc.exists ? (userDoc.data()?.displayName || 'EcoTrace User') : 'EcoTrace User';

  // Section 1: User Context
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#111A14').text(`Report for: ${userName}`);
  doc.moveDown();

  // Section 2: Summary Stats
  doc.fontSize(12).font('Helvetica-Bold').text('Monthly Statistics:');
  doc.fontSize(10).font('Helvetica').text(`- Total logged emissions this month: ${dashboard.stats.month.value} kg CO2e`);
  doc.text(`- Emissions relative to National Average: ${dashboard.stats.month.vsNationalAvgPct}%`);
  doc.text(`- Current daily streak: ${dashboard.stats.streak.days} days`);
  doc.moveDown(1.5);

  // Section 3: AI Narrative
  doc.fontSize(12).font('Helvetica-Bold').text('AI Climate Insights:');
  let insightText = '';
  if (userDoc.exists && userDoc.data()?.lastInsight) {
    insightText = userDoc.data()?.lastInsight;
  } else {
    // Generate simple static narrative if no insight generated
    insightText = `Based on your logging, transport and food represent your primary carbon sources. Swapping to public transit and vegetarian meals can significantly reduce your footprint.`;
  }
  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#1F2E22').text(insightText, { width: 500 });
  doc.moveDown(2);

  // Section 4: Recent Activities Table
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111A14').text('Recent Activities Log:');
  doc.moveDown(0.5);

  // Draw table header
  const tableTop = doc.y;
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Date', 50, tableTop);
  doc.text('Category', 150, tableTop);
  doc.text('Subcategory', 250, tableTop);
  doc.text('Value', 370, tableTop);
  doc.text('Emissions (kg)', 450, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#86EFAC').stroke();

  let y = tableTop + 25;
  doc.fontSize(9).font('Helvetica');

  dashboard.recentActivities.slice(0, 15).forEach(act => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    const dateStr = act.timestamp.split('T')[0];
    doc.text(dateStr, 50, y);
    doc.text(act.category, 150, y);
    doc.text(act.subcategory, 250, y);
    doc.text(`${act.value}`, 370, y);
    doc.text(`${act.kg_co2e.toFixed(2)}`, 450, y);
    y += 20;
  });

  return doc;
}

export async function uploadToGCS(uid: string, filename: string, content: Buffer | string, contentType: string): Promise<string> {
  const bucketName = `ecotrace-exports-${process.env.GCP_PROJECT_ID || 'virtual-promptwars-492614'}`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(`${uid}/${filename}`);

  await file.save(content, {
    contentType,
    resumable: false,
    metadata: {
      cacheControl: 'public, max-age=86400',
    }
  });

  // Get signed URL expiring in 24 hours
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  return url;
}
