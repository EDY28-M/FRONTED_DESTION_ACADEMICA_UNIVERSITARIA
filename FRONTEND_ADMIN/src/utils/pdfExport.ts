import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exportación a PDF robusta para horarios:
 * - Nunca distorsiona la UI (clon offscreen).
 * - Multipágina GARANTIZADA (corta el canvas por páginas usando px->mm).
 * - Horario grande (ajuste por ancho + escala alta).
 * - Compacta horas vacías SOLO en el clon (auto-detección + CSS temporal).
 */

// Ajusta estos selectores a tu DOM real (si no coinciden, la compactación no aplicará)
const SELECTORS = {
    hourRow: '.hour-row',
    course: '.course-card',  // Clase agregada a los divs de curso
};

export interface PDFExportOptions {
    filename?: string;
    title?: string;
    subtitle?: string;
    orientation?: 'portrait' | 'landscape';
    format?: 'a4' | 'a3';
    marginMm?: number;
    /**
     * Calidad de captura. 3 = texto más nítido y grande (más peso).
     * 2 = balance.
     */
    quality?: number;
    showHeader?: boolean;
    headerInfo?: {
        studentName?: string;
        period?: string;
        faculty?: string;
    };
    /**
     * Qué tan “grande” se verá en página: 0.99 ocupa casi todo el ancho útil.
     */
    contentWidthRatio?: number;

    /**
     * Activar compactación de horas vacías.
     */
    compactEmptyHours?: boolean;
    /**
     * Altura en px (en el clon) para filas vacías.
     */
    emptyRowHeightPx?: number;
    /**
     * Altura mínima en px (en el clon) para filas con curso (opcional).
     */
    nonEmptyRowMinHeightPx?: number;

    /**
     * Override de selectores si tu DOM no usa hour-row / course-card.
     */
    selectors?: Partial<typeof SELECTORS>;
}

const DEFAULT_OPTIONS: Required<Omit<PDFExportOptions, 'headerInfo' | 'selectors' | 'nonEmptyRowMinHeightPx'>> & {
    headerInfo?: PDFExportOptions['headerInfo'];
    selectors?: Partial<typeof SELECTORS>;
    nonEmptyRowMinHeightPx?: number;
} = {
    filename: 'horario-academico.pdf',
    title: 'Horario Académico Semanal',
    subtitle: 'Sistema de Gestión Académica Universitaria',
    orientation: 'landscape',
    format: 'a4',
    marginMm: 8,
    quality: 3,
    showHeader: true,
    headerInfo: undefined,
    contentWidthRatio: 0.99,
    compactEmptyHours: true,
    emptyRowHeightPx: 10,
    nonEmptyRowMinHeightPx: undefined,
    selectors: undefined,
};

export const exportToPDF = async (element: HTMLElement, options: PDFExportOptions = {}): Promise<void> => {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const selectors = { ...SELECTORS, ...(config.selectors ?? {}) };

    // 1) PDF
    const pdf = new jsPDF({
        orientation: config.orientation,
        unit: 'mm',
        format: config.format,
    });

    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const marginMm = config.marginMm;

    // 2) Clon offscreen (sin alterar UI)
    const { container, clone } = createOffscreenClone(element);

    // CSS temporal solo para el clon (compactación)
    const styleEl = document.createElement('style');

    try {
        // 2.1) Marcar filas vacías en el clon
        if (config.compactEmptyHours) {
            markEmptyHourRows(clone, selectors.hourRow, selectors.course);
        }

        // 2.2) Inyectar CSS SOLO al clon (scope por id para no afectar UI real)
        const scope = `#${container.id}`;
        const emptyH = Math.max(6, Math.floor(config.emptyRowHeightPx));

        const nonEmptyMin = config.nonEmptyRowMinHeightPx;

        styleEl.textContent = `
${scope} ${selectors.hourRow}[data-empty="1"]{height:${emptyH}px !important;min-height:${emptyH}px !important;}
${scope} ${selectors.hourRow}[data-empty="1"] *{line-height:1 !important;}
${nonEmptyMin ? `${scope} ${selectors.hourRow}[data-empty="0"]{min-height:${Math.max(12, Math.floor(nonEmptyMin))}px !important;}` : ''}

/* Mantener colores */
${scope} *{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
`;
        container.appendChild(styleEl);

        // 2.3) Esperar layout estable
        await nextFrame();
        await nextFrame();

        // 3) Captura (del clon)
        const canvas = await html2canvas(clone, {
            scale: config.quality,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: clone.scrollWidth,
            height: clone.scrollHeight,
            windowWidth: clone.scrollWidth,
            windowHeight: clone.scrollHeight,
            scrollX: 0,
            scrollY: 0,
        } as any);

        // 4) Geometría: ajustamos por ancho (grande) y cortamos por altura
        const footerReserveMm = 10;

        // Header real por página (aprox segura)
        const computeHeaderHeightMm = () => {
            if (!config.showHeader) return 0;
            return config.headerInfo ? 34 : 28;
        };

        const contentWidthMm =
            (pageWidthMm - marginMm * 2) * clamp(config.contentWidthRatio, 0.7, 1);
        const xMm = marginMm + ((pageWidthMm - marginMm * 2) - contentWidthMm) / 2;

        // px por mm cuando la imagen ocupa contentWidthMm
        const pxPerMm = canvas.width / contentWidthMm;

        // totalPages estimado (para paginado)
        const roughAvailMm =
            pageHeightMm - marginMm - computeHeaderHeightMm() - (marginMm + footerReserveMm);
        const roughSlicePx = Math.max(1, Math.floor(roughAvailMm * pxPerMm));
        const totalPages = Math.max(1, Math.ceil(canvas.height / roughSlicePx));

        // 5) Multipágina real
        let offsetYpx = 0;
        let pageNumber = 1;

        while (offsetYpx < canvas.height) {
            // Header
            let yMm = marginMm;
            if (config.showHeader) {
                yMm = addPDFHeader(pdf, config, pageWidthMm, marginMm);
            }

            const availHeightMm = pageHeightMm - yMm - (marginMm + footerReserveMm);
            const sliceHeightPx = Math.max(1, Math.floor(availHeightMm * pxPerMm));
            const currentSlicePx = Math.min(sliceHeightPx, canvas.height - offsetYpx);

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = currentSlicePx;

            const ctx = pageCanvas.getContext('2d');
            if (!ctx) throw new Error('No se pudo obtener contexto 2D del canvas');

            ctx.drawImage(
                canvas,
                0,
                offsetYpx,
                canvas.width,
                currentSlicePx,
                0,
                0,
                canvas.width,
                currentSlicePx
            );

            const imgData = pageCanvas.toDataURL('image/png', 1.0);
            const sliceHeightMm = currentSlicePx / pxPerMm;

            // Insertar (centrado, grande, sin deformar)
            pdf.addImage(imgData, 'PNG', xMm, yMm, contentWidthMm, sliceHeightMm, undefined, 'FAST');

            // Footer
            addPDFFooter(pdf, pageWidthMm, pageHeightMm, marginMm, pageNumber, totalPages);

            offsetYpx += currentSlicePx;

            if (offsetYpx < canvas.height) {
                pdf.addPage();
                pageNumber += 1;
            }
        }

        pdf.save(config.filename);
    } finally {
        container.remove();
    }
};

