class AppColors {
  private static cssVar(cssVarName: string, fallback: string): string {
    return `var(${cssVarName}, ${fallback})`;
  }

  static primary(): string {
    return this.cssVar("--color-primary", "oklch(0.5854 0.2041 277.1173)");
  }

  static background(): string {
    return this.cssVar("--color-background", "oklch(0.9842 0.0034 247.8575)");
  }

  static card(): string {
    return this.cssVar("--color-card", "oklch(1.0000 0 0)");
  }

  static foreground(): string {
    return this.cssVar("--color-foreground", "oklch(0.2795 0.0368 260.0310)");
  }

  static border(): string {
    return this.cssVar("--color-border", "oklch(0.8717 0.0093 258.3382)");
  }

  static sidebar(): string {
    return this.cssVar("--color-sidebar", "oklch(0.9670 0.0029 264.5419)");
  }

  static sidebarForeground(): string {
    return this.cssVar(
      "--color-sidebar-foreground",
      "oklch(0.2795 0.0368 260.0310)",
    );
  }

  static sidebarBorder(): string {
    return this.cssVar("--color-sidebar-border", "oklch(0.8717 0.0093 258.3382)");
  }

  static accent(): string {
    return this.cssVar("--color-accent", "oklch(0.9299 0.0334 272.7879)");
  }

  static accentForeground(): string {
    return this.cssVar("--color-accent-foreground", "oklch(0.3729 0.0306 259.7328)");
  }

  static destructive(): string {
    return this.cssVar("--color-destructive", "oklch(0.6368 0.2078 25.3313)");
  }

  static mutedForeground(): string {
    return this.cssVar("--color-muted-foreground", "oklch(0.5510 0.0234 264.3637)");
  }

  static overlay(alpha = 0.35): string {
    return `color-mix(in oklch, var(--color-foreground, oklch(0.2795 0.0368 260.0310)) ${alpha * 100}%, transparent)`;
  }
}
