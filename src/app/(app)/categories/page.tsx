
import { Suspense } from 'react';
import CategoriesPageContent from './CategoriesPageContent';
import Loading from './loading';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CategoriesPageContent />
    </Suspense>
  );
}
