import { Check, Lightbulb } from "lucide-react";

import type { Lesson } from "@/content/course-catalog";

import { JavaCode } from "./java-code";
import { MathFormula } from "./math-formula";

export function LessonContent({ lesson }: { lesson: Lesson }) {
  return (
    <article className="lesson-prose min-w-0">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Learning objectives</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {lesson.objectives.map((objective) => (
            <li className="flex gap-2.5 text-sm leading-6 text-slate-700 dark:text-slate-300" key={objective}>
              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Check aria-hidden="true" className="size-3" />
              </span>
              {objective}
            </li>
          ))}
        </ul>
      </div>

      {lesson.sections.map((section) => (
        <section className="scroll-mt-24 border-b border-slate-200 py-10 last:border-0 dark:border-slate-800" id={section.id} key={section.id}>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl dark:text-white">{section.title}</h2>
          <div className="mt-5 space-y-4">
            {section.paragraphs.map((paragraph) => (
              <p className="text-base leading-8 text-slate-700 dark:text-slate-300" key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {section.formulas?.map((formula) => (
            <MathFormula key={formula.expression} label={formula.label} latex={formula.expression} />
          ))}

          {section.bullets ? (
            <ul className="my-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              {section.bullets.map((bullet) => (
                <li className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300" key={bullet}>
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}

          {section.codeExamples?.map((example) => (
            <JavaCode caption={example.caption} code={example.code} key={example.caption} />
          ))}

          {section.example ? (
            <aside className="my-7 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900 dark:bg-amber-950/30 sm:p-6">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Lightbulb aria-hidden="true" className="size-5" />
                <h3 className="font-bold">{section.example.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">{section.example.prompt}</p>
              <ol className="mt-4 space-y-3">
                {section.example.steps.map((step, index) => (
                  <li className="flex gap-3 text-sm leading-7 text-slate-700 dark:text-slate-300" key={step}>
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-amber-200 text-xs font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-100">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              {section.example.formula ? <MathFormula latex={section.example.formula} /> : null}
              <p className="mt-4 border-t border-amber-200 pt-4 text-sm font-semibold leading-7 text-slate-900 dark:border-amber-900 dark:text-white">{section.example.result}</p>
            </aside>
          ) : null}
        </section>
      ))}
    </article>
  );
}
