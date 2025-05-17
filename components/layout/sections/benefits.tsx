import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface BenefitsProps {
  icon: string;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "Blocks",
    title: "AI-Generated Tests",
    description:
      "Quickly create multiple-choice quizzes from your PDFs using advanced AI — perfect for students and educators.",
  },
  {
    icon: "LineChart",
    title: "Track Learning Progress",
    description:
      "Keep track of your performance, correct answers, and repeated attempts to monitor your learning curve.",
  },
  {
    icon: "Sparkle",
    title: "Create Flashcards Instantly",
    description:
      "Turn documents into clean, effective flashcards with one click — ready to study or share.",
  },
  {
    icon: "Users",
    title: "Organize Into Classes",
    description:
      "Easily group students and materials by class. Share tests, track progress, and manage everything in one place.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32 mx-auto">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-purple mb-2 tracking-wider">Benefits</h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Shortcut to Smarter Learning
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you&apos;re a student preparing for exams or a teacher building
            resources, our platform helps you learn faster and teach smarter
            using AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={32}
                    className="mb-6 text-purple-500"
                  />
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
