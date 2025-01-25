export type Class = {
  id: number;
  created_at: string;
  title: string;
  image_url: string;
  description1: string;
  description2: string;
  members: string[];
}

export type CardsProps = {
  cards: Class[];
  navigateTo: string;
}