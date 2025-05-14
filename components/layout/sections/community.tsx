import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const CommunitySection = () => {
  return (
    <section id="community" className="py-8 mx-auto">
      <hr className="border-secondary" />
      <div className="flex py-12 sm:py-12 justify-center">
        <div className="lg:w-[60%] mx-auto">
          <Card className="bg-background border-none shadow-none text-center flex flex-col items-center justify-center">
            <CardHeader>
              <CardTitle className="text-4xl md:text-5xl font-bold flex flex-col items-center">
                👋
                <div>
                  Ready to unlock
                  <span className="text-transparent pl-2 bg-gradient-to-r from-purple to-primary bg-clip-text">
                    smarter studying?
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="lg:w-[80%] text-xl text-muted-foreground">
              Upload your materials and let AI do the rest. Instantly generate
              tests, flashcards, notes and share them in classes — all in one
              place.
            </CardContent>

            <CardFooter>
              <Button
                className="bg-purple font-bold hover:bg-violet-500 text-white hover:text-white"
                asChild
              >
                <a href="/register">Get Started</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <hr className="border-secondary" />
    </section>
  );
};
