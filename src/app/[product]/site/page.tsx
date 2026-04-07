import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectSitePage } from "@/components/ProjectSitePage";
import {
  PRODUCT_SITES,
  PRODUCT_SITE_SLUGS,
} from "@/lib/project-site-content";

type PageProps = {
  params: {
    product: string;
  };
};

export function generateStaticParams() {
  return PRODUCT_SITE_SLUGS.map((product) => ({ product }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = PRODUCT_SITES[params.product];

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | Turboware`,
    description: product.heroSubtitle,
  };
}

export default function ProductSiteRoute({ params }: PageProps) {
  const product = PRODUCT_SITES[params.product];

  if (!product) {
    notFound();
  }

  return <ProjectSitePage product={product} />;
}
