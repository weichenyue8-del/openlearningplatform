import katex from "katex";

export function MathFormula({ latex, label }: { latex: string; label?: string }) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    strict: "error",
    throwOnError: false,
  });

  return (
    <figure className="my-6 overflow-x-auto rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-5 text-center dark:border-blue-900 dark:bg-blue-950/40">
      <div aria-label={label || latex} dangerouslySetInnerHTML={{ __html: html }} />
      {label ? <figcaption className="mt-3 text-xs text-slate-500 dark:text-slate-400">{label}</figcaption> : null}
    </figure>
  );
}
