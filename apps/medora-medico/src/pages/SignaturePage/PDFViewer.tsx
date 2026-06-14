import { Document, Page, pdfjs } from 'react-pdf';
import { useEffect, useRef, useState, type JSX } from "react"
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Button } from '@heroui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  documentUrl: string
}

export default function PDFViewer({ documentUrl }: PDFViewerProps): JSX.Element {

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const updateWidth = () => {
      setIsResizing(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.getBoundingClientRect().width);
        }
        setIsResizing(false);
      }, 300);
    };

    if (containerRef.current) {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    }

    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateWidth);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <section
      role="region"
      aria-label="Visualizador de documento PDF"
      className="w-full h-full bg-surface-alt"
    >
      <div
        className={`m-auto px-2 py-4 flex flex-col gap-8 transition-opacity duration-300 ${isResizing ? "opacity-0" : "opacity-100"}`}

      >
        <div ref={containerRef} className={`w-[50%] m-auto`}>
          <Document
            file={documentUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            noData={<span>Nenhum documento selecionado</span>}
            loading={<span aria-live="assertive">Carregando documento...</span>}
            error={<span role="alert">Erro ao carregar o documento.</span>}
          >
            <Page
              pageNumber={pageNumber}
              width={containerWidth}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
        <nav aria-label="Navegação de páginas" className='w-fit m-auto bg-surface-hover text-text-primary flex flex-row gap-4 items-center rounded-2xl'>
          <Button
            onClick={() => setPageNumber(p => p - 1)}
            isDisabled={pageNumber <= 1}
            aria-label="Página anterior"
          >
            <ArrowLeft />
          </Button>
          <span aria-live="polite">
            Página {pageNumber} de {numPages ?? '...'}
          </span>
          <Button
            onClick={() => setPageNumber(p => p + 1)}
            isDisabled={pageNumber >= (numPages ?? 0)}
            aria-label="Próxima página"
          >
            <ArrowRight />
          </Button>
        </nav>
      </div>
    </section>
  )

} 