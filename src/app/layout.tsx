import type { Metadata } from 'next';
import '@/styles/globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nobuswork.pages.dev';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Customer Pack — Self-Serve Vendor Empanelment Preparation | Nobuswork',
    template: '%s | Customer Pack by Nobuswork'
  },
  description:
    "Your customer's requirements, your rules. Upload your customer's onboarding criteria and your supplier documents. Customer Pack runs configurable preflight checks and compiles a single, indexed submission dossier.",
  alternates: {
    canonical: '/'
  },
  keywords: [
    'Customer Pack',
    'Nobuswork',
    'vendor empanelment pack',
    'vendor registration checklist',
    'supplier onboarding preparation',
    'GST PAN cancelled cheque check',
    'vendor registration dossier India',
    'procurement preflight utility',
    'RFQ vendor compliance',
    'corporate procurement checklist matcher',
    'statutory undertakings drafter'
  ],
  authors: [{ name: 'Nobuswork', url: appUrl }],
  creator: 'Nobuswork',
  publisher: 'Nobuswork',
  openGraph: {
    title: 'Customer Pack by Nobuswork — Self-Serve Vendor Empanelment Preparation',
    description:
      "Your customer's requirements, your rules. Run document preflight checks and assemble an indexed vendor submission dossier.",
    url: appUrl,
    siteName: 'Customer Pack by Nobuswork',
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Pack by Nobuswork — Self-Serve Vendor Empanelment Preparation',
    description:
      "Your customer's requirements, your rules. Run preflight checks and compile an indexed submission pack."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  other: {
    'geo.region': 'IN',
    'geo.placename': 'India',
    'geo.position': '20.5937;78.9629',
    'ICBM': '20.5937, 78.9629'
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${appUrl}/#software`,
      name: 'Customer Pack',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All (Web Browser)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Free Preflight Verification & Customer Checklist Matching'
      },
      featureList: [
        'Customer onboarding requirement extraction & checklist matching',
        'Statutory cross-verification (GSTIN, PAN, Bank Proof, MSME)',
        'Built-in statutory undertaking generator (Non-Debarment, Anti-Bribery)',
        'Single-click dual PDF compilation (Preflight Report + Submission Dossier)',
        '100% ephemeral in-memory security with 1-click wipe'
      ],
      description:
        'Customer Pack by Nobuswork allows B2B suppliers to match customer registration criteria against their documents, draft required declarations, and compile a verified submission dossier.'
    },
    {
      '@type': 'Organization',
      '@id': `${appUrl}/#organization`,
      name: 'Nobuswork',
      url: appUrl,
      areaServed: {
        '@type': 'Country',
        name: 'India'
      },
      knowsAbout: [
        'B2B Vendor Empanelment',
        'Customer Onboarding Requirements',
        'Statutory Declarations',
        'GST and PAN Compliance',
        'Procurement Dossier Compilation'
      ]
    },
    {
      '@type': 'FAQPage',
      '@id': `${appUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does Customer Pack guarantee my customer will approve me as a vendor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Customer Pack is a preparation, validation, and assembly instrument. It checks your records against rules you configure and customer requirements you upload. Final commercial and empanelment approval rests entirely with the requesting customer.'
          }
        },
        {
          '@type': 'Question',
          name: 'What formats can I upload for customer requirements?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can upload customer vendor registration checklists, RFQ instructions, vendor questionnaires, or buyer onboarding guidelines in PDF, Word (DOCX), Excel (XLSX, XLS), or image (PNG, JPG) formats.'
          }
        },
        {
          '@type': 'Question',
          name: 'How does Customer Pack match documents if the customer uses different wording?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Customer Pack maps requested items against standard Indian statutory records (GST REG-06, PAN Card, Cancelled Cheque, MSME Udyam, Incorporation/COI, Partnership Deeds, ISO certificates). You can manually review, reassign, or add custom requirements at any point.'
          }
        },
        {
          '@type': 'Question',
          name: 'What happens to my uploaded business documents after I finish?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Customer Pack operates on an ephemeral in-memory model. Files are retained for a maximum of 48 hours for your private session and can be permanently wiped immediately at any time with the 1-click "Delete This Pack" button.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I draft custom undertakings on my company letterhead?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Customer Pack includes built-in Indian statutory templates (Non-Blacklisting / Debarment, Anti-Bribery & Code of Conduct, Sole Proprietorship, and MSME Applicability). You can edit them live, copy text to your clipboard, or have them typeset directly into the compiled PDF dossier.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I still compile the dossier if an item is missing or flagged?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Customer Pack never blocks you from assembling your pack. It surfaces clear findings in your preflight matrix so you can make informed decisions before submitting to your customer.'
          }
        }
      ]
    },
    {
      '@type': 'HowTo',
      '@id': `${appUrl}/#howto`,
      name: 'How to Assemble a Customer-Specific Vendor Empanelment Pack',
      description: 'Step-by-step procedure to align supplier documents with specific customer onboarding criteria.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Specify Customer Criteria',
          text: 'Upload or paste your customer onboarding instructions or RFQ document checklist.'
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Attach Supplier Records & Review Matrix',
          text: 'Provide statutory company documents; Customer Pack matches them to customer requirements and checks cross-document consistency.'
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Draft Declarations & Compile Dossier',
          text: 'Customize pre-drafted statutory undertakings and compile an indexed PDF submission dossier ready for the customer procurement team.'
        }
      ]
    }
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#FAFAFA] text-neutral-900 min-h-screen flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
