import GithubIcon from "@/components/icons/github-icon";
import LinkedInIcon from "@/components/icons/linkedin-icon";
import XIcon from "@/components/icons/x-icon";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
interface TeamProps {
  imageUrl: string;
  firstName: string;
  lastName: string;
  positions: string[];
  socialNetworks: SocialNetworkProps[];
}
interface SocialNetworkProps {
  name: string;
  url: string;
}
export const TeamSection = () => {
  const teamList: TeamProps[] = [
    {
      imageUrl:
        "https://jqzyiqnsulcfvylzxrbp.supabase.co/storage/v1/object/public/avatars//4cd79d7c-103f-43b9-a3c1-f798c6b0f81d-0.2916389022447934.png",
      firstName: "Matej",
      lastName: "Bendík",
      positions: ["Full Stack Web Developer", "AI-Driven UX Integrator"],
      socialNetworks: [
        {
          name: "LinkedIn",
          url: "https://www.linkedin.com/in/matejbendik",
        },
        {
          name: "Github",
          url: "https://github.com/MatejBendik",
        },
      ],
    },
    {
      imageUrl:
        "https://jqzyiqnsulcfvylzxrbp.supabase.co/storage/v1/object/public/avatars//mirek_fotka.JPEG",
      firstName: "Miroslav",
      lastName: "Hanisko",
      positions: ["Full Stack Web Developer", "System Architecture Lead"],
      socialNetworks: [
        {
          name: "LinkedIn",
          url: "https://www.linkedin.com/in/miroslavhanisko",
        },
        {
          name: "Github",
          url: "https://github.com/miroslavgit",
        },
      ],
    },
  ];

  const socialIcon = (socialName: string) => {
    switch (socialName) {
      case "LinkedIn":
        return <LinkedInIcon />;
      case "Github":
        return <GithubIcon />;
      case "X":
        return <XIcon />;
    }
  };

  return (
    <section id="team" className="container lg:w-[75%] py-16 sm:py-20 mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-lg text-purple text-center mb-2 tracking-wider">
          Team
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          The Company Dream Team
        </h2>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 justify-items-center w-fit">
          {teamList.map(
            (
              { imageUrl, firstName, lastName, positions, socialNetworks },
              index
            ) => (
              <Card
                key={index}
                className="w-full max-w-xs bg-muted/60 dark:bg-card flex flex-col h-full overflow-hidden group/hoverimg"
              >
                <CardHeader className="p-0 gap-0">
                  <div className="h-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt=""
                      width={300}
                      height={300}
                      className="w-full aspect-square object-cover saturate-0 transition-all duration-200 ease-linear size-full group-hover/hoverimg:saturate-100 group-hover/hoverimg:scale-[1.01]"
                    />
                  </div>
                  <CardTitle className="py-6 pb-4 px-6">
                    {firstName}
                    <span className="text-primary ml-2">{lastName}</span>
                  </CardTitle>
                </CardHeader>
                {positions.map((position, index) => (
                  <CardContent
                    key={index}
                    className={`pb-0 text-muted-foreground ${index === positions.length - 1 && "pb-6"
                      }`}
                  >
                    {position}
                    {index < positions.length - 1 && <span>,</span>}
                  </CardContent>
                ))}

                <CardFooter className="space-x-4 mt-auto">
                  {socialNetworks.map(({ name, url }, index) => (
                    <Link
                      key={index}
                      href={url}
                      target="_blank"
                      className="hover:opacity-80 transition-all"
                    >
                      {socialIcon(name)}
                    </Link>
                  ))}
                </CardFooter>
              </Card>
            )
          )}
        </div>
      </div>
    </section>
  );
};
