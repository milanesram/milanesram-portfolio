export function ContactFormPlaceholder() {
  return (
    <form
      className="rounded-xl border border-dashed border-line bg-paper-elevated p-6"
      aria-describedby="contact-form-note"
    >
      <p id="contact-form-note" className="text-sm leading-6 text-ink-soft">
        A secure contact form will be connected when the content system is added.
        Until then, use email or LinkedIn.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Name</span>
          <input
            disabled
            className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink-faint"
            placeholder="Available in a later phase"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Email</span>
          <input
            disabled
            className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink-faint"
            placeholder="Available in a later phase"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        <span className="font-medium text-ink">Message</span>
        <textarea
          disabled
          rows={4}
          className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink-faint"
          placeholder="Available in a later phase"
        />
      </label>
      <button
        type="button"
        disabled
        className="mt-5 min-h-11 cursor-not-allowed rounded-full bg-line px-5 text-sm font-medium text-ink-faint"
      >
        Form not connected yet
      </button>
    </form>
  );
}
