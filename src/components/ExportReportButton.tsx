import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportReportButtonProps {
  month?: Date;
}

export const ExportReportButton = ({ month = new Date() }: ExportReportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportMonthlyReport = async () => {
    setIsExporting(true);
    try {
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

      // Obtener reservas del mes
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .order('booking_date', { ascending: true });

      if (error) throw error;

      // Crear PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Reporte Mensual - Pitaya Nails', 14, 20);
      
      doc.setFontSize(12);
      doc.text(
        `Período: ${format(month, 'MMMM yyyy', { locale: es })}`,
        14,
        30
      );

      // Estadísticas generales
      const totalBookings = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;
      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      doc.setFontSize(10);
      doc.text(`Total de Reservas: ${totalBookings}`, 14, 40);
      doc.text(`Ingresos Totales: $${totalRevenue.toFixed(2)} MXN`, 14, 46);
      doc.text(`Valor Promedio por Reserva: $${avgBookingValue.toFixed(2)} MXN`, 14, 52);

      // Servicios más populares
      const serviceCount: Record<string, number> = {};
      bookings?.forEach((booking) => {
        booking.service_names.forEach((service: string) => {
          serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
      });

      const topServices = Object.entries(serviceCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => [name, count.toString()]);

      if (topServices.length > 0) {
        doc.text('Servicios Más Solicitados:', 14, 62);
        autoTable(doc, {
          startY: 66,
          head: [['Servicio', 'Cantidad']],
          body: topServices,
          theme: 'striped',
          headStyles: { fillColor: [236, 72, 153] },
        });
      }

      // Tabla de reservas
      const bookingRows = bookings?.map((booking) => [
        format(new Date(booking.booking_date), 'dd/MM/yyyy'),
        booking.booking_time,
        booking.client_name,
        booking.service_names.join(', '),
        booking.professional_name,
        `$${Number(booking.total_price).toFixed(2)}`,
        booking.status,
      ]) || [];

      const lastY = (doc as any).lastAutoTable?.finalY || 90;
      autoTable(doc, {
        startY: lastY + 10,
        head: [['Fecha', 'Hora', 'Cliente', 'Servicios', 'Profesional', 'Total', 'Estado']],
        body: bookingRows,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] },
        styles: { fontSize: 8 },
      });

      // Guardar PDF
      const fileName = `reporte-${format(month, 'yyyy-MM')}.pdf`;
      doc.save(fileName);

      toast({
        title: 'Reporte exportado',
        description: `El reporte se ha descargado como ${fileName}`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportMonthlyReport}
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? 'Generando...' : 'Exportar PDF'}
    </Button>
  );
};
