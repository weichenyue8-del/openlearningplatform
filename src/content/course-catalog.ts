export const courseCategories = [
  "Mathematics",
  "Computer Science",
  "Economics",
  "Science",
  "Social Science",
  "English",
] as const;

export type CourseCategory = (typeof courseCategories)[number];

export type CourseIconName =
  | "calculus"
  | "statistics"
  | "code"
  | "economics"
  | "physics"
  | "psychology"
  | "english";

export type Formula = {
  expression: string;
  label?: string;
};

export type CodeExample = {
  caption: string;
  code: string;
  language: "java";
};

export type WorkedExample = {
  title: string;
  prompt: string;
  steps: string[];
  result: string;
  formula?: string;
};

export type LessonSection = {
  id: string;
  title: string;
  paragraphs: string[];
  formulas?: Formula[];
  bullets?: string[];
  codeExamples?: CodeExample[];
  example?: WorkedExample;
};

export type Lesson = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  objectives: string[];
  sections: LessonSection[];
};

export type CourseUnit = {
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  shortTitle: string;
  category: CourseCategory;
  icon: CourseIconName;
  description: string;
  overview: string;
  objectives: string[];
  units: CourseUnit[];
};

export const courses: Course[] = [
  {
    slug: "ap-calculus-bc",
    title: "AP Calculus BC",
    shortTitle: "Calculus BC",
    category: "Mathematics",
    icon: "calculus",
    description: "Build a rigorous foundation in limits, derivatives, integrals, and change.",
    overview:
      "AP Calculus BC studies how quantities change and accumulate. This opening unit develops the three ideas that support the rest of calculus: limits, derivatives, and integrals. Each lesson connects notation to a concrete interpretation before introducing efficient techniques.",
    objectives: [
      "Interpret limits as values approached by a function.",
      "Connect derivatives to instantaneous rates of change.",
      "Understand integration as accumulation and inverse differentiation.",
      "Communicate calculus reasoning with correct notation.",
    ],
    units: [
      {
        slug: "foundations",
        title: "Unit 1 · Foundations of Calculus",
        description: "The central ideas of approaching, changing, and accumulating.",
        lessons: [
          {
            slug: "limits-and-continuity",
            title: "Limits and Continuity",
            description: "Describe what a function approaches and decide when it is continuous.",
            duration: "~18 min",
            objectives: [
              "Read and explain limit notation.",
              "Estimate a limit from values or an algebraic expression.",
              "Check the three conditions for continuity at a point.",
            ],
            sections: [
              {
                id: "approaching-a-value",
                title: "Approaching a value",
                paragraphs: [
                  "A limit describes the output a function approaches as its input moves close to a chosen value. The input does not have to equal that value. This distinction lets calculus describe behavior near holes, jumps, and other special points.",
                  "The notation below reads: the limit of f of x as x approaches a equals L. It is a claim about nearby behavior from both sides of a.",
                ],
                formulas: [
                  { expression: "\\lim_{x \\to a} f(x) = L", label: "General limit notation" },
                ],
                bullets: [
                  "A left-hand limit uses inputs smaller than a.",
                  "A right-hand limit uses inputs larger than a.",
                  "A two-sided limit exists only when the two one-sided limits agree.",
                ],
              },
              {
                id: "evaluating-limits",
                title: "Evaluating limits",
                paragraphs: [
                  "For a polynomial, direct substitution works because polynomials are continuous everywhere. When substitution produces an indeterminate form such as 0/0, algebra can expose the nearby behavior without changing the original function at the missing point.",
                ],
                example: {
                  title: "Worked example · A removable hole",
                  prompt: "Evaluate the limit as x approaches 2 of (x² − 4)/(x − 2).",
                  steps: [
                    "Direct substitution gives 0/0, so factor the numerator.",
                    "For x ≠ 2, (x² − 4)/(x − 2) = (x − 2)(x + 2)/(x − 2) = x + 2.",
                    "The simplified expression approaches 4 as x approaches 2.",
                  ],
                  result: "The limit is 4 even if the original function is undefined at x = 2.",
                  formula: "\\lim_{x \\to 2} \\frac{x^2-4}{x-2}=\\lim_{x \\to 2}(x+2)=4",
                },
              },
              {
                id: "continuity",
                title: "Continuity at a point",
                paragraphs: [
                  "A function is continuous at x = a when its graph can pass through that point without a break. Formally, the function value must exist, the limit must exist, and the two must be equal.",
                  "Continuity is a local property: a function can be continuous at one point and discontinuous at another. Always check the point named in the question.",
                ],
                formulas: [
                  { expression: "f(a)\\text{ exists}" },
                  { expression: "\\lim_{x \\to a} f(x)\\text{ exists}" },
                  { expression: "\\lim_{x \\to a} f(x)=f(a)", label: "Continuity condition" },
                ],
              },
            ],
          },
          {
            slug: "introduction-to-derivatives",
            title: "Introduction to Derivatives",
            description: "Move from average change to the instantaneous slope of a curve.",
            duration: "~20 min",
            objectives: [
              "Compute an average rate of change.",
              "Interpret the derivative as a limit of secant slopes.",
              "Differentiate basic power functions.",
            ],
            sections: [
              {
                id: "from-average-to-instantaneous",
                title: "From average to instantaneous change",
                paragraphs: [
                  "The average rate of change between two points is the slope of the secant line joining them. To find the rate at one instant, move the second point closer and closer to the first. The limiting slope is the derivative.",
                  "If position is measured in meters and time in seconds, the derivative of position has units of meters per second. Units are often the fastest way to interpret a derivative in context.",
                ],
                formulas: [
                  { expression: "\\frac{f(a+h)-f(a)}{h}", label: "Average change over an interval of width h" },
                  { expression: "f'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}", label: "Derivative at x = a" },
                ],
              },
              {
                id: "derivative-definition",
                title: "Using the definition",
                paragraphs: [
                  "The limit definition is more than a formula: it explains why a derivative measures local linear behavior. Algebra usually simplifies the difference quotient before the limit is evaluated.",
                ],
                example: {
                  title: "Worked example · Differentiate x²",
                  prompt: "Use the limit definition to find the derivative of f(x) = x².",
                  steps: [
                    "Substitute f(x + h) = (x + h)² and f(x) = x².",
                    "Expand and simplify: ((x + h)² − x²)/h = (2xh + h²)/h = 2x + h.",
                    "Let h approach 0. The expression approaches 2x.",
                  ],
                  result: "The derivative of x² is 2x.",
                  formula: "f'(x)=\\lim_{h\\to 0}(2x+h)=2x",
                },
              },
              {
                id: "power-rule",
                title: "The power rule",
                paragraphs: [
                  "Repeating the limit process for powers reveals a reliable pattern. The power rule multiplies by the old exponent, then reduces that exponent by one. Constants have derivative zero because they do not change.",
                ],
                formulas: [
                  { expression: "\\frac{d}{dx}x^n=nx^{n-1}", label: "Power rule" },
                  { expression: "\\frac{d}{dx}(3x^4-2x+7)=12x^3-2" },
                ],
              },
            ],
          },
          {
            slug: "basic-integration",
            title: "Basic Integration",
            description: "Understand antiderivatives, signed area, and accumulation.",
            duration: "~22 min",
            objectives: [
              "Identify an antiderivative of a basic power function.",
              "Interpret a definite integral as signed accumulation.",
              "Apply the Fundamental Theorem of Calculus in a simple case.",
            ],
            sections: [
              {
                id: "antiderivatives",
                title: "Reversing differentiation",
                paragraphs: [
                  "An antiderivative of f is a function whose derivative is f. Integration reverses differentiation, but a family of functions can share the same derivative. The constant of integration records that family.",
                ],
                formulas: [
                  { expression: "\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C,\\quad n\\ne -1", label: "Power rule for antiderivatives" },
                  { expression: "\\int (6x^2-4)\\,dx=2x^3-4x+C" },
                ],
              },
              {
                id: "definite-integrals",
                title: "Definite integrals and signed area",
                paragraphs: [
                  "A definite integral adds infinitely many thin contributions across an interval. Geometrically, it represents signed area: regions above the x-axis contribute positively and regions below contribute negatively.",
                  "The result is a number, not a function, because the bounds specify a completed accumulation from a to b.",
                ],
                formulas: [
                  { expression: "\\int_a^b f(x)\\,dx", label: "Accumulation from a to b" },
                ],
              },
              {
                id: "fundamental-theorem",
                title: "The Fundamental Theorem",
                paragraphs: [
                  "The Fundamental Theorem of Calculus connects accumulation to antiderivatives. If f is continuous on the interval and F is any antiderivative of f, subtracting F at the endpoints gives the definite integral.",
                ],
                formulas: [
                  { expression: "\\int_a^b f(x)\\,dx=F(b)-F(a),\\quad F'=f", label: "Fundamental Theorem of Calculus" },
                ],
                example: {
                  title: "Worked example · Accumulating x²",
                  prompt: "Evaluate the integral of x² from 0 to 3.",
                  steps: [
                    "An antiderivative of x² is x³/3.",
                    "Evaluate at the upper bound: 3³/3 = 9.",
                    "Evaluate at the lower bound: 0³/3 = 0, then subtract.",
                  ],
                  result: "The accumulated signed area is 9 square units.",
                  formula: "\\int_0^3 x^2\\,dx=\\left[\\frac{x^3}{3}\\right]_0^3=9",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "ap-calculus-ab",
    title: "AP Calculus AB",
    shortTitle: "Calculus AB",
    category: "Mathematics",
    icon: "calculus",
    description: "Explore limits, derivatives, and integrals through a single-variable lens.",
    overview: "A focused introduction to differential and integral calculus. Reviewed lessons are being prepared.",
    objectives: ["Model change with derivatives.", "Interpret accumulation with integrals."],
    units: [],
  },
  {
    slug: "ap-statistics",
    title: "AP Statistics",
    shortTitle: "Statistics",
    category: "Mathematics",
    icon: "statistics",
    description: "Reason with data, probability, sampling, and statistical inference.",
    overview: "A data-centered course in statistical reasoning. Reviewed lessons are being prepared.",
    objectives: ["Describe patterns in data.", "Use probability to reason about uncertainty."],
    units: [],
  },
  {
    slug: "ap-computer-science-a",
    title: "AP Computer Science A",
    shortTitle: "Computer Science A",
    category: "Computer Science",
    icon: "code",
    description: "Learn programming fundamentals and problem solving with Java.",
    overview:
      "AP Computer Science A introduces object-oriented problem solving in Java. This starter unit focuses on the language tools used in nearly every program: values, decisions, and repetition. Examples emphasize tracing code and explaining why it behaves as it does.",
    objectives: [
      "Choose suitable Java data types for a value.",
      "Control program flow with conditions and loops.",
      "Trace short programs and predict their output.",
      "Write readable Java using clear names and structure.",
    ],
    units: [
      {
        slug: "java-foundations",
        title: "Unit 1 · Java Foundations",
        description: "Values, decisions, and repeated actions in Java.",
        lessons: [
          {
            slug: "java-variables-and-data-types",
            title: "Java Variables and Data Types",
            description: "Store information with clear names and appropriate Java types.",
            duration: "~16 min",
            objectives: [
              "Declare and initialize Java variables.",
              "Distinguish int, double, boolean, char, and String values.",
              "Predict the result of basic arithmetic expressions.",
            ],
            sections: [
              {
                id: "variables",
                title: "Variables give values a name",
                paragraphs: [
                  "A variable pairs a name with a value that a program can use later. Java is statically typed, so every variable has a declared type. That type determines which values are valid and which operations make sense.",
                  "A declaration can create a variable without assigning it. An initialization gives the variable its first value. Local variables must be initialized before they are read.",
                ],
                codeExamples: [
                  {
                    language: "java",
                    caption: "Declaring and initializing values",
                    code: "int lessonsCompleted = 3;\ndouble averageScore = 91.5;\nboolean readyForReview = true;\nchar section = 'B';\nString courseName = \"AP Computer Science A\";",
                  },
                ],
              },
              {
                id: "primitive-types",
                title: "Choosing a data type",
                paragraphs: [
                  "Use int for whole numbers and double when fractional values matter. A boolean stores true or false, while a char stores one character. String is a class rather than a primitive type, but it is the standard choice for text.",
                ],
                bullets: [
                  "int: exact whole numbers such as 7 or −12",
                  "double: decimal approximations such as 2.5",
                  "boolean: true or false",
                  "char: one character enclosed in single quotes",
                  "String: a sequence of characters enclosed in double quotes",
                ],
              },
              {
                id: "expressions",
                title: "Expressions and integer division",
                paragraphs: [
                  "An expression combines values and operators to produce a new value. When both operands of division are int values, Java uses integer division and truncates the result toward zero. Including a double operand keeps the decimal result.",
                ],
                codeExamples: [
                  {
                    language: "java",
                    caption: "The operand types change the result",
                    code: "int questions = 7;\nint groups = 2;\n\nint wholeGroups = questions / groups;      // 3\ndouble exactGroups = questions / 2.0;     // 3.5",
                  },
                ],
                example: {
                  title: "Worked example · Convert a percentage",
                  prompt: "A student earns 18 points out of 20. Store the percentage as a double.",
                  steps: [
                    "Use double for a result that may contain a fraction.",
                    "Make at least one division operand a double to avoid integer division.",
                    "Multiply the ratio by 100.0.",
                  ],
                  result: "double percentage = 18.0 / 20 * 100.0; stores 90.0.",
                },
              },
            ],
          },
          {
            slug: "conditional-statements",
            title: "Conditional Statements",
            description: "Make a program choose actions using boolean conditions.",
            duration: "~18 min",
            objectives: [
              "Write if, else if, and else branches.",
              "Build conditions with comparison and logical operators.",
              "Trace which branch executes for a given input.",
            ],
            sections: [
              {
                id: "if-statements",
                title: "Making one decision",
                paragraphs: [
                  "An if statement runs its block only when its boolean condition is true. An optional else block handles every remaining case. Braces make the boundaries of each branch clear and prevent mistakes when code is expanded later.",
                ],
                codeExamples: [
                  {
                    language: "java",
                    caption: "Choose feedback from a score",
                    code: "int score = 84;\n\nif (score >= 90) {\n    System.out.println(\"Excellent\");\n} else if (score >= 70) {\n    System.out.println(\"On track\");\n} else {\n    System.out.println(\"Review the lesson\");\n}",
                  },
                ],
              },
              {
                id: "boolean-logic",
                title: "Combining conditions",
                paragraphs: [
                  "The && operator requires both conditions to be true. The || operator requires at least one condition to be true. The ! operator reverses a boolean value. Short-circuit evaluation means Java stops as soon as the final result is known.",
                ],
                bullets: [
                  "Use == and != to compare primitive values for equality.",
                  "Use <, <=, >, and >= for ordered comparisons.",
                  "Use .equals(...) rather than == to compare String content.",
                ],
                codeExamples: [
                  {
                    language: "java",
                    caption: "Combine readiness checks",
                    code: "boolean lessonComplete = true;\nint practiceScore = 8;\n\nif (lessonComplete && practiceScore >= 7) {\n    System.out.println(\"Ready for the next topic\");\n}",
                  },
                ],
              },
              {
                id: "trace-a-branch",
                title: "Tracing a branch",
                paragraphs: [
                  "In an if–else-if chain, Java checks conditions from top to bottom and runs only the first matching branch. Order therefore matters: put the most specific or highest threshold first.",
                ],
                example: {
                  title: "Worked example · Predict the category",
                  prompt: "For score = 84 in the earlier example, which message prints?",
                  steps: [
                    "84 >= 90 is false, so the first block is skipped.",
                    "84 >= 70 is true, so the second block runs.",
                    "The final else is skipped because a branch already matched.",
                  ],
                  result: "The program prints: On track.",
                },
              },
            ],
          },
          {
            slug: "loops",
            title: "Loops",
            description: "Repeat work predictably with for and while loops.",
            duration: "~20 min",
            objectives: [
              "Choose between a for loop and a while loop.",
              "Trace a loop variable across iterations.",
              "Write loops that accumulate a total.",
            ],
            sections: [
              {
                id: "for-loops",
                title: "Counted repetition with for",
                paragraphs: [
                  "A for loop is useful when the number of repetitions is known or controlled by a counter. Its header contains initialization, a continuation condition, and an update. The body runs only while the condition remains true.",
                ],
                codeExamples: [
                  {
                    language: "java",
                    caption: "Print lesson numbers 1 through 3",
                    code: "for (int lesson = 1; lesson <= 3; lesson++) {\n    System.out.println(\"Lesson \" + lesson);\n}",
                  },
                ],
              },
              {
                id: "while-loops",
                title: "Condition-controlled repetition with while",
                paragraphs: [
                  "A while loop is a natural fit when repetition should continue until a condition changes. The loop body must make progress toward ending the loop; otherwise the condition may remain true forever.",
                ],
                codeExamples: [
                  {
                    language: "java",
                    caption: "Double a value until it reaches a threshold",
                    code: "int value = 1;\n\nwhile (value < 20) {\n    value *= 2;\n}\n\nSystem.out.println(value); // 32",
                  },
                ],
              },
              {
                id: "accumulation",
                title: "Accumulating a result",
                paragraphs: [
                  "Many loop problems use an accumulator: a variable initialized before the loop and updated during each iteration. Trace the counter and accumulator separately to avoid off-by-one errors.",
                ],
                codeExamples: [
                  {
                    language: "java",
                    caption: "Add the integers from 1 through 5",
                    code: "int total = 0;\n\nfor (int number = 1; number <= 5; number++) {\n    total += number;\n}\n\nSystem.out.println(total); // 15",
                  },
                ],
                example: {
                  title: "Worked example · Trace the total",
                  prompt: "What values does total hold after each iteration of the loop above?",
                  steps: [
                    "After adding 1, total is 1.",
                    "After adding 2 and 3, total becomes 3 and then 6.",
                    "After adding 4 and 5, total becomes 10 and then 15.",
                  ],
                  result: "The final value of total is 15.",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "ap-macroeconomics",
    title: "AP Macroeconomics",
    shortTitle: "Macroeconomics",
    category: "Economics",
    icon: "economics",
    description: "Study national output, inflation, unemployment, and economic policy.",
    overview: "An introduction to economy-wide measures and policy. Reviewed lessons are being prepared.",
    objectives: ["Interpret macroeconomic indicators.", "Explain how policy can affect aggregate outcomes."],
    units: [],
  },
  {
    slug: "ap-microeconomics",
    title: "AP Microeconomics",
    shortTitle: "Microeconomics",
    category: "Economics",
    icon: "economics",
    description: "Analyze choices, markets, incentives, and resource allocation.",
    overview: "A course in individual choice and market interaction. Reviewed lessons are being prepared.",
    objectives: ["Model supply and demand.", "Evaluate choices using marginal reasoning."],
    units: [],
  },
  {
    slug: "ap-physics-c-mechanics",
    title: "AP Physics C: Mechanics",
    shortTitle: "Physics C: Mechanics",
    category: "Science",
    icon: "physics",
    description: "Use calculus to model motion, forces, energy, and momentum.",
    overview: "A calculus-based study of classical mechanics. Reviewed lessons are being prepared.",
    objectives: ["Represent motion mathematically.", "Apply conservation principles to physical systems."],
    units: [],
  },
  {
    slug: "ap-psychology",
    title: "AP Psychology",
    shortTitle: "Psychology",
    category: "Social Science",
    icon: "psychology",
    description: "Investigate behavior, cognition, development, and research methods.",
    overview: "An evidence-centered introduction to psychological science. Reviewed lessons are being prepared.",
    objectives: ["Explain core psychological concepts.", "Evaluate claims using research evidence."],
    units: [],
  },
  {
    slug: "ap-english-language",
    title: "AP English Language and Composition",
    shortTitle: "English Language",
    category: "English",
    icon: "english",
    description: "Read rhetorically and write clear, evidence-based arguments.",
    overview: "A course in rhetorical analysis, argument, and synthesis. Reviewed lessons are being prepared.",
    objectives: ["Analyze rhetorical choices.", "Develop claims supported by relevant evidence."],
    units: [],
  },
];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getCourseLessons(course: Course) {
  return course.units.flatMap((unit) => unit.lessons);
}

export function getCourseLessonCount(course: Course) {
  return getCourseLessons(course).length;
}

export function isCourseAvailable(course: Course) {
  return getCourseLessonCount(course) > 0;
}

export function getLesson(course: Course, lessonSlug: string) {
  return getCourseLessons(course).find((lesson) => lesson.slug === lessonSlug);
}

export function getAdjacentLessons(course: Course, lessonSlug: string) {
  const lessons = getCourseLessons(course);
  const index = lessons.findIndex((lesson) => lesson.slug === lessonSlug);

  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}
