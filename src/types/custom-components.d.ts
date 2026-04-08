interface BsAlertDialog {
  // Singleton — use BsAlertDialog.show(config) static method
}

interface BsAlertDialogStatic {
  show(config: BsAlertDialogConfig): void;
}

interface BsAvatar {
  setSrc(src: string): this;
  setAlt(alt: string): this;
  setFallback(fallback: string): this;
  setShape(shape: "full" | "rounded" | "square"): this;
}

/** Port of new_proj `ToolTip.ts` — Basecoat `data-tooltip` / `data-side` / `data-align`. */
interface BsTooltip {
  getText(): string;
  setText(text: string): void;
  getSide(): "top" | "bottom" | "left" | "right";
  setSide(side: "top" | "bottom" | "left" | "right"): void;
  getAlign(): "start" | "center" | "end";
  setAlign(align: "start" | "center" | "end"): void;
  getEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  attachTo(widget: qx.ui.core.Widget | null): void;
  detachFrom(widget: qx.ui.core.Widget | null): void;
  detachAll(): void;
  getTargets(): qx.ui.core.Widget[];
  dispose(): void;
}

interface BsButton {
  getVariant():
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  getSize(): "default" | "sm" | "lg" | "icon" | "sm-icon" | "lg-icon";
  onClick(handler: () => void): this;
}

interface BsBasecoatButton {
  getLabel(): string;
  setLabel(label: string): this;
  getVariant():
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  getSize(): "default" | "sm" | "lg" | "icon" | "sm-icon" | "lg-icon";
  onClick(handler: () => void): this;
  setBasecoatToolTip(
    text: string,
    side?: "top" | "bottom" | "left" | "right",
    align?: "start" | "center" | "end",
  ): this;
  clearBasecoatToolTip(): this;
  getBasecoatToolTip(): BsTooltip | null;
}

interface BsDrawer {
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
}

interface BsInput {
  getValue(): string;
  setValue(value: string): this;
  setPlaceholder(value: string): this;
  setLeadingHtml(html: string): this;
  onInput(handler: (value: string) => void): this;
}

interface BsInputGroup {
  onInput(handler: (value: string) => void): this;
  getValue(): string;
  setValue(value: string): this;
  setError(message?: string): this;
  clearError(): this;
  getInputWidget(): BsInput;
  setInputTabIndex(value: number): this;
  resetInputTabIndex(): this;
}

interface BsPassword {
  getValue(): string;
  setValue(value: string): this;
  setPlaceholder(value: string): this;
  onInput(handler: (value: string) => void): this;
}

interface BsSelect {
  getSelectedValue(): string;
  setSelectedByLabel(label: string): this;
  resetSelection(): this;
  onChange(handler: (value: string) => void): this;
}

interface BsSeparator {
  setLabel(value: string): this;
}

interface BsSidebarAccount {
  setCollapsed(collapsed: boolean): this;
  setName(name: string): this;
  setUsername(username: string): this;
  setAvatar(src: string, fallback?: string): this;
  onAction(handler: (action: string) => void): this;
  onClick(handler: () => void): this;
}

interface BsSidebarButton {
  setActive(active: boolean): this;
  setCollapsed(collapsed: boolean): this;
  setTrailingHtml(html: string): this;
  onClick(handler: () => void): this;
}

interface BsTextarea {
  getValue(): string;
  setValue(value: string): this;
  setPlaceholder(value: string): this;
  setRows(rows: number): this;
  onInput(handler: (value: string) => void): this;
}

interface BsCheckBox {
  getLabel(): string;
  setLabel(value: string): this;
  getValue(): boolean;
  setValue(value: boolean): this;
}

interface BsDateField {
  getValue(): Date | null;
  setValue(value: Date | null): this;
  resetValue(): void;
  focus(): void;
  blur(): void;
}

