import { DeclarationDraft } from './types';

export interface DeclarationTemplate {
  id: string;
  category: string;
  title: string;
  defaultText: (vars: DeclarationVariables) => string;
}

export interface DeclarationVariables {
  supplierName: string;
  customerName?: string;
  address?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  date?: string;
  pan?: string;
  gstin?: string;
}

export const DECLARATION_TEMPLATES: Record<string, DeclarationTemplate> = {
  debarment: {
    id: 'debarment',
    category: 'Declarations',
    title: 'Self-Declaration of Non-Blacklisting & Non-Debarment',
    defaultText: (vars) => `[TO BE PRINTED ON COMPANY LETTERHEAD]
DRAFT — REVIEW AND CONFIRM ACCURACY BEFORE SIGNING AND STAMPING

Date: ${vars.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

To:
The Vendor Evaluation Committee / Procurement Department
${vars.customerName || 'The Requesting Organization'}

Subject: Declaration regarding Non-Blacklisting and Non-Debarment

Dear Sir/Madam,

We, ${vars.supplierName || 'our enterprise'}, having our registered office at ${vars.address || '[Registered Business Address]'} (PAN: ${vars.pan || '[PAN]'}, GSTIN: ${vars.gstin || '[GSTIN]'}), hereby solemnly affirm, declare, and state as follows:

1. We have neither been blacklisted, debarred, suspended, nor subjected to any disqualification proceedings by any Central / State Government Department, Public Sector Undertaking (PSU), Autonomous Body, or Corporate Client as of the date of this declaration.

2. There are no ongoing punitive, statutory, or disciplinary proceedings initiated against us that impede our legal capacity to contract or perform commercial obligations.

3. We affirm that all statements, documents, and credentials submitted for vendor onboarding/empanelment with ${vars.customerName || 'your organization'} are authentic, true, and verifiable.

4. If any information provided herein is subsequently found to be misleading, inaccurate, or false, ${vars.customerName || 'your organization'} shall be entitled to initiate appropriate commercial or contract actions in accordance with applicable guidelines.

Yours faithfully,
For ${vars.supplierName || '[Supplier Name]'}



_____________________________________________
Authorized Signatory: ${vars.signatoryName || '[Authorized Signatory]'}
Designation: ${vars.signatoryTitle || 'Proprietor / Partner / Director'}
Company Seal / Stamp`
  },

  anti_bribery: {
    id: 'anti_bribery',
    category: 'Declarations',
    title: 'Code of Conduct & Anti-Bribery Undertaking',
    defaultText: (vars) => `[TO BE PRINTED ON COMPANY LETTERHEAD]
DRAFT — REVIEW AND CONFIRM ACCURACY BEFORE SIGNING AND STAMPING

Date: ${vars.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

To:
The Procurement & Ethics Committee
${vars.customerName || 'The Requesting Organization'}

Subject: Undertaking of Ethical Conduct, Anti-Bribery, and Integrity

We, ${vars.supplierName || 'our enterprise'}, hereby confirm our adherence to fair trade practices and zero tolerance towards corrupt or unethical behaviors in all commercial interactions with ${vars.customerName || 'your organization'}.

We solemnly state and undertake that:
1. Neither our firm, partners, directors, employees, nor our designated agents have offered, promised, given, or agreed to give any illicit inducement, kickback, gift, or undue favor to any representative of ${vars.customerName || 'your organization'}.
2. We maintain independent pricing and have not entered into any anti-competitive arrangement or collusive cartel in relation to our supply and service offerings.
3. We agree to disclose any actual or perceived conflict of interest immediately upon identification.

Yours faithfully,
For ${vars.supplierName || '[Supplier Name]'}



_____________________________________________
Authorized Signatory: ${vars.signatoryName || '[Authorized Signatory]'}
Designation: ${vars.signatoryTitle || 'Authorized Representative'}
Company Seal / Stamp`
  },

  proprietorship: {
    id: 'proprietorship',
    category: 'Declarations',
    title: 'Declaration of Sole Proprietorship & Bank Account Ownership',
    defaultText: (vars) => `[TO BE PRINTED ON LETTERHEAD]
DRAFT — REVIEW AND CONFIRM ACCURACY BEFORE SIGNING AND STAMPING

Date: ${vars.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

To:
Accounts Payable / Vendor Registration Desk
${vars.customerName || 'The Requesting Organization'}

Subject: Declaration of Sole Proprietorship & Commercial Banking Alignment

I, ${vars.signatoryName || '[Proprietor Name]'}, residing at ${vars.address || '[Residential / Office Address]'}, do hereby confirm and declare:

1. I am the Sole Proprietor carrying on business under the trade name style of "${vars.supplierName || '[Trade Name]'}".
2. The Permanent Account Number (PAN) issued to me in my individual capacity is ${vars.pan || '[PAN]'}, which is identical to the PAN embedded in our GST Registration Certificate (GSTIN: ${vars.gstin || '[GSTIN]'}).
3. The bank account furnished for digital payments (NEFT/RTGS) belongs to the firm / proprietor and is legitimately maintained for business transactions.

Yours sincerely,



_____________________________________________
Signature of Sole Proprietor: ${vars.signatoryName || '[Proprietor Name]'}
Trade Name: ${vars.supplierName || '[Trade Name]'}
Seal / Stamp`
  },

  msme_applicability: {
    id: 'msme_applicability',
    category: 'Declarations',
    title: 'MSME Status & Udyam Applicability Confirmation',
    defaultText: (vars) => `[TO BE PRINTED ON COMPANY LETTERHEAD]
DRAFT — REVIEW AND CONFIRM ACCURACY BEFORE SIGNING AND STAMPING

Date: ${vars.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

To:
Finance & Accounts Department
${vars.customerName || 'The Requesting Organization'}

Subject: Confirmation of Enterprise Category under MSMED Act, 2006

Dear Sir/Madam,

This is to formally certify that our enterprise, ${vars.supplierName || '[Supplier Name]'}, is registered under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006.

Our statutory classification details are as follows:
• Enterprise Registration Name: ${vars.supplierName || '[Registered Name]'}
• Udyam Registration Number: [UDYAM-XX-00-0000000]
• Category of Enterprise: Micro / Small Enterprise
• Major Activity: Manufacturing / Services

A self-attested copy of our current Udyam Registration Certificate is enclosed for your records.

Yours faithfully,
For ${vars.supplierName || '[Supplier Name]'}



_____________________________________________
Authorized Signatory: ${vars.signatoryName || '[Authorized Signatory]'}
Designation: ${vars.signatoryTitle || 'Proprietor / Partner / Director'}
Company Seal / Stamp`
  }
};

export function draftDeclaration(
  templateKey: 'debarment' | 'anti_bribery' | 'proprietorship' | 'msme_applicability' | string,
  requirementId: string,
  variables: DeclarationVariables
): DeclarationDraft {
  const template = DECLARATION_TEMPLATES[templateKey] || DECLARATION_TEMPLATES.debarment;
  const draftId = `decl_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id: draftId,
    requirementId,
    title: template.title,
    category: template.category,
    text: template.defaultText(variables),
    status: 'DRAFT',
    isIncludedInPack: true,
    variables: {
      supplierName: variables.supplierName,
      customerName: variables.customerName,
      address: variables.address,
      signatoryName: variables.signatoryName,
      signatoryTitle: variables.signatoryTitle,
      date: variables.date || new Date().toISOString().split('T')[0]
    }
  };
}
