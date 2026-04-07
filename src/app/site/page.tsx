"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Database,
  Headphones,
  Map,
  Network,
  type LucideIcon,
} from "lucide-react";
import turbowareLogo from "../assets/turboware-logo.png";

type Project = {
  name: string;
  category: string;
  accent: string;
  icon: LucideIcon;
  href: string;
  description: string;
};

const PROJECTS: Project[] = [
  {
    name: "TurboISP",
    category: "Network Operations",
    accent: "#1AABF0",
    icon: Network,
    href: "/turboisp/site",
    description:
      "End-to-end operational platform for Internet Service Providers combining CRM, billing, network documentation, automation, and multichannel communication in a single system. TurboISP enables multi-PoP management, real-time visibility, workflow automation, and scalable operations from small ISPs to carrier-grade deployments.",
  },
  {
    name: "TurboChat",
    category: "Customer Conversations",
    accent: "#ff8a3d",
    icon: Headphones,
    href: "/turbochat/site",
    description:
      "A unified customer communication platform that delivers automated support and engagement across Meta, Telegram, and 0800 voice channels from a single interface.",
  },
  {
    name: "TurboAgent",
    category: "Agent Automation",
    accent: "#7dd56f",
    icon: Bot,
    href: "/turboagent/site",
    description:
      "An AI-powered automation agent designed to execute tasks, orchestrate workflows, and provide intelligent assistance across systems, tools, and operational processes from a single interface.",
  },
  {
    name: "TurboGIS",
    category: "Geospatial Intelligence",
    accent: "#f6c445",
    icon: Map,
    href: "/turbogis/site",
    description:
      "A geographic information system designed to map, document, and manage networks, towers, and infrastructure with precise spatial visualization and asset tracking.",
  },
  {
    name: "TurboInfraBase",
    category: "Infrastructure Database",
    accent: "#ff6b6b",
    icon: Database,
    href: "/turboinfrabase/site",
    description:
      "A unified infrastructure registry that consolidates hydro, water, gas, telecom, and related assets, maintaining a centralized inventory of all infrastructure mapped and managed within TurboGIS.",
  },
];

function getOffset(index: number, activeIndex: number, total: number) {
  let offset = index - activeIndex;
  const midpoint = Math.floor(total / 2);

  if (offset > midpoint) offset -= total;
  if (offset < -midpoint) offset += total;

  return offset;
}

export default function SitePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelLockRef = useRef(false);
  const activeProject = PROJECTS[activeIndex];

  const moveProject = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      const next = current + direction;
      return (next + PROJECTS.length) % PROJECTS.length;
    });
  };

  return (
    <main
      className="h-screen overflow-y-auto overflow-x-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(26,171,240,0.22), transparent 30%), radial-gradient(circle at bottom right, rgba(252,163,17,0.18), transparent 26%), linear-gradient(135deg, #07101d 0%, #09182b 36%, #081221 100%)",
      }}
    >
      <div className="relative isolate min-h-screen">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />

        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:px-10">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[0.78fr_1.22fr]">
            <section className="order-2 flex justify-center lg:order-1">
              <div className="flex flex-col items-center gap-5">
                <button
                  type="button"
                  onClick={() => moveProject(-1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border text-white/70 transition hover:text-white"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                  aria-label="Show previous project"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>

                <div
                  className="relative h-[450px] w-[210px] sm:h-[520px] sm:w-[240px]"
                  onWheel={(event) => {
                    if (event.deltaY === 0) return;
                    if (wheelLockRef.current) return;

                    wheelLockRef.current = true;
                    window.setTimeout(() => {
                      wheelLockRef.current = false;
                    }, 180);

                    moveProject(event.deltaY > 0 ? 1 : -1);
                  }}
                >
                  {PROJECTS.map((project, index) => {
                    const offset = getOffset(
                      index,
                      activeIndex,
                      PROJECTS.length,
                    );
                    const distance = Math.abs(offset);
                    const isActive = offset === 0;
                    const visible = distance <= 3;
                    const Icon = project.icon;

                    return (
                      <button
                        key={project.name}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className="absolute left-1/2 flex w-[190px] -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-500 sm:w-[220px]"
                        style={{
                          top: "50%",
                          opacity: visible ? 1 - distance * 0.22 : 0,
                          pointerEvents: visible ? "auto" : "none",
                          transform: `translate(-50%, calc(-50% + ${offset * 78}px)) scale(${1 - distance * 0.08})`,
                          backgroundColor: isActive
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(255,255,255,0.04)",
                          borderColor: isActive
                            ? `${project.accent}88`
                            : "rgba(255,255,255,0.08)",
                          boxShadow: isActive
                            ? `0 18px 45px ${project.accent}26`
                            : "none",
                        }}
                        aria-pressed={isActive}
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                          style={{
                            backgroundColor: `${project.accent}22`,
                            borderColor: `${project.accent}55`,
                            color: project.accent,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {project.name}
                          </p>
                          <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                            {project.category}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => moveProject(1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border text-white/70 transition hover:text-white"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                  aria-label="Show next project"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section className="order-1 relative lg:order-2">
              <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2">
                <Image
                  src={turbowareLogo}
                  alt="Turboware"
                  className="h-24 w-auto object-contain sm:h-28"
                  priority
                />
              </div>

              <div className="flex min-h-[538px] flex-col sm:min-h-[608px]">
                <div className="flex flex-1 items-center pt-8 sm:pt-10">
                  <div
                    className="w-full rounded-[2rem] border p-6 sm:p-8"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))",
                      borderColor: "rgba(255,255,255,0.12)",
                      boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
                    }}
                  >
                    <div className="mt-8">
                      <h2 className="mt-8 text-4xl font-black tracking-[-0.06em]">
                        {activeProject.name}
                      </h2>
                      <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg text-justify">
                        {activeProject.description}
                      </p>
                      <div className="mt-8 flex justify-end">
                        <Link
                          href={activeProject.href}
                          className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                          style={{ backgroundColor: activeProject.accent }}
                        >
                          Go to {activeProject.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <footer className="w-full pr-38 pt-4 text-right text-[11px] uppercase tracking-[0.28em] text-white/40 sm:pr-56">
                  © {new Date().getFullYear()} Turboware
                </footer>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
