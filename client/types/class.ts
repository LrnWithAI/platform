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
  cardsType: string;
  navigateTo: string;
}

export type ClassStore = {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
}