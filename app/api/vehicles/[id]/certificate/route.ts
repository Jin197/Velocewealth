import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getVehicle } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import { evaluateVehicleHealth, TelemetryData } from '@/lib/phm/engine';
import { buildPhmComponents } from '@/lib/phm/components';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: vehicleId } = await params;
    const vehicle = await getVehicle(vehicleId);
    
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const supabase = createClient();

    // 1. Fetch Latest Telemetry
    const { data: telemetryData } = await supabase
      .from('telemetry_obd' as any)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('time', { ascending: false })
      .limit(1)
      .single();

    let latestTelemetry: TelemetryData | null = null;
    if (telemetryData) {
      latestTelemetry = {
        rpm: (telemetryData as any).rpm || 0,
        engineLoad: (telemetryData as any).engine_load || 0,
        speed: (telemetryData as any).speed || 0,
        maf: (telemetryData as any).maf || 0,
        iat: (telemetryData as any).iat || 0,
        coolantTemp: (telemetryData as any).coolant_temp || 0,
        batteryVoltage: (telemetryData as any).battery_voltage || 12.0
      };
    }

    // 2. Fetch REAL maintenance history + OEM knowledge base (plus de mock)
    const { data: maintenanceHistory } = await supabase
      .from('maintenance_entries')
      .select('category, mileage_km')
      .eq('vehicle_id', vehicleId)
      .order('occurred_at', { ascending: false });

    const phmComponents = buildPhmComponents(
      vehicle.currentMileageKm,
      vehicle.fuelType,
      maintenanceHistory
    );
    const componentsData = phmComponents.map(c => ({
      name: c.name,
      lastChangedKm: c.lastChangedKm,
      expectedLifetimeKm: c.expectedLifetimeKm,
    }));

    const prognostics = evaluateVehicleHealth(vehicle.currentMileageKm, latestTelemetry, componentsData);

    // 3. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    const { width, height } = page.getSize();

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawRectangle({
      x: 0, y: height - 120,
      width, height: 120,
      color: rgb(0.07, 0.07, 0.09) // Dark background #121212
    });

    page.drawText('VELOCEWEALTH', {
      x: 50, y: height - 60,
      size: 24,
      font: helveticaBold,
      color: rgb(1, 1, 1)
    });

    page.drawText('CARNET DE SANTÉ CERTIFIÉ', {
      x: 50, y: height - 85,
      size: 14,
      font: helvetica,
      color: rgb(0.8, 0.8, 0.8)
    });

    // Vehicle Details
    page.drawText('Informations du Véhicule', { x: 50, y: height - 160, size: 18, font: helveticaBold, color: rgb(0, 0, 0) });
    page.drawText(`Marque / Modèle: ${vehicle.make} ${vehicle.model}`, { x: 50, y: height - 190, size: 12, font: helvetica });
    page.drawText(`Immatriculation: ${vehicle.plate}`, { x: 50, y: height - 210, size: 12, font: helvetica });
    page.drawText(`Kilométrage Actuel: ${vehicle.currentMileageKm.toLocaleString('fr-FR')} km`, { x: 50, y: height - 230, size: 12, font: helvetica });
    page.drawText(`Énergie: ${vehicle.fuelType.toUpperCase()}`, { x: 50, y: height - 250, size: 12, font: helvetica });

    // Diagnostic AI
    page.drawText('Diagnostic IA (PHM Engine)', { x: 50, y: height - 310, size: 18, font: helveticaBold, color: rgb(0, 0, 0) });
    
    const scoreColor = prognostics.overallScore > 80 ? rgb(0.18, 0.81, 0.34) : prognostics.overallScore > 50 ? rgb(0.96, 0.61, 0.04) : rgb(0.93, 0.26, 0.26);
    page.drawText(`Score de Santé Global: ${prognostics.overallScore} / 100`, { x: 50, y: height - 340, size: 14, font: helveticaBold, color: scoreColor });

    let yPosition = height - 380;
    for (const comp of prognostics.components) {
      page.drawText(`• ${comp.name}`, { x: 50, y: yPosition, size: 12, font: helveticaBold });
      page.drawText(`Statut: ${comp.status} | Confiance IA: ${comp.confidence.toFixed(1)}% | RUL: ${comp.rulKm.toLocaleString()} km`, { x: 70, y: yPosition - 20, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
      if (comp.anomalyFlag) {
        page.drawText(`! ANOMALIE: ${comp.anomalyReason}`, { x: 70, y: yPosition - 35, size: 10, font: helveticaBold, color: rgb(0.93, 0.26, 0.26) });
        yPosition -= 15;
      }
      yPosition -= 45;
    }

    // Certification Stamp
    page.drawRectangle({
      x: 50, y: 50,
      width: width - 100, height: 60,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1
    });

    page.drawText(`Document généré électroniquement par l'Intelligence Artificielle VeloceWealth le ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 60, y: 85,
      size: 9,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });
    page.drawText(`ID Rapport: VW-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${vehicleId.substr(0, 8).toUpperCase()}`, {
      x: 60, y: 65,
      size: 9,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3)
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Carnet_Sante_${vehicle.plate}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
