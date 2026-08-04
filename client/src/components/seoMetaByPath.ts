import { proxy } from "valtio";

export type SeoMeta = {
  meta_title: string;
  meta_description: string;
  meta_image_url: string;
};

export const seoMetaByPath = proxy<Record<string, SeoMeta>>({});
