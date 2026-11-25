import { getImageUrl } from './imageUtils';

export interface IBanner {
  _id: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  status: string;
}

export interface ISlide {
  id: string;
  image: string;
  mobileImage: string | null;
  alt: string;
  headline: string;
  subheadline: string;
}

/** Active banners from GET /banners as hero slides (same image resolver as every other image). */
export const toSlides = (banners: IBanner[] | undefined): ISlide[] =>
  (banners ?? [])
    .filter((b) => b.status === 'ACTIVE' && b.image)
    .map((b) => ({
      id: b._id,
      image: getImageUrl(b.image),
      mobileImage: b.mobileImage ? getImageUrl(b.mobileImage) : null,
      alt: b.title || 'Luxy Galleria',
      headline: b.title,
      subheadline: b.description,
    }));