/**
 * Marca filas vacías: data-empty="1" si no contiene ningún curso.
 */
function markEmptyHourRows(root: HTMLElement, hourRowSel: string, courseSel: string): void {
    const rows = Array.from(root.querySelectorAll<HTMLElement>(hourRowSel));
    if (!rows.length) return;

    for (const row of rows) {
        const hasCourse = !!row.querySelector(courseSel);
        row.setAttribute('data-empty', hasCourse ? '0' : '1');
    }
}

/**
 * Clon fuera de pantalla (no altera UI)
 */
function createOffscreenClone(element: HTMLElement): { container: HTMLDivElement; clone: HTMLElement } {
    const container = document.createElement('div');
    container.id = `pdf-clone-${Math.random().toString(16).slice(2)}`;

    container.style.position = 'fixed';
    container.style.left = '-100000px';
    container.style.top = '0';
    container.style.background = '#ffffff';
    container.style.zIndex = '-1';

    const clone = element.cloneNode(true) as HTMLElement;

    // Forzar dimensiones reales para evitar reflow raro
    const w = element.scrollWidth;
    const h = element.scrollHeight;
    container.style.width = `${w}px`;
    container.style.height = `${h}px`;
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;

    container.appendChild(clone);
    document.body.appendChild(container);

    return { container, clone };
}

function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function addPDFHeader(pdf: jsPDF, config: PDFExportOptions, pageWidthMm: number, marginMm: number): number {
    let y = marginMm;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(config.title ?? 'Horario Académico Semanal', pageWidthMm / 2, y + 8, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(
        config.subtitle ?? 'Sistema de Gestión Académica Universitaria',
        pageWidthMm / 2,
        y + 14,
        { align: 'center' }
    );

    y += 20;

    if (config.headerInfo) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);

        const parts: string[] = [];
        if (config.headerInfo.studentName) parts.push(`Estudiante: ${config.headerInfo.studentName}`);
        if (config.headerInfo.period) parts.push(`Periodo: ${config.headerInfo.period}`);
        if (config.headerInfo.faculty) parts.push(`Facultad: ${config.headerInfo.faculty}`);

        if (parts.length) {
            pdf.text(parts.join('  |  '), pageWidthMm / 2, y, { align: 'center' });
            y += 6;
        }
    }

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.line(marginMm, y + 2, pageWidthMm - marginMm, y + 2);

    return y + 8;
}

function addPDFFooter(
    pdf: jsPDF,
    pageWidthMm: number,
    pageHeightMm: number,
    marginMm: number,
    page: number,
    total: number
): void {
    const footerY = pageHeightMm - marginMm;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(marginMm, footerY - 6, pageWidthMm - marginMm, footerY - 6);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);

    const fecha = new Date().toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    pdf.text(`Generado: ${fecha}`, marginMm, footerY - 1);
    pdf.text(`Pag. ${page}${total ? ` / ${total}` : ''}`, pageWidthMm - marginMm, footerY - 1, { align: 'right' });
}

/**
 * Hook helper
 */
export const useSchedulePDFExport = () => {
    const exportSchedule = async (
        elementRef: React.RefObject<HTMLElement>,
        studentName?: string,
        period?: string,
        faculty?: string
    ): Promise<boolean> => {
        if (!elementRef.current) throw new Error('El elemento de referencia no está disponible');

        await exportToPDF(elementRef.current, {
            filename: `horario-${new Date().toISOString().split('T')[0]}.pdf`,
            title: 'Horario Académico Semanal',
            subtitle: 'Sistema de Gestión Académica Universitaria',
            orientation: 'landscape',
            format: 'a4',

            // Grande + nítido
            marginMm: 8,
            quality: 3,
            contentWidthRatio: 0.99,

            showHeader: true,
            headerInfo: { studentName, period, faculty },

            // Compactar vacíos
            compactEmptyHours: true,
            emptyRowHeightPx: 10,

            // Si tus clases son distintas, cámbialas aquí:
            selectors: {
                hourRow: '.hour-row',
                course: '.course-card',
            },
        });

        return true;
    };

    return { exportSchedule };
};

export default exportToPDF;
