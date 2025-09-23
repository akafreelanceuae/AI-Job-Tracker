import { JobApplication, ApplicationStats, applicationManager } from './applications';

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  fields: ExportField[];
  filters?: {
    dateRange?: { start: Date; end: Date };
    status?: string[];
    companies?: string[];
    priorities?: string[];
  };
  includeTimeline?: boolean;
  includeNotes?: boolean;
  includeDocuments?: boolean;
}

export interface ExportField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  required?: boolean;
}

export const defaultExportFields: ExportField[] = [
  { key: 'companyName', label: 'Company', type: 'string', required: true },
  { key: 'position', label: 'Position', type: 'string', required: true },
  { key: 'status', label: 'Status', type: 'string', required: true },
  { key: 'priority', label: 'Priority', type: 'string' },
  { key: 'location', label: 'Location', type: 'string' },
  { key: 'workType', label: 'Work Type', type: 'string' },
  { key: 'employmentType', label: 'Employment Type', type: 'string' },
  { key: 'appliedDate', label: 'Applied Date', type: 'date' },
  { key: 'lastUpdated', label: 'Last Updated', type: 'date' },
  { key: 'salaryRange', label: 'Salary Range', type: 'string' },
  { key: 'applicationMethod', label: 'Application Method', type: 'string' },
  { key: 'contactPerson', label: 'Contact Person', type: 'string' },
  { key: 'contactEmail', label: 'Contact Email', type: 'string' },
  { key: 'rating', label: 'Rating', type: 'number' },
  { key: 'tags', label: 'Tags', type: 'array' },
  { key: 'feedback', label: 'Feedback', type: 'string' }
];

export class DataExporter {
  // Transform application data for export
  transformApplicationData(
    applications: JobApplication[], 
    fields: ExportField[]
  ): Record<string, any>[] {
    return applications.map(app => {
      const row: Record<string, any> = {};
      
      fields.forEach(field => {
        switch (field.key) {
          case 'companyName':
            row[field.label] = app.companyName;
            break;
          case 'position':
            row[field.label] = app.position;
            break;
          case 'status':
            row[field.label] = app.status.replace('_', ' ').toUpperCase();
            break;
          case 'priority':
            row[field.label] = app.priority.toUpperCase();
            break;
          case 'location':
            row[field.label] = app.location;
            break;
          case 'workType':
            row[field.label] = app.workType.replace('_', ' ');
            break;
          case 'employmentType':
            row[field.label] = app.employmentType.replace('_', ' ');
            break;
          case 'appliedDate':
            row[field.label] = app.appliedDate.toLocaleDateString();
            break;
          case 'lastUpdated':
            row[field.label] = app.lastUpdated.toLocaleDateString();
            break;
          case 'salaryRange':
            row[field.label] = app.salaryRange 
              ? `${app.salaryRange.currency} ${app.salaryRange.min.toLocaleString()} - ${app.salaryRange.max.toLocaleString()}`
              : '';
            break;
          case 'applicationMethod':
            row[field.label] = app.applicationMethod.replace('_', ' ');
            break;
          case 'contactPerson':
            row[field.label] = app.contactPerson || '';
            break;
          case 'contactEmail':
            row[field.label] = app.contactEmail || '';
            break;
          case 'rating':
            row[field.label] = app.rating;
            break;
          case 'tags':
            row[field.label] = app.tags.join(', ');
            break;
          case 'feedback':
            row[field.label] = app.feedback || '';
            break;
          default:
            row[field.label] = '';
        }
      });
      
      return row;
    });
  }

