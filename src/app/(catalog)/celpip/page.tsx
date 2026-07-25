import Link from "next/link";
import { getTasksByType } from "@/lib/celpip";

// Minimal landing for the tracer slice — plan 05 owns the full landing
// (tabs, TaskCard grid, attempt history, metadata).
export default function CelpipPage() {
  const emailTasks = getTasksByType("email");
  const surveyTasks = getTasksByType("survey");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">
        CELPIP Writing Practice
      </h1>
      <p className="mt-2 text-ink-soft">
        Practice the two CELPIP Writing tasks under real exam conditions, then
        compare your answer with an original model response.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Task 1: Email</h2>
        <ul className="mt-3 space-y-2">
          {emailTasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/celpip/writing/${task.id}`}
                className="font-semibold text-sky hover:underline"
              >
                {task.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Task 2: Survey</h2>
        <ul className="mt-3 space-y-2">
          {surveyTasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/celpip/writing/${task.id}`}
                className="font-semibold text-sky hover:underline"
              >
                {task.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
