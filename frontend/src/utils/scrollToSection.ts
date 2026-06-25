/** Scroll to an in-page section (works inside AppLayout overflow containers). */
export function scrollToPageSection(sectionId: string): boolean {
  const target = document.getElementById(sectionId);
  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.focus({ preventScroll: true });
  return true;
}
