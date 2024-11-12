export interface NavLink {
  title: string;
  link?: string;
  icon: {
    name?: string;
    set?: string;
    src?: string;
  };
  alignBottom?: boolean;
}
