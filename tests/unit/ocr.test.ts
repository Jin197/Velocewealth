import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the 'server-only' Next.js package so Vitest can import it cleanly
vi.mock('server-only', () => ({}));

// Prefix variables with 'mock' so they can be accessed inside vi.mock (Vitest hoisting rule)
const mockTextDetection = vi.fn();
const mockBatchAnnotateFiles = vi.fn();

vi.mock('@google-cloud/vision', () => {
  class ImageAnnotatorClientMock {
    textDetection = mockTextDetection;
    batchAnnotateFiles = mockBatchAnnotateFiles;
  }

  return {
    ImageAnnotatorClient: ImageAnnotatorClientMock,
  };
});

import { parseFuelReceipt } from '@/lib/ocr';

// Mock the env module to avoid throwing for credentials in test context
vi.mock('@/lib/env', () => {
  return {
    env: {
      googleVisionCredentials: () => JSON.stringify({ type: 'service_account', project_id: 'test' }),
    },
  };
});

describe('Google Cloud Vision OCR Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully parses an image receipt (JPEG/PNG) for Gasoline (SP95)', async () => {
    const mockRawText = `
      TotalEnergies Access
      Relais Lyon Nord
      69009 LYON
      
      CARBURANT: Sans Plomb 95
      Quantite: 35.00 L
      Prix unitaire: 1.849 EUR/L
      TOTAL A PAYER: 64.72 EUR
      Merci de votre visite !
    `;

    mockTextDetection.mockResolvedValue([
      {
        fullTextAnnotation: {
          text: mockRawText,
          pages: [
            {
              confidence: 0.98,
            },
          ],
        },
      },
    ]);

    const dummyImageBuffer = Buffer.from('fake-image-bytes');
    const result = await parseFuelReceipt(dummyImageBuffer);

    expect(mockTextDetection).toHaveBeenCalledWith({
      image: { content: dummyImageBuffer },
    });
    expect(mockBatchAnnotateFiles).not.toHaveBeenCalled();

    expect(result).toEqual({
      energyType: 'gasoline',
      quantity: 35,
      unitPrice: 1.849,
      totalPrice: 64.72,
      stationName: 'TotalEnergies',
      stationCity: 'LYON',
      confidence: 98,
      raw: mockRawText,
    });
  });

  it('successfully parses a PDF receipt using batchAnnotateFiles for Diesel', async () => {
    const mockRawText = `
      Esso Express
      Avenue d'Italie
      75013 Paris
      
      Produit: Diesel / Gazole
      Volume: 45.20 L
      PU: 1.699 EUR
      MONTANT TOTAL TTC: 76.79 €
    `;

    mockBatchAnnotateFiles.mockResolvedValue([
      {
        responses: [
          {
            responses: [
              {
                fullTextAnnotation: {
                  text: mockRawText,
                  pages: [
                    {
                      confidence: 0.95,
                    },
                  ],
                },
              },
            ],
          },
        ],
      } as any,
    ]);

    // Create a buffer starting with '%PDF' to trigger the PDF pathway
    const dummyPdfBuffer = Buffer.from('%PDF-1.4\n%...fake-pdf-content');
    const result = await parseFuelReceipt(dummyPdfBuffer);

    expect(mockBatchAnnotateFiles).toHaveBeenCalledWith({
      requests: [
        {
          inputConfig: { content: dummyPdfBuffer, mimeType: 'application/pdf' },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          pages: [1],
        },
      ],
    });
    expect(mockTextDetection).not.toHaveBeenCalled();

    expect(result).toEqual({
      energyType: 'diesel',
      quantity: 45.2,
      unitPrice: 1.699,
      totalPrice: 76.79,
      stationName: 'Esso',
      stationCity: 'Paris',
      confidence: 95,
      raw: mockRawText,
    });
  });

  it('extracts electric vehicle recharge (kWh) data correctly', async () => {
    const mockRawText = `
      IONITY Charge Station
      A71 Aire des Volcans
      03700 VALONGES
      
      Recharge Electrique RAPIDE
      Quantite Delivree: 28.4 kWh
      Prix KWh: 0.590 €
      Montant TTC: 16.76 €
    `;

    mockTextDetection.mockResolvedValue([
      {
        fullTextAnnotation: {
          text: mockRawText,
          pages: [
            {
              confidence: 0.90,
            },
          ],
        },
      },
    ]);

    const dummyImageBuffer = Buffer.from('fake-charge-image');
    const result = await parseFuelReceipt(dummyImageBuffer);

    expect(result.energyType).toBe('electric');
    expect(result.quantity).toBe(28.4);
    expect(result.unitPrice).toBe(0.59);
    expect(result.totalPrice).toBe(16.76);
    expect(result.stationName).toBe('IONITY');
    expect(result.stationCity).toBe('VALONGES');
  });

  it('handles empty or unstructured OCR text elegantly with default values', async () => {
    const mockRawText = 'Une page blanche ou illisible';

    mockTextDetection.mockResolvedValue([
      {
        fullTextAnnotation: {
          text: mockRawText,
          pages: [
            {
              confidence: 0.35,
            },
          ],
        },
      },
    ]);

    const result = await parseFuelReceipt(Buffer.from('blabla'));

    expect(result).toEqual({
      energyType: 'gasoline',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      stationName: 'Une page blanche ou illisible',
      stationCity: '',
      confidence: 35,
      raw: mockRawText,
    });
  });

  it('intercepts BILLING_DISABLED errors and throws an informative user-facing message', async () => {
    const billingError = new Error('7 PERMISSION_DENIED: This API method requires billing to be enabled.');
    (billingError as any).code = 7;
    (billingError as any).details = 'This API method requires billing to be enabled. Please enable billing on project...';

    mockTextDetection.mockRejectedValue(billingError);

    const dummyImageBuffer = Buffer.from('fake-image-bytes');
    
    await expect(parseFuelReceipt(dummyImageBuffer)).rejects.toThrow(
      'L\'API Google Cloud Vision requiert l\'activation de la facturation sur la console GCP (premiers 1000 scans gratuits). Veuillez associer un compte de facturation.'
    );
  });
});
