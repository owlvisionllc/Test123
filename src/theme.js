// Theme tokens — v0.6
// Lifted verbatim from mockups/owlvision-portal-dashboard-v0.5.jsx. These are
// the reviewed values; do not tune them here without a look at the mockup.

import { createContext, useContext } from "react";

export const THEMES = {
  light: {
    mode: "light",
    shell: "#DDE2DD",
    paper: "#EFF2EF",
    card: "#FFFFFF",
    ink: "#0C0F0C",
    bar: "#0C0F0C",
    barInk: "#FFFFFF",
    hero: "#0F4A20",
    heroInk: "#FFFFFF",
    heroSub: "#B9D6C2",
    heroBack: "#9FD8AF",
    deep: "#0F4A20",
    deepInk: "#FFFFFF",
    green: "#1B7A33",
    bright: "#2DCC52",
    brightInk: "#08130B",
    line: "#DCE1DC",
    empty: "#E6EAE6",
    ash: "#79817A",
    amber: "#9A5510",
    red: "#A32B22",
    inputBg: "#FFFFFF",
    waiting: "#F2F4F2",
  },
  dark: {
    mode: "dark",
    shell: "#050705",
    paper: "#0E110F",
    card: "#171B18",
    ink: "#EDF1EE",
    bar: "#060806",
    barInk: "#EDF1EE",
    hero: "#0D3A19",
    heroInk: "#FFFFFF",
    heroSub: "#9CBFA6",
    heroBack: "#7EC993",
    deep: "#1B7A33",
    deepInk: "#E6F7EB",
    green: "#4FD973",
    bright: "#2DCC52",
    brightInk: "#08130B",
    line: "#262D27",
    empty: "#212721",
    ash: "#8A938C",
    amber: "#D79A4A",
    red: "#D9584C",
    inputBg: "#101410",
    waiting: "#1A1F1B",
  },
};

export const MONO = "'IBM Plex Mono', ui-monospace, monospace";
export const SANS = "'Archivo', -apple-system, system-ui, sans-serif";

export const STAGES = ["Intake", "Labor", "Positions", "Tasks", "Schedule"];

export const STAGE_BLURB = {
  Intake: "Scope, billing, walkthrough answers and photos.",
  Labor: "Days, shifts, call times. Produces the quote you type into Flex.",
  Positions: "Every slot on every shift gets a name and a position.",
  Tasks: "Scope becomes work. Leads take their departments.",
  Schedule: "Call times crossed with tasks. Load-in forward, load-out reverse.",
};

export const STAGE_FEEDS = {
  Intake: "Feeds Labor: how many days, what departments, what hours.",
  Labor: "Feeds Positions: one row per person, per shift.",
  Positions: "Feeds Tasks: leads own departments, hands get assigned.",
  Tasks: "Feeds Schedule: durations and dependencies become a running order.",
  Schedule: "The last piece of paper. Nothing downstream.",
};

export const ThemeCtx = createContext(THEMES.light);
export const useT = () => useContext(ThemeCtx);
