import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "TabletSmartphone",
    title: "Fully Responsive",
    description:
      "Access your tests and flashcards from any device — desktop, tablet, or mobile — for learning on the go.",
  },
  {
    icon: "BadgeCheck",
    title: "Accurate AI Generation",
    description:
      "Our AI is fine-tuned to create relevant, fact-based questions and flashcards from your uploaded content.",
  },
  {
    icon: "Goal",
    title: "Collaborative Classes",
    description:
      "Create and manage classes where teachers and students can share tests, flashcards, and track collective progress.",
  },
  {
    icon: "PictureInPicture",
    title: "PDF to Content Conversion",
    description:
      "Upload a PDF and instantly generate tests or flashcards without manual input or formatting.",
  },
  {
    icon: "MousePointerClick",
    title: "One-Click Study Tools",
    description:
      "Instantly generate, preview, and interact with quizzes and flashcards in just a few clicks.",
  },
  {
    icon: "Newspaper",
    title: "Clean & Modern UI",
    description:
      "Enjoy a sleek, distraction-free interface optimized for focus, speed, and accessibility.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32 mx-auto">
      <h2 className="text-lg text-purple text-center mb-2 tracking-wider">
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        What Makes LrnWithAI Different
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Built for learners and educators, our platform streamlines the studying
        process using intelligent automation, progress tracking, and intuitive
        UX.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
