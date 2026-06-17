import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { generateCSVString, generatePDFReportStream, uploadToGCS } from '../services/exportService';

const router = Router();

// GET /export/csv - Export carbon activity log in CSV format
router.get('/csv', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const csvContent = await generateCSVString(uid);

    if (req.query.stream === 'true') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ecotrace_export_${Date.now()}.csv"`);
      return res.send(csvContent);
    }

    try {
      // Attempt to save to Cloud Storage and return Signed URL
      const filename = `ecotrace_export_${Date.now()}.csv`;
      const url = await uploadToGCS(uid, filename, csvContent, 'text/csv');
      return res.json({ url });
    } catch (gcsErr) {
      console.warn('GCS upload for CSV failed, falling back to direct stream response:', gcsErr);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ecotrace_export_${Date.now()}.csv"`);
      return res.send(csvContent);
    }
  } catch (err) {
    next(err);
  }
});

// GET /export/pdf - Export monthly footprint report in PDF format
router.get('/pdf', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const pdfDoc = await generatePDFReportStream(uid);

    if (req.query.stream === 'true') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ecotrace_report_${Date.now()}.pdf"`);
      pdfDoc.pipe(res);
      pdfDoc.end();
      return;
    }

    // Collect buffer to upload to GCS
    const buffers: Buffer[] = [];
    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    
    pdfDoc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      try {
        const filename = `ecotrace_report_${Date.now()}.pdf`;
        const url = await uploadToGCS(uid, filename, pdfBuffer, 'application/pdf');
        return res.json({ url });
      } catch (gcsErr) {
        console.warn('GCS upload for PDF failed, streaming directly in response:', gcsErr);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ecotrace_report_${Date.now()}.pdf"`);
        return res.end(pdfBuffer);
      }
    });

    pdfDoc.on('error', (err) => {
      next(err);
    });

    pdfDoc.end();
  } catch (err) {
    next(err);
  }
});

export default router;
