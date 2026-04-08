/**
 * Basecoat-styled data table with optional built-in pagination (port of new_proj Table).
 */
type BsTableCellInput =
  | string
  | number
  | {
      text?: string;
      value?: string;
      classes?: string;
      className?: string;
      align?: string;
      textAlign?: string;
      colspan?: number;
    };

interface BsTableInternalCell {
  text: string;
  classes: string;
  align: string;
  colspan?: number;
}

interface BsTableInternalRow {
  cells: BsTableInternalCell[];
  data: unknown;
}

class BsTable extends qx.ui.core.Widget {
  static events = {
    rowClick: "qx.event.type.Data",
    pageChange: "qx.event.type.Data",
  };

  private __html: qx.ui.embed.Html;
  private __tableElement: HTMLTableElement | null = null;
  private __captionElement: HTMLElement | null = null;
  private __theadElement: HTMLTableSectionElement | null = null;
  private __tbodyElement: HTMLTableSectionElement | null = null;
  private __tfootElement: HTMLTableSectionElement | null = null;
  private __tableId: string;
  private __initialCaption: string;
  private __headers: string[] = [];
  private __allRows: BsTableInternalRow[] = [];
  private __rows: BsTableInternalRow[] = [];
  private __footerRows: BsTableInternalRow[] = [];
  private __columnWidths: (number | null)[] = [];
  private __isResizing = false;
  private __resizeColumnIndex: number | null = null;
  private __resizeStartX: number | null = null;
  private __resizeStartWidth: number | null = null;
  private __rowClickHandler: ((e: MouseEvent) => void) | null = null;

  private __paginationContainer: HTMLElement | null = null;
  private __paginationPages: HTMLElement | null = null;
  private __paginationPrev: HTMLElement | null = null;
  private __paginationNext: HTMLElement | null = null;
  private __paginationEllipsis: HTMLElement | null = null;
  private __paginationClickHandler: ((e: MouseEvent) => void) | null = null;

  private __currentPage = 1;
  private __pageSize = 10;
  private __totalRows = 0;
  private __paginationEnabled = false;
  private __caption = "";

  constructor(caption = "") {
    super();
    this._setLayout(new qx.ui.layout.Canvas());
    this.__initialCaption = caption;
    this.__tableId = `table-${this.toHashCode()}`;

    this.__html = new qx.ui.embed.Html(`
      <div class="table-container" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
        <div class="overflow-x-auto" style="flex: 1; overflow: auto;">
          <table class="table" id="${this.__tableId}" style="border: 1px solid var(--border); border-collapse: collapse; width: 100%;">
            <caption></caption>
            <thead></thead>
            <tbody></tbody>
            <tfoot></tfoot>
          </table>
        </div>
        <nav role="navigation" aria-label="pagination" class="pagination-container mx-auto flex w-full justify-center" style="display: none; padding: 16px 0; margin-top: 8px; border-top: 1px solid var(--border); overflow: visible; flex-shrink: 0; min-height: 60px;">
          <ul class="pagination-pages-list flex flex-row items-center gap-1" style="display: flex; flex-direction: row; flex-wrap: nowrap; list-style: none; margin: 0; padding: 0; gap: 4px; overflow: visible; align-items: center;">
            <li style="flex-shrink: 0;">
              <a href="#" class="btn-ghost pagination-prev" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m15 18-6-6 6-6" /></svg>
                <span>Previous</span>
              </a>
            </li>
            <li class="pagination-pages" style="display: flex; flex-direction: row; flex-wrap: nowrap;"></li>
            <li>
              <div class="pagination-ellipsis size-9 flex items-center justify-center" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
              </div>
            </li>
            <li style="flex-shrink: 0;">
              <a href="#" class="btn-ghost pagination-next" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
                <span>Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m9 18 6-6-6-6" /></svg>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    `);

    this._add(this.__html, { edge: 0 });

    this.__html.addListenerOnce("appear", () => {
      const container = this.__html.getContentElement().getDomElement();

      this.__tableElement = container.querySelector(
        `#${this.__tableId}`,
      ) as HTMLTableElement | null;
      this.__captionElement = this.__tableElement
        ? (this.__tableElement.querySelector("caption") as HTMLElement | null)
        : null;
      this.__theadElement = this.__tableElement
        ? (this.__tableElement.querySelector("thead") as HTMLTableSectionElement | null)
        : null;
      this.__tbodyElement = this.__tableElement
        ? (this.__tableElement.querySelector("tbody") as HTMLTableSectionElement | null)
        : null;
      this.__tfootElement = this.__tableElement
        ? (this.__tableElement.querySelector("tfoot") as HTMLTableSectionElement | null)
        : null;

      this.__paginationContainer = container.querySelector(".pagination-container");
      this.__paginationPages = container.querySelector(".pagination-pages");
      this.__paginationPrev = container.querySelector(".pagination-prev");
      this.__paginationNext = container.querySelector(".pagination-next");
      this.__paginationEllipsis = container.querySelector(".pagination-ellipsis");

      if (this.__paginationEnabled && this.__paginationContainer) {
        this.__paginationContainer.style.display = "flex";
        this.__updatePagination();
      }

      if (this.__tableElement) {
        this.__tableElement.style.border = "1px solid var(--border)";
        this.__tableElement.style.borderCollapse = "collapse";
        this.__tableElement.style.tableLayout = "auto";
        this.__tableElement.style.width = "100%";
      }

      if (this.__initialCaption) {
        this.setCaption(this.__initialCaption);
      }

      this.__renderTable();

      if (this.__rows.length > 0 && !this.__hasExplicitColumnWidths()) {
        qx.event.Timer.once(() => {
          this.__autoAdjustColumnWidths();
        }, this, 100);
      }

      this.__setupColumnResizing();
      this.__setupRowClickEvents();
    });
  }

