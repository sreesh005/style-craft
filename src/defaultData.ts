import initialPropertiesJson from "../data/properties.json";
import { PropertyTaxRecord, UserProfile, CompanyPortfolio, EmailNotification, MonitoringSettings } from "./propertyTypes";

export const initialProperties: PropertyTaxRecord[] = initialPropertiesJson as PropertyTaxRecord[];

export const defaultMonitoringSettings: MonitoringSettings = {
  autoCheckEnabled: true,
  checkFrequencyHours: 24,
  checkTimeOfDay: "06:00 AM CST",
  recipientEmail: "sreeshkanala@gmail.com",
  recipientName: "Sreesh Kanala",
  notifyOnAppraisalNotice: true,
  notifyOnValuationIncrease: true,
  notifyOnProtestDeadline: true,
  notifyOnTaxBill: true,
  lastSweepTimestamp: new Date().toISOString(),
  nextSweepTimestamp: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
};

export const defaultUser: UserProfile = {

  id: "usr_101",
  email: "sreeshkanala@gmail.com",
  name: "Sreesh Kanala",
  companyName: "Stylecraft Builders Inc",
  companyId: "stylecraft",
  role: "Tax Administrator",
  isLoggedIn: true,
  googleConnected: true
};

export const defaultCompanies: CompanyPortfolio[] = [
  {
    id: "stylecraft",
    name: "Stylecraft Builders Inc",
    legalEntities: [
      "Stylecraft Builders Inc",
      "Stylecraft Falcon Pointe LP",
      "Stylecraft Central Texas LP",
      "Stylecraft East Texas LLC",
      "Ranier & Son Development LLC"
    ],
    counties: ["Brazos", "Burleson", "Grimes", "Montgomery", "Walker", "Washington", "McLennan", "Bell", "Lampasas", "Williamson", "Guadalupe", "Smith"],
    totalProperties: 622,
    createdDate: "2026-01-01",
    isDemo: true
  }
];

export const defaultNotifications: EmailNotification[] = [
  {
    id: "notif_1",
    timestamp: new Date().toISOString(),
    recipientEmail: "sreeshkanala@gmail.com",
    companyName: "Stylecraft Builders Inc",
    subject: "🔍 CAD Audit Daily Tracker: 600 Active Inventory Properties Online",
    updateType: "daily_sync_summary",
    propertyCount: 622,
    detailsSummary: "Daily CAD synchronization completed across 12 Central Texas counties. All inventory records verified against CAD registers.",
    bodyHtml: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-top: 0;">CAD Property Tax Daily Monitor Report</h2>
        <p>Hello <b>Sreesh</b>,</p>
        <p>The <b>CAD Audit Daily Pipeline</b> successfully swept 12 Central Texas Appraisal Districts today for <b>Stylecraft Builders Inc</b>.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 15px 0;">
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 8px; text-align: left;">County</th>
            <th style="padding: 8px; text-align: left;">Tracked Properties</th>
            <th style="padding: 8px; text-align: left;">Stage</th>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px;">Brazos</td><td style="padding: 8px;">180</td><td style="padding: 8px; color: #059669; font-weight: bold;">Protest & Rendering</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px;">Grimes</td><td style="padding: 8px;">60</td><td style="padding: 8px; color: #059669; font-weight: bold;">Notice Issued</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px;">McLennan</td><td style="padding: 8px;">90</td><td style="padding: 8px; color: #d97706; font-weight: bold;">Protest Hearing</td></tr>
        </table>
        <p>Log into your CAD Audit Dashboard to view updated appraisals, protest deadlines, and tax statement receipts.</p>
      </div>
    `,
    read: false
  }
];
