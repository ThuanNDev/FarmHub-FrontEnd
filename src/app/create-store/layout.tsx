
'use client';
import '../landing-page.css';

export default function CreateStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 py-8 min-h-screen">
        <main className="container max-w-5xl mx-auto">
            {children}
        </main>
    </div>
  );
}
