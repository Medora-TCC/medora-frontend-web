import { Document, Page, pdfjs } from 'react-pdf';
import { useEffect, useRef, useState, type JSX } from "react";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Button } from '@heroui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  documentUrl: string;
}

export default function PDFViewer({ documentUrl }: PDFViewerProps): JSX.Element {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600); // fallback seguro

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const updateWidth = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.getBoundingClientRect().width);
        }
      }, 150);
    };

    if (containerRef.current) {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    }

    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      role="region"
      aria-label="Visualizador de documento PDF"
      className="w-full min-h-screen bg-surface-alt flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center gap-6 px-4 py-8">

        <div
          ref={containerRef}
          className="w-full max-w-3xl shadow-lg rounded-xl overflow-hidden border border-divider"
        >
          <Document
            file={documentUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            noData={<span className="block p-8 text-center text-text-secondary">Nenhum documento selecionado</span>}
            loading={<span aria-live="assertive" className="block p-8 text-center text-text-secondary">Carregando documento...</span>}
            error={<span role="alert" className="block p-8 text-center text-danger">Erro ao carregar o documento.</span>}
          >
            <Page
              pageNumber={pageNumber}
              width={containerWidth}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>

        {numPages && numPages > 1 && (
          <nav
            aria-label="Navegação de páginas"
            className="flex items-center gap-3 px-4 py-2 bg-surface-hover rounded-2xl shadow-sm border border-divider"
          >
            <Button
              size="sm"
              isDisabled={pageNumber <= 1}
              onPress={() => setPageNumber(p => p - 1)}
              aria-label="Página anterior"
            >
              <ArrowLeft size={16} />
            </Button>

            <span aria-live="polite" className="text-sm font-medium text-text-primary min-w-24 text-center">
              {pageNumber} / {numPages}
            </span>

            <Button
              size="sm"
              isDisabled={pageNumber >= numPages}
              onPress={() => setPageNumber(p => p + 1)}
              aria-label="Próxima página"
            >
              <ArrowRight size={16} />
            </Button>
          </nav>
        )}

      </div>
    </section>
  );
}