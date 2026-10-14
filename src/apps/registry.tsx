import type { ComponentType } from "react";
import type { Size } from "../desktop/windowManager";
import { AboutApp } from "./AboutApp";
import { ContactApp } from "./ContactApp";
import { ExperienceApp } from "./ExperienceApp";
import { ProjectsApp } from "./ProjectsApp";
import { SkillsApp } from "./SkillsApp";
import { TerminalApp } from "./TerminalApp";

export type AppMeta = {
  id: string;
  title: string;
  icon: string;
  iconBg: string;
  size: Size;
  Comp: ComponentType;
};

export const APPS: AppMeta[] = [
  { id: "about", title: "about.exe", icon: "👤", iconBg: "linear-gradient(135deg, #4b6bff 0%, #5e9cf5 100%)", size: { w: 540, h: 600 }, Comp: AboutApp },
  { id: "experience", title: "experience.exe", icon: "💼", iconBg: "linear-gradient(135deg, #ff7eb6 0%, #f472b6 100%)", size: { w: 600, h: 620 }, Comp: ExperienceApp },
  { id: "projects", title: "projects.exe", icon: "📁", iconBg: "linear-gradient(135deg, #f6a96a 0%, #fb923c 100%)", size: { w: 740, h: 580 }, Comp: ProjectsApp },
  { id: "skills", title: "skills.exe", icon: "⚡", iconBg: "linear-gradient(135deg, #43e4a5 0%, #34d399 100%)", size: { w: 700, h: 560 }, Comp: SkillsApp },
  { id: "contact", title: "contact.exe", icon: "✉️", iconBg: "linear-gradient(135deg, #c4b1ff 0%, #a78bfa 100%)", size: { w: 580, h: 620 }, Comp: ContactApp },
  { id: "terminal", title: "terminal", icon: ">_", iconBg: "linear-gradient(135deg, #2a2a33 0%, #15151b 100%)", size: { w: 640, h: 420 }, Comp: TerminalApp },
];

export const appById = (id: string) => APPS.find((a) => a.id === id);
