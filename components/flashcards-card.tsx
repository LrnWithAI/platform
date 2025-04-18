import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const renderTextWithLineBreaks = (text: string) => {
  return text.split("\n").map((line, index) => (
    <p key={index}>{line}</p> // Each line gets rendered as a new <p> element
  ));
};

export default function FlashcardsCard({
  term,
  definition,
  isStarred,
  toggleStar,
  showBack,
  flip,
}: {
  term: string;
  definition: string;
  isStarred: boolean;
  toggleStar: () => void;
  showBack: boolean;
  flip: () => void;
}) {
  return (
    <div className="lg:w-[900px] lg:h-[500px] w-80 h-64">
      {/* Card Flip Button */}
      <button
        type="button"
        onClick={flip}
        className="w-full h-full outline-none [perspective:50rem]"
      >
        <div
          className={cn(
            "relative w-full h-full transition duration-500 [transform-style:preserve-3d]",
            showBack && "[transform:rotateX(180deg)]"
          )}
        >
          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl border bg-gray-100 dark:bg-muted text-black dark:text-white p-4 text-xl text-center">
              {/* Star on the front */}
              <div
                onClick={toggleStar}
                className="absolute right-4 top-5 z-10 text-yellow-400 hover:scale-110 transition cursor-pointer"
              >
                {isStarred ? (
                  <Star size={18} fill="currentColor" />
                ) : (
                  <Star size={18} />
                )}
              </div>

              {/* Term with line breaks */}
              {renderTextWithLineBreaks(term)}
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateX(180deg)]">
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl border bg-gray-100 dark:bg-muted text-black dark:text-white p-4 text-xl text-center">
              {/* Star on the back */}
              <div
                onClick={toggleStar}
                className="absolute right-4 top-5 z-10 text-yellow-400 hover:scale-110 transition cursor-pointer"
              >
                {isStarred ? (
                  <Star size={18} fill="currentColor" />
                ) : (
                  <Star size={18} />
                )}
              </div>

              {/* Definition with line breaks */}
              {renderTextWithLineBreaks(definition)}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
