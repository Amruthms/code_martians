import jsPDF from 'jspdf';
import { Alert, Worker, Zone } from '../context/AppContext';

export function generateSafetyReport(
  reportName: string,
  reportDate: string,
  reportType: string,
  data?: {
    alerts?: Alert[];
    workers?: Worker[];
    zones?: Zone[];
    metrics?: any;
  }
): jsPDF {
  const doc = new jsPDF();
  
  // Header with brand colors
  doc.setFillColor(255, 122, 0); // Safety Orange
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Safety Intelligence Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Nordic Construction Site Safety System', 105, 30, { align: 'center' });
  
  // Report Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(reportName, 20, 60);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Type: ${reportType}`, 20, 70);
  doc.text(`Period: ${reportDate}`, 20, 77);
  doc.text(`Generated: ${new Date().toLocaleString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, 84);
  
  // Metrics Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Key Safety Metrics', 20, 100);
  
  doc.setFontSize(10);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 105, 190, 105);
  
  // Default metrics or use provided data
  const metrics = data?.metrics || [
    { label: 'Total Alerts', value: data?.alerts?.length.toString() || '63', change: '-12% from last week' },
    { label: 'Average Response Time', value: '12 minutes', change: '-3 min improvement' },
    { label: 'Resolution Rate', value: '94%', change: '+2% from last week' },
    { label: 'PPE Compliance', value: '92%', change: '+4% from last month' },
  ];
  
  let yPos = 115;
  metrics.forEach((metric: any) => {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`${metric.label}:`, 25, yPos);
    doc.setFontSize(12);
    doc.text(metric.value, 100, yPos);
    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.text(metric.change, 100, yPos + 5);
    doc.setFontSize(10);
    yPos += 15;
  });
  
  // Alert Distribution (if alerts provided)
  if (data?.alerts && data.alerts.length > 0) {
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Recent Alerts Summary', 20, yPos);
    doc.setFontSize(10);
    doc.line(20, yPos + 5, 190, yPos + 5);
    
    yPos += 15;
    const recentAlerts = data.alerts.slice(0, 8);
    
    recentAlerts.forEach((alert, index) => {
      if (yPos > 260) return; // Prevent overflow
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${alert.type}`, 25, yPos);
      doc.setTextColor(100, 100, 100);
      doc.text(`${alert.zone} • ${alert.time}`, 80, yPos);
      
      // Status badge
      const statusColor = alert.status === 'resolved' ? [34, 197, 94] : 
                         alert.status === 'acknowledged' ? [251, 191, 36] : [239, 68, 68];
      doc.setTextColor(...statusColor);
      doc.text(alert.status, 150, yPos);
      
      yPos += 8;
    });
  }
  
  // Recommendations
  yPos = Math.min(yPos + 15, 220);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Safety Recommendations', 20, yPos);
  doc.setFontSize(10);
  doc.line(20, yPos + 5, 190, yPos + 5);
  
  yPos += 15;
  const recommendations = [
    'Continue focus on helmet compliance - significant improvement noted',
    'Implement additional training for fall risk prevention',
    'Monitor vest compliance during early morning shifts',
    'Consider weather-aware safety protocols for winter months',
  ];
  
  recommendations.forEach((rec, index) => {
    if (yPos > 270) return;
    doc.setFontSize(9);
    doc.text(`${index + 1}. ${rec}`, 25, yPos);
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('AI-Powered Construction Site Safety Intelligence System', 105, 280, { align: 'center' });
  doc.text('Confidential - For Internal Use Only', 105, 285, { align: 'center' });
  
  return doc;
}

export function generateIncidentReport(alert: Alert): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(239, 68, 68); // Red for incident
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Incident Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Alert ID: ${alert.id}`, 105, 30, { align: 'center' });
  
  // Incident Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text('Incident Details', 20, 60);
  
  doc.setFontSize(11);
  const details = [
    ['Type:', alert.type],
    ['Location:', alert.zone],
    ['Worker:', alert.worker],
    ['Date:', alert.date],
    ['Time:', alert.time],
    ['Severity:', alert.severity.toUpperCase()],
    ['Status:', alert.status],
    ['Assigned To:', alert.assignedTo],
    ['Confidence:', `${alert.confidence}%`],
  ];
  
  let yPos = 75;
  details.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(label, 25, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(value, 80, yPos);
    yPos += 10;
  });
  
  // AI Report (if available)
  if (alert.aiGeneratedReport) {
    yPos += 10;
    doc.setFontSize(14);
    doc.text('AI-Generated Summary', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(alert.aiGeneratedReport, 170);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 6;
  }
  
  // Recommendations
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Follow-up Actions', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  const actions = [
    '☐ Review with worker involved',
    '☐ Update safety training materials',
    '☐ Inspect equipment/area',
    '☐ Schedule follow-up safety briefing',
  ];
  
  actions.forEach((action) => {
    doc.text(action, 25, yPos);
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
  doc.text('AI-Powered Construction Site Safety Intelligence System', 105, 285, { align: 'center' });
  
  return doc;
}

export function generateWorkerSafetyProfile(worker: Worker): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(58, 78, 122); // Steel Blue
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Worker Safety Profile', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`ID: ${worker.id}`, 105, 30, { align: 'center' });
  
  // Worker Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(worker.name, 20, 60);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Role: ${worker.role}`, 20, 70);
  doc.text(`Current Zone: ${worker.zone}`, 20, 77);
  doc.text(`Status: ${worker.status}`, 20, 84);
  
  // Safety Scores
  let yPos = 100;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Safety Performance', 20, yPos);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.text(`PPE Compliance Score: ${worker.ppeScore}%`, 25, yPos);
  yPos += 8;
  doc.text(`Overall Safety Score: ${worker.safetyScore || worker.ppeScore}%`, 25, yPos);
  yPos += 8;
  doc.text(`Gamification Points: ${worker.gamificationPoints || 0}`, 25, yPos);
  yPos += 8;
  doc.text(`Last Alert: ${worker.lastAlert}`, 25, yPos);
  
  // Training
  yPos += 15;
  doc.setFontSize(14);
  doc.text('Training Modules', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  worker.trainingModules.forEach((module) => {
    doc.text(
      `${module.completed ? '✓' : '○'} ${module.name}`,
      25,
      yPos
    );
    if (module.completed && module.score) {
      doc.text(`Score: ${module.score}%`, 120, yPos);
    }
    yPos += 7;
  });
  
  // Badges
  if (worker.badges.length > 0) {
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Earned Badges', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    worker.badges.forEach((badge) => {
      doc.text(`${badge.icon} ${badge.name}`, 25, yPos);
      doc.setTextColor(100, 100, 100);
      doc.text(`Earned: ${badge.earnedDate}`, 80, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 7;
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
  doc.text('Confidential Worker Safety Profile', 105, 285, { align: 'center' });
  
  return doc;
}
