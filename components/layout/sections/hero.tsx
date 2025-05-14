"use client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <section className="mx-auto">
      <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
        <div className="text-center space-y-8">
          <Badge variant="outline" className="text-sm py-2">
            <span className="mr-2 text-primary">
              <Badge className="bg-purple hover:bg-violet-500 text-white hover:text-white">
                New
              </Badge>
            </span>
            <span> Classes now supported! </span>
          </Badge>

          <div className="max-w-screen-md mx-auto text-center text-4xl md:text-6xl font-bold">
            <h1>
              Learn smarter with
              <span className="text-transparent px-2 bg-gradient-to-r from-purple to-primary bg-clip-text">
                AI-generated tests
              </span>
              and flashcards
            </h1>
          </div>

          <p className="max-w-screen-sm mx-auto text-xl text-muted-foreground">
            Upload your PDFs and instantly generate quizzes or study materials
            powered by AI. Start testing and learning more efficiently than
            ever.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button
              onClick={() => router.push("/register")}
              className="w-5/6 md:w-1/4 bg-purple font-bold group/arrow hover:bg-violet-500 text-white hover:text-white"
            >
              Get Started
              <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
            </Button>

            <Button asChild variant="outline">
              <Link href="https://github.com/lrnwithai" target="_blank">
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative group mt-14">
          <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>
          <Image
            width={1200}
            height={1200}
            className="w-full md:w-[1200px] mx-auto rounded-xl relative rouded-xl leading-none flex items-center border border-t-2 border-secondary  border-t-primary/20"
            src={theme === "light" ? "/dashboard.jpeg" : "/dashboard.jpeg"}
            alt="dashboard"
          />

          <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg"></div>
        </div>
      </div>
    </section>
  );
};