  // Generate CSV content
  generateCSV(data: Record<string, any>[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape CSV values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Download CSV file
  downloadCSV(data: Record<string, any>[], filename: string = 'job-applications.csv'): void {
    const csvContent = this.generateCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Export applications based on options
  async exportApplications(options: ExportOptions): Promise<void> {
    const applications = applicationManager.getApplications();
    let filteredApplications = applications;

    // Apply filters
    if (options.filters) {
      const { dateRange, status, companies, priorities } = options.filters;
      
      filteredApplications = applications.filter(app => {
        if (dateRange) {
          if (app.appliedDate < dateRange.start || app.appliedDate > dateRange.end) {
            return false;
          }
        }
        
        if (status && status.length > 0 && !status.includes(app.status)) {
          return false;
        }
        
        if (companies && companies.length > 0 && !companies.includes(app.companyName)) {
          return false;
        }
        
        if (priorities && priorities.length > 0 && !priorities.includes(app.priority)) {
          return false;
        }
        
        return true;
      });
    }

    const transformedData = this.transformApplicationData(filteredApplications, options.fields);
    
    switch (options.format) {
      case 'csv':
        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadCSV(transformedData, `job-applications-${timestamp}.csv`);
        break;
      case 'excel':
        // For Excel, we'll use CSV format with .xlsx extension
        // In a real app, you'd use a library like XLSX
        const excelTimestamp = new Date().toISOString().split('T')[0];
        this.downloadCSV(transformedData, `job-applications-${excelTimestamp}.xlsx`);
        break;
      case 'pdf':
        await this.generatePDFReport(filteredApplications, options);
        break;
    }
  }

  // Generate PDF report (simplified version)
  async generatePDFReport(applications: JobApplication[], options: ExportOptions): Promise<void> {
    // This is a simplified PDF generation
    // In a real app, you'd use a library like jsPDF or Puppeteer
    const stats = applicationManager.getApplicationStats();
    
    let htmlContent = `
      <html>
        <head>
          <title>Job Applications Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; }
            .stat-card { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .stat-number { font-size: 2em; font-weight: bold; color: #3b82f6; }
            .stat-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; font-weight: 600; }
            .status-applied { color: #3b82f6; }
            .status-interview { color: #8b5cf6; }
            .status-offer { color: #10b981; }
            .status-rejected { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Job Applications Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Total Applications: ${applications.length}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">${stats.total}</div>
              <div class="stat-label">Total Applications</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.responseRate.toFixed(1)}%</div>
              <div class="stat-label">Response Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.interviewRate.toFixed(1)}%</div>
              <div class="stat-label">Interview Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.offerRate.toFixed(1)}%</div>
              <div class="stat-label">Offer Rate</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Location</th>
                <th>Salary Range</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    applications.forEach(app => {
      const statusClass = app.status.includes('interview') ? 'status-interview' :
                         app.status === 'applied' ? 'status-applied' :
                         app.status.includes('offer') ? 'status-offer' :
                         app.status === 'rejected' ? 'status-rejected' : '';
                         
      htmlContent += `
        <tr>
          <td>${app.companyName}</td>
          <td>${app.position}</td>
          <td class="${statusClass}">${app.status.replace('_', ' ').toUpperCase()}</td>
          <td>${app.appliedDate.toLocaleDateString()}</td>
          <td>${app.location}</td>
          <td>${app.salaryRange ? `${app.salaryRange.currency} ${app.salaryRange.min.toLocaleString()} - ${app.salaryRange.max.toLocaleString()}` : 'Not specified'}</td>
          <td>${'★'.repeat(app.rating)}${'☆'.repeat(5 - app.rating)}</td>
        </tr>
      `;
    });
    
    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Create and download HTML file (in a real app, this would be converted to PDF)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-applications-report-${new Date().toISOString().split('T')[0]}.html`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Generate summary statistics for reporting
  generateSummaryStats(): ApplicationStats & {
    topCompanies: Array<{ name: string; count: number }>;
    topLocations: Array<{ name: string; count: number }>;
    monthlyTrend: Array<{ month: string; applications: number }>;
  } {
    const applications = applicationManager.getApplications();
    const baseStats = applicationManager.getApplicationStats();
    
    // Top companies
    const companyCount = applications.reduce((acc, app) => {
      acc[app.companyName] = (acc[app.companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCompanies = Object.entries(companyCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Top locations
    const locationCount = applications.reduce((acc, app) => {
      acc[app.location] = (acc[app.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topLocations = Object.entries(locationCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Monthly trend
    const monthlyCount = applications.reduce((acc, app) => {
      const month = app.appliedDate.toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const monthlyTrend = Object.entries(monthlyCount)
      .map(([month, applications]) => ({ month, applications }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
    
    return {
      ...baseStats,
      topCompanies,
      topLocations,
      monthlyTrend
    };
  }
}

// Global data exporter instance
export const dataExporter = new DataExporter();