export function ContactFormPlaceholder() {
  return (
    <div
      className="rounded-xl border border-line bg-paper-elevated p-6"
      aria-describedby="contact-direct-note"
    >
      <p id="contact-direct-note" className="text-sm leading-6 text-ink-soft">
        Email and LinkedIn are the production contact channels. A web form is
        not published on this site.
      </p>
    </div>
  );
}
