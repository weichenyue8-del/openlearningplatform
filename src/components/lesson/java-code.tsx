import type { ReactNode } from "react";

const tokenPattern =
  /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|\b(?:boolean|break|case|char|class|continue|default|do|double|else|false|for|if|int|new|null|private|public|return|static|String|switch|this|true|void|while)\b|\b\d+(?:\.\d+)?\b/g;

function highlightJava(code: string) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(code)) !== null) {
    if (match.index > cursor) nodes.push(code.slice(cursor, match.index));

    const token = match[0];
    let className = "text-violet-300";

    if (match[1]) className = "text-slate-500";
    else if (match[2] || match[3]) className = "text-emerald-300";
    else if (/^\d/.test(token)) className = "text-amber-300";

    nodes.push(
      <span className={className} key={`${match.index}-${token}`}>
        {token}
      </span>,
    );
    cursor = match.index + token.length;
  }

  if (cursor < code.length) nodes.push(code.slice(cursor));
  return nodes;
}

export function JavaCode({ code, caption }: { code: string; caption: string }) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
      <figcaption className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
        <span>{caption}</span>
        <span className="font-mono uppercase tracking-wider">Java</span>
      </figcaption>
      <pre className="overflow-x-auto p-5 text-[13px] leading-6 text-slate-200 sm:text-sm">
        <code>{highlightJava(code)}</code>
      </pre>
    </figure>
  );
}
