import { Separator } from "@/components/ui/separator";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export const FooterSection = () => {
  return (
    <footer id="footer" className="container py-4 sm:py-12 mx-auto">
      <div className="p-10 bg-card border border-secondary rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-x-12 gap-y-8">
          <div className="col-span-full xl:col-span-2">
            <Link href="/" className="flex font-bold items-center">
              <BrainCircuit className="w-8 h-8 mr-2 text-primary" />
              <h3 className="text-2xl">LrnWithAI</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Contact</h3>
            <div>
              <Link
                href="https://github.com/lrnwithai"
                className="opacity-60 hover:opacity-100"
                target="_blank"
              >
                GitHub
              </Link>
            </div>
            <div>
              <Link
                href="mailto:info@lrnwithai.com"
                className="opacity-60 hover:opacity-100"
              >
                Email
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Platforms</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Web
              </Link>
            </div>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                iOS (coming soon)
              </Link>
            </div>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Android (coming soon)
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Help</h3>
            <div>
              <Link href="/contact" className="opacity-60 hover:opacity-100">
                Contact Us
              </Link>
            </div>
            <div>
              <Link href="/faq" className="opacity-60 hover:opacity-100">
                FAQ
              </Link>
            </div>
            <div>
              <Link href="/feedback" className="opacity-60 hover:opacity-100">
                Feedback
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <section className="flex justify-center">
          <h3 className="text-sm text-muted-foreground">
            &copy; 2025 Built with ❤️ by
            <Link
              target="_blank"
              href="https://github.com/matejbendik"
              className="text-primary transition-all border-primary hover:border-b-2 ml-1"
            >
              Matej Bendik
            </Link>{" "}
            &{" "}
            <Link
              target="_blank"
              href="https://github.com/miroslavgit"
              className="text-primary transition-all border-primary hover:border-b-2 ml-1"
            >
              Miroslav Hanisko
            </Link>
          </h3>
        </section>
      </div>
    </footer>
  );
};
