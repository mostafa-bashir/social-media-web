/** Eyebrow + h2 + optional lead. Letter-spacing is LTR-only: it breaks Arabic joining. */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <p className="text-sm font-semibold text-primary-text ltr:uppercase ltr:tracking-wider">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-3 text-3xl font-bold leading-tight text-text-primary sm:text-4xl ltr:tracking-tight"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
