export function Footer() {
  return (
    <footer className="bg-background py-8 px-6 md:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-2xl font-bold mb-2 text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          ocho
        </p>
        <p className="text-sm tracking-[0.2em] text-muted-foreground mb-4">
          HAIR LAB
        </p>
        <p className="text-sm text-foreground/60">
          © {new Date().getFullYear()} Ocho Hair Lab. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