interface BsTable {
  getCaption(): string;
  setCaption(caption: string): this;
  getPageSize(): number;
  setPageSize(pageSize: number): this;
  getCurrentPage(): number;
  setCurrentPage(currentPage: number): this;
  getTotalRows(): number;
  setTotalRows(totalRows: number): this;
  getPagination(): boolean;
  setPagination(enabled: boolean): this;
  setPaginationEnabled(enabled: boolean): this;
  getTotalPages(): number;
  goToPage(page: number): void;
  nextPage(): void;
  previousPage(): void;
  setHeaders(headers: string[]): void;
  addRow(
    rowData: unknown[],
    index?: number | null,
    rowDataObj?: unknown,
  ): void;
  removeRow(index: number): void;
  clearRows(): void;
  addFooterRow(rowData: unknown[]): void;
  clearFooterRows(): void;
  getRows(): { cells: { text: string; classes: string; align: string }[] }[];
  getAllRows(): { cells: { text: string; classes: string; align: string }[] }[];
  setRows(rows: unknown[][]): void;
  getRowCount(): number;
  getTotalRowCount(): number;
}

interface BsPagination {
  getCurrentPage(): number;
  setCurrentPage(page: number): this;
  getTotalPages(): number;
  setTotalPages(total: number): this;
}

interface BsComboBox {
  add(item: qx.ui.form.ListItem | string): void;
  getValue(): string;
  setValue(valueOrLabel: string): void;
  getSelection(): unknown[];
  resetSelection(): void;
  focus(): void;
  blur(): void;
}

interface BsDialog {
  getTitle(): string;
  setTitle(value: string): this;
  getDescription(): string;
  setDescription(value: string): this;
  getCancelLabel(): string;
  setCancelLabel(value: string): this;
  getSaveLabel(): string;
  setSaveLabel(value: string): this;
  getSaveIntent(): "primary" | "destructive";
  setSaveIntent(value: "primary" | "destructive"): this;
  getSize(): "sm" | "md" | "lg" | "xl" | "full" | "custom";
  setSize(value: "sm" | "md" | "lg" | "xl" | "full" | "custom"): this;
  getDialogMaxWidth(): string;
  setDialogMaxWidth(value: string): this;
  getDialogMaxHeight(): string;
  setDialogMaxHeight(value: string): this;
  getRichSectionContent(): boolean;
  setRichSectionContent(value: boolean): this;
  show(): void;
  close(): void;
  setSectionContent(html: string | null | undefined): void;
  getSectionElement(): HTMLElement | null;
  getDialogElement(): HTMLDialogElement | null;
}

interface BsRadioButton {
  getLabel(): string;
  setLabel(label: string): this;
  getValue(): string;
  setValue(value: string): this;
  getChecked(): boolean;
  setChecked(checked: boolean): this;
  getGroupName(): string;
  setGroupName(name: string): this;
  toggle(): void;
}

interface BsRadioButtonGroup {
  add(radioButton: BsRadioButton): void;
  getGroupName(): string;
  setGroupName(name: string): this;
  getValue(): string | null;
  setValue(value: string | null): this;
  getRadioChildren(): BsRadioButton[];
  clearSelection(): void;
}

interface BsToastShowConfig {
  category?: string;
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick?: (detail: {
      id: string;
      toast: HTMLElement;
      category: string;
    }) => void;
  };
  cancel?: { label?: string } | null;
}

interface BsToast {
  setAlign(value: "start" | "center" | "end"): this;
  getAlign(): "start" | "center" | "end";
  setPlacement(value: string): this;
  getPlacement(): string;
  setOffsetX(value: number): this;
  getOffsetX(): number;
  setOffsetY(value: number): this;
  getOffsetY(): number;
  setDefaultDuration(value: number): this;
  getDefaultDuration(): number;
  setStackLimit(value: number): this;
  getStackLimit(): number;
  setRichDescription(value: boolean): this;
  getRichDescription(): boolean;
  show(config?: BsToastShowConfig): string | null;
  toast(config?: BsToastShowConfig): string | null;
  dismiss(toastId: string): void;
  clear(): void;
}
