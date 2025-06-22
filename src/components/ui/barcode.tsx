'use client';
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps extends React.SVGAttributes<SVGSVGElement> {
  value: string;
  options?: JsBarcode.Options;
}

const Barcode: React.FC<BarcodeProps> = ({ value, options, ...props }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        JsBarcode(ref.current, value, {
          format: 'CODE128',
          displayValue: false,
          margin: 0,
          height: 40,
          width: 2,
          ...options,
        });
      } catch (e) {
        // Suppress invalid value errors during input
        if (String(e).includes('Invalid value')) return;
        console.error('Barcode generation error:', e);
      }
    }
  }, [value, options]);

  return <svg ref={ref} {...props} />;
};

export { Barcode };