  private __escapeHtml(text: unknown): string {
    if (text === null || text === undefined) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  getCaption(): string {
    return this.__caption;
  }

  setCaption(caption: string): this {
    const next = caption ?? "";
    if (this.__caption === next) return this;
    this.__caption = next;
    if (this.__captionElement) {
      this.__captionElement.textContent = next || "";
      this.__captionElement.style.display = next ? "" : "none";
    }
    return this;
  }

  getPageSize(): number {
    return this.__pageSize;
  }

  setPageSize(pageSize: number): this {
    this.__pageSize = pageSize;
    if (this.__paginationEnabled) {
      this.__currentPage = 1;
      this.__updateCurrentPageRows();
      this.__updatePagination();
      this.__renderTable();
    }
    return this;
  }

  getCurrentPage(): number {
    return this.__currentPage;
  }

  setCurrentPage(currentPage: number): this {
    const totalPages = this.getTotalPages();
    let page = currentPage;
    if (page < 1) page = 1;
    else if (page > totalPages && totalPages > 0) page = totalPages;
    this.__currentPage = page;
    if (this.__paginationEnabled) {
      this.__updateCurrentPageRows();
      this.__updatePagination();
      this.__renderTable();
    }
    return this;
  }

  getTotalRows(): number {
    return this.__totalRows;
  }

  setTotalRows(totalRows: number): this {
    this.__totalRows = totalRows;
    if (this.__paginationEnabled) {
      const totalPages = this.getTotalPages();
      if (this.__currentPage > totalPages) {
        this.__currentPage = totalPages > 0 ? totalPages : 1;
      }
      this.__updateCurrentPageRows();
      this.__updatePagination();
      this.__renderTable();
    }
    return this;
  }

  getPagination(): boolean {
    return this.__paginationEnabled;
  }

  setPagination(enabled: boolean): this {
    this.__paginationEnabled = enabled;
    if (enabled) {
      if (this.__allRows.length === 0 && this.__rows.length > 0) {
        this.__allRows = [...this.__rows];
        this.__totalRows = this.__allRows.length;
      }
      this.__updateCurrentPageRows();
      this.__updatePagination();
    } else {
      if (this.__allRows.length > 0) {
        this.__rows = [...this.__allRows];
        this.__renderTable();
      }
    }
    if (this.__paginationContainer) {
      this.__paginationContainer.style.display = enabled ? "flex" : "none";
    }
    return this;
  }

  getTotalPages(): number {
    if (this.__pageSize <= 0) return 0;
    return Math.ceil(this.__totalRows / this.__pageSize);
  }

  setPaginationEnabled(enabled: boolean): this {
    return this.setPagination(enabled);
  }

  goToPage(page: number): void {
    const totalPages = this.getTotalPages();
    let p = page;
    if (p < 1) p = 1;
    if (totalPages > 0 && p > totalPages) p = totalPages;

    const oldPage = this.__currentPage;
    this.__currentPage = p;

    if (this.__paginationEnabled) {
      this.__updateCurrentPageRows();
    }

    this.__updatePagination();
    this.__renderTable();

    if (oldPage !== p) {
      this.fireDataEvent("pageChange", {
        currentPage: p,
        pageSize: this.__pageSize,
        totalPages,
      });
    }
  }

  nextPage(): void {
    const totalPages = this.getTotalPages();
    if (this.__currentPage < totalPages) {
      this.goToPage(this.__currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.__currentPage > 1) {
      this.goToPage(this.__currentPage - 1);
    }
  }

  private __updatePagination(): void {
    if (!this.__paginationContainer || !this.__paginationEnabled) {
      return;
    }

    const totalPages = this.getTotalPages();
    const currentPage = this.__currentPage;

    if (this.__paginationPrev) {
      this.__paginationPrev.style.pointerEvents =
        currentPage <= 1 ? "none" : "";
      this.__paginationPrev.style.opacity = currentPage <= 1 ? "0.5" : "1";
    }

    if (this.__paginationNext) {
      this.__paginationNext.style.pointerEvents =
        currentPage >= totalPages ? "none" : "";
      this.__paginationNext.style.opacity =
        currentPage >= totalPages ? "0.5" : "1";
    }

    if (this.__paginationPages) {
      this.__paginationPages.innerHTML = this.__renderPageNumbers(
        currentPage,
        totalPages,
      );
    }

    if (this.__paginationEllipsis) {
      const showEllipsis =
        totalPages > 7 && currentPage < totalPages - 2;
      this.__paginationEllipsis.style.display = showEllipsis ? "flex" : "none";
    }

    this.__setupPaginationClickHandlers();
  }

  private __renderPageNumbers(
    currentPage: number,
    totalPages: number,
  ): string {
    if (totalPages <= 0) return "";

    let pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      pages = [1, 2, 3, 4, totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [
        1,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pages = [
        1,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        totalPages,
      ];
    }

    let html = "";
    let lastPage = 0;

    pages.forEach((page, idx) => {
      if (idx > 0 && page - lastPage > 1) {
        html += `<li style="display: inline-block;"><div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;"><span>...</span></div></li>`;
      }

      const isActive = page === currentPage;
      const btnStyle = isActive
        ? "background-color: transparent; border: 1px solid var(--border); color: inherit;"
        : "background-color: transparent; border: none; color: inherit;";
      html += `
          <li style="display: inline-block;">
            <a href="#" class="pagination-page-btn ${isActive ? "btn-icon-outline" : "btn-icon-ghost"}" data-page="${page}" tabindex="0" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; ${btnStyle} text-decoration: none; border-radius: var(--radius); cursor: pointer;">
              ${page}
            </a>
          </li>
        `;

      lastPage = page;
    });

    return html;
  }

  private __setupPaginationClickHandlers(): void {
    if (!this.__paginationContainer) return;

    if (this.__paginationClickHandler) {
      this.__paginationContainer.removeEventListener(
        "click",
        this.__paginationClickHandler,
      );
    }

    this.__paginationClickHandler = (e: MouseEvent) => {
      e.preventDefault();

      const target = e.target as HTMLElement;

      if (target.closest(".pagination-prev")) {
        this.previousPage();
        return;
      }

      if (target.closest(".pagination-next")) {
        this.nextPage();
        return;
      }

      const pageBtn = target.closest(
        ".pagination-page-btn",
      ) as HTMLElement | null;
      if (pageBtn) {
        const raw = pageBtn.getAttribute("data-page");
        const pageNum = raw ? parseInt(raw, 10) : NaN;
        if (!isNaN(pageNum)) {
          this.goToPage(pageNum);
        }
      }
    };

    this.__paginationContainer.addEventListener(
      "click",
      this.__paginationClickHandler,
    );
  }

  private __normalizeCell(cell: BsTableCellInput): BsTableInternalCell {
    if (typeof cell === "string" || typeof cell === "number") {
      return { text: String(cell), classes: "", align: "" };
    }
    if (cell && typeof cell === "object") {
      return {
        text: String(cell.text || cell.value || ""),
        classes: cell.classes || cell.className || "",
        align: cell.align || cell.textAlign || "",
      };
    }
    return { text: "", classes: "", align: "" };
  }

  private __normalizeFooterCell(cell: BsTableCellInput): BsTableInternalCell {
    const base = this.__normalizeCell(cell);
    if (cell && typeof cell === "object" && "colspan" in cell) {
      const c = cell as { colspan?: number };
      return { ...base, colspan: c.colspan || 1 };
    }
    return { ...base, colspan: 1 };
  }

  setHeaders(headers: string[]): void {
    this.__headers = headers || [];
    this.__renderTable();
  }

  addRow(
    rowData: BsTableCellInput[],
    index: number | null = null,
    rowDataObj: unknown = null,
  ): void {
    if (!rowData || !Array.isArray(rowData)) {
      return;
    }

    const row: BsTableInternalRow = {
      cells: rowData.map((cell) => this.__normalizeCell(cell)),
      data: rowDataObj || null,
    };

    if (this.__paginationEnabled) {
      if (index === null || index === undefined) {
        this.__allRows.push(row);
      } else {
        this.__allRows.splice(index, 0, row);
      }
      this.__totalRows = this.__allRows.length;
      this.__updateCurrentPageRows();
    } else {
      if (index === null || index === undefined) {
        this.__rows.push(row);
      } else {
        this.__rows.splice(index, 0, row);
      }
    }

    this.__renderTable();

    if (this.__tableElement && !this.__hasExplicitColumnWidths()) {
      qx.event.Timer.once(() => {
        this.__autoAdjustColumnWidths();
      }, this, 100);
    }
  }

  private __updateCurrentPageRows(): void {
    if (!this.__paginationEnabled || this.__allRows.length === 0) {
      this.__rows = [];
      return;
    }

    const startIndex = (this.__currentPage - 1) * this.__pageSize;
    const endIndex = Math.min(
      startIndex + this.__pageSize,
      this.__allRows.length,
    );

    this.__rows = this.__allRows.slice(startIndex, endIndex);
  }

  removeRow(index: number): void {
    if (this.__paginationEnabled) {
      const actualIndex =
        (this.__currentPage - 1) * this.__pageSize + index;
      if (actualIndex >= 0 && actualIndex < this.__allRows.length) {
        this.__allRows.splice(actualIndex, 1);
        this.__totalRows = this.__allRows.length;
        this.__updateCurrentPageRows();
        this.__updatePagination();
        this.__renderTable();
      }
    } else {
      if (index >= 0 && index < this.__rows.length) {
        this.__rows.splice(index, 1);
        this.__renderTable();
      }
    }
  }

  clearRows(): void {
    if (this.__paginationEnabled) {
      this.__allRows = [];
      this.__rows = [];
      this.__totalRows = 0;
      this.__updatePagination();
    } else {
      this.__rows = [];
    }
    this.__renderTable();
  }

  addFooterRow(rowData: BsTableCellInput[]): void {
    if (!rowData || !Array.isArray(rowData)) {
      return;
    }

    const row: BsTableInternalRow = {
      cells: rowData.map((cell) => this.__normalizeFooterCell(cell)),
      data: null,
    };

    this.__footerRows.push(row);
    this.__renderTable();
  }

  clearFooterRows(): void {
    this.__footerRows = [];
    this.__renderTable();
  }

  getRows(): { cells: BsTableInternalCell[] }[] {
    const rows = this.__paginationEnabled ? this.__allRows : this.__rows;
    return rows.map((row) => ({
      cells: row.cells.map((cell) => ({
        text: cell.text,
        classes: cell.classes,
        align: cell.align,
      })),
    }));
  }

  getAllRows(): { cells: BsTableInternalCell[] }[] {
    return this.__allRows.map((row) => ({
      cells: row.cells.map((cell) => ({
        text: cell.text,
        classes: cell.classes,
        align: cell.align,
      })),
    }));
  }

  setRows(rows: BsTableCellInput[][]): void {
    if (!rows || !Array.isArray(rows)) {
      return;
    }

    this.__allRows = rows.map((rowData) => ({
      cells: (rowData || []).map((cell) => this.__normalizeCell(cell)),
      data: null,
    }));

    this.__totalRows = this.__allRows.length;

    if (this.__paginationEnabled) {
      this.__currentPage = 1;
      this.__updateCurrentPageRows();
      this.__updatePagination();
    } else {
      this.__rows = [...this.__allRows];
    }

    this.__renderTable();

    if (this.__tableElement && !this.__hasExplicitColumnWidths()) {
      qx.event.Timer.once(() => {
        this.__autoAdjustColumnWidths();
      }, this, 100);
    }
  }

  getRowCount(): number {
    return this.__paginationEnabled
      ? this.__totalRows
      : this.__rows.length;
  }

  getTotalRowCount(): number {
    return this.__totalRows;
  }

  private __renderTable(): void {
    if (!this.__tableElement) {
      return;
    }

    if (this.__theadElement && this.__headers.length > 0) {
      this.__theadElement.innerHTML = "";
      const headerRow = document.createElement("tr");
      headerRow.style.borderBottom = "1px solid var(--border)";
      headerRow.style.backgroundColor = "var(--secondary)";
      headerRow.style.minHeight = "44px";
      headerRow.style.height = "auto";
      this.__headers.forEach((headerText, index) => {
        const th = document.createElement("th");
        const w = this.__columnWidths[index];
        if (w != null) {
          th.style.width = w + "px";
          th.style.minWidth = w + "px";
          th.style.maxWidth = w + "px";
        } else {
          th.style.minWidth = "80px";
          th.style.width = "auto";
        }
        th.style.borderRight = "1px solid var(--border)";
        th.style.borderBottom = "1px solid var(--border)";
        th.style.position = "relative";
        th.style.backgroundColor = "var(--secondary)";
        th.style.color = "var(--secondary-foreground)";
        th.style.fontWeight = "600";
        th.textContent = this.__escapeHtml(headerText);
        th.style.padding = "12px 16px";
        th.style.paddingRight =
          index < this.__headers.length - 1 ? "16px" : "12px";
        th.style.paddingLeft = index === 0 ? "16px" : "16px";
        th.style.verticalAlign = "middle";
        th.style.overflow = "visible";
        th.style.textOverflow = "ellipsis";
        th.style.whiteSpace = "normal";
        th.style.wordWrap = "break-word";

        if (index < this.__headers.length - 1) {
          const resizeHandle = document.createElement("div");
          resizeHandle.className = "table-resize-handle";
          resizeHandle.style.position = "absolute";
          resizeHandle.style.right = "-4px";
          resizeHandle.style.top = "0";
          resizeHandle.style.width = "8px";
          resizeHandle.style.height = "100%";
          resizeHandle.style.cursor = "col-resize";
          resizeHandle.style.zIndex = "10";
          resizeHandle.style.userSelect = "none";
          resizeHandle.setAttribute("data-column-index", String(index));

          resizeHandle.addEventListener("mouseenter", () => {
            if (!this.__isResizing) {
              th.style.borderRight = "2px solid var(--border)";
              resizeHandle.style.backgroundColor = "var(--muted)";
            }
          });
          resizeHandle.addEventListener("mouseleave", () => {
            if (!this.__isResizing) {
              th.style.borderRight = "1px solid var(--border)";
              resizeHandle.style.backgroundColor = "transparent";
            }
          });

          th.appendChild(resizeHandle);
        }

        if (index === this.__headers.length - 1) {
          th.style.borderRight = "none";
        }

        headerRow.appendChild(th);
      });
      this.__theadElement.appendChild(headerRow);
    } else if (this.__theadElement) {
      this.__theadElement.innerHTML = "";
    }

    if (this.__tbodyElement) {
      this.__tbodyElement.innerHTML = "";
      this.__rows.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        const actualIndex = this.__paginationEnabled
          ? (this.__currentPage - 1) * this.__pageSize + rowIndex
          : rowIndex;
        tr.setAttribute("data-row-index", String(actualIndex));
        tr.style.minHeight = "44px";
        tr.style.height = "auto";
        tr.style.cursor = "pointer";
        tr.addEventListener("mouseenter", () => {
          tr.style.backgroundColor = "var(--muted)";
        });
        tr.addEventListener("mouseleave", () => {
          tr.style.backgroundColor = "";
        });

        row.cells.forEach((cell, index) => {
          const td = document.createElement("td");
          td.textContent = this.__escapeHtml(cell.text);
          const cw = this.__columnWidths[index];
          if (cw != null) {
            td.style.width = cw + "px";
            td.style.minWidth = cw + "px";
            td.style.maxWidth = cw + "px";
          } else {
            td.style.minWidth = "80px";
            td.style.width = "auto";
          }
          td.style.borderRight = "1px solid var(--border)";
          td.style.borderBottom = "1px solid var(--border)";
          td.style.backgroundColor = "var(--card)";
          td.style.color = "var(--card-foreground)";
          if (index === row.cells.length - 1) {
            td.style.borderRight = "none";
          }
          td.style.padding = "12px 16px";
          td.style.paddingRight =
            index < row.cells.length - 1 ? "16px" : "12px";
          td.style.paddingLeft = index === 0 ? "16px" : "16px";
          td.style.verticalAlign = "middle";
          td.style.lineHeight = "1.5";
          td.style.wordWrap = "break-word";
          td.style.overflowWrap = "break-word";
          td.style.whiteSpace = "normal";
          td.style.overflow = "visible";
          if (cell.classes) {
            td.className = cell.classes;
          }
          if (cell.align) {
            td.style.textAlign = cell.align;
          }
          tr.appendChild(td);
        });
        this.__tbodyElement!.appendChild(tr);
      });

      if (this.__tbodyElement.parentNode) {
        this.__setupRowClickEvents();
      }

      if (this.__rows.length > 0 && !this.__hasExplicitColumnWidths()) {
        qx.event.Timer.once(() => {
          this.__autoAdjustColumnWidths();
        }, this, 50);
      }
    }

    if (this.__tfootElement) {
      this.__tfootElement.innerHTML = "";
      this.__footerRows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.style.minHeight = "44px";
        tr.style.height = "auto";

        row.cells.forEach((cell, index) => {
          const td = document.createElement("td");
          td.textContent = this.__escapeHtml(cell.text);
          if (!cell.colspan || cell.colspan === 1) {
            const cw = this.__columnWidths[index];
            if (cw != null) {
              td.style.width = cw + "px";
              td.style.minWidth = cw + "px";
              td.style.maxWidth = cw + "px";
            } else {
              td.style.minWidth = "80px";
              td.style.width = "auto";
            }
          }
          td.style.borderRight = "1px solid var(--border)";
          td.style.borderBottom = "1px solid var(--border)";
          if (
            index === row.cells.length - 1 &&
            (!cell.colspan || cell.colspan === 1)
          ) {
            td.style.borderRight = "none";
          }
          td.style.padding = "12px 16px";
          td.style.paddingRight =
            index < row.cells.length - 1 ? "16px" : "12px";
          td.style.paddingLeft = index === 0 ? "16px" : "16px";
          td.style.verticalAlign = "middle";
          td.style.lineHeight = "1.5";
          if (cell.colspan && cell.colspan > 1) {
            td.setAttribute("colspan", String(cell.colspan));
          }
          if (cell.classes) {
            td.className = cell.classes;
          }
          if (cell.align) {
            td.style.textAlign = cell.align;
          }
          tr.appendChild(td);
        });
        this.__tfootElement!.appendChild(tr);
      });

      this.__tfootElement.style.display =
        this.__footerRows.length > 0 ? "" : "none";
    }
  }

  private __setupRowClickEvents(): void {
    if (!this.__tbodyElement) {
      return;
    }

    if (this.__rowClickHandler) {
      this.__tbodyElement.removeEventListener("click", this.__rowClickHandler);
    }

    this.__rowClickHandler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const tr = t.closest("tr");
      if (!tr) {
        return;
      }

      const rowIndex = parseInt(tr.getAttribute("data-row-index") || "", 10);
      const rows = this.__paginationEnabled ? this.__allRows : this.__rows;
      if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= rows.length) {
        return;
      }

      const row = rows[rowIndex];
      this.fireDataEvent("rowClick", {
        rowIndex: rowIndex,
        rowData: row.data || null,
      });
    };

    this.__tbodyElement.addEventListener("click", this.__rowClickHandler);
  }

  private __setupColumnResizing(): void {
    if (!this.__theadElement) {
      return;
    }

    this.__theadElement.addEventListener("mousedown", (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const handle = t.closest(".table-resize-handle");
      if (!handle) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const columnIndex = parseInt(
        handle.getAttribute("data-column-index") || "",
        10,
      );
      if (isNaN(columnIndex)) {
        return;
      }

      const th = handle.closest("th");
      if (!th) {
        return;
      }

      this.__isResizing = true;
      this.__resizeColumnIndex = columnIndex;
      this.__resizeStartX = e.clientX;
      this.__resizeStartWidth = (th as HTMLElement).offsetWidth;

      (th as HTMLElement).style.borderRight = "2px solid var(--border)";
      (handle as HTMLElement).style.backgroundColor = "var(--muted)";
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const mouseMoveHandler = (ev: MouseEvent) => {
        if (!this.__isResizing) {
          return;
        }

        const diff = ev.clientX - (this.__resizeStartX as number);
        const newWidth = Math.max(
          50,
          (this.__resizeStartWidth as number) + diff,
        );

        if (this.__resizeColumnIndex !== null) {
          this.__columnWidths[this.__resizeColumnIndex] = newWidth;
          this.__applyColumnWidth(this.__resizeColumnIndex, newWidth);
        }
      };

      const mouseUpHandler = () => {
        this.__isResizing = false;
        this.__resizeColumnIndex = null;
        this.__resizeStartX = null;
        this.__resizeStartWidth = null;

        (th as HTMLElement).style.borderRight = "1px solid var(--border)";
        (handle as HTMLElement).style.backgroundColor = "transparent";
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });
  }

  private __hasExplicitColumnWidths(): boolean {
    return (
      this.__columnWidths &&
      this.__columnWidths.some(
        (width) => width !== null && width !== undefined,
      )
    );
  }

  private __autoAdjustColumnWidths(): void {
    if (!this.__tableElement || !this.__tbodyElement || this.__rows.length === 0) {
      return;
    }

    const numColumns = this.__headers.length;
    if (numColumns === 0) {
      return;
    }

    const headerRow = this.__theadElement
      ? this.__theadElement.querySelector("tr")
      : null;
    const rows = this.__tbodyElement.querySelectorAll("tr");

    for (let i = 0; i < numColumns; i++) {
      if (this.__columnWidths[i] == null) {
        if (headerRow && headerRow.children[i]) {
          const th = headerRow.children[i] as HTMLElement;
          th.style.width = "";
          th.style.minWidth = "80px";
          th.style.maxWidth = "";
        }

        rows.forEach((tr) => {
          if (tr.children[i]) {
            const td = tr.children[i] as HTMLElement;
            td.style.width = "";
            td.style.minWidth = "80px";
            td.style.maxWidth = "";
          }
        });
      }
    }

    if (this.__tableElement) {
      this.__tableElement.offsetHeight;
    }
  }

  private __applyColumnWidth(columnIndex: number, width: number): void {
    if (!this.__tableElement) {
      return;
    }

    const headerRow = this.__theadElement
      ? this.__theadElement.querySelector("tr")
      : null;
    if (headerRow) {
      const th = headerRow.children[columnIndex] as HTMLElement | undefined;
      if (th) {
        th.style.width = width + "px";
        th.style.minWidth = width + "px";
        th.style.maxWidth = width + "px";
      }
    }

    if (this.__tbodyElement) {
      const rows = this.__tbodyElement.querySelectorAll("tr");
      rows.forEach((tr) => {
        const td = tr.children[columnIndex] as HTMLElement | undefined;
        if (td) {
          td.style.width = width + "px";
          td.style.minWidth = width + "px";
          td.style.maxWidth = width + "px";
        }
      });
    }

    if (this.__tfootElement) {
      const rows = this.__tfootElement.querySelectorAll("tr");
      rows.forEach((tr) => {
        const td = tr.children[columnIndex] as HTMLElement | undefined;
        if (td && !td.hasAttribute("colspan")) {
          td.style.width = width + "px";
          td.style.minWidth = width + "px";
          td.style.maxWidth = width + "px";
        }
      });
    }
  }
}
