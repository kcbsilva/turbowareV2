import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectSitePage } from "@/components/ProjectSitePage";
import {
  PRODUCT_SITES,
  PRODUCT_SITE_SLUGS,
} from "@/lib/project-site-content";

type PageProps = {
  params: Promise<{
    product: string;
  }>;
};

export function generateStaticParams() {
  return PRODUCT_SITE_SLUGS.map((product) => ({ product }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: slug } = await params;
  const product = PRODUCT_SITES[slug];

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | Turboware`,
    description: product.heroSubtitle,
  };
}

export default async function ProductSiteRoute({ params }: PageProps) {
  const { product: slug } = await params;
  const product = PRODUCT_SITES[slug];

  if (!product) {
    notFound();
  }

  return <ProjectSitePage product={product} />;
}
