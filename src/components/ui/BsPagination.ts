/**
 * Standalone Basecoat-styled pagination (port of new_proj Pagination).
 */
class BsPagination extends qx.ui.core.Widget {
  static events = {
    changePage: "qx.event.type.Data",
  };

  private __html: qx.ui.embed.Html;
  private __paginationId: string;
  private __paginationContainer: HTMLElement | null = null;
  private __paginationPages: HTMLElement | null = null;
  private __paginationPrev: HTMLElement | null = null;
  private __paginationNext: HTMLElement | null = null;
  private __paginationEllipsis: HTMLElement | null = null;
  private __paginationClickHandler: ((e: MouseEvent) => void) | null = null;
  private __currentPage = 1;
  private __totalPages = 0;

  constructor() {
    super();
    this._setLayout(new qx.ui.layout.Canvas());
    this.__paginationId = "pagination-" + this.toHashCode();

    this.__html = new qx.ui.embed.Html(`
      <nav role="navigation" aria-label="pagination" class="pagination-container mx-auto flex w-full justify-center" id="${this.__paginationId}" style="display: flex; flex-shrink: 0; padding: 16px 0; margin-top: 0; border-top: 1px solid var(--border); width: 100%; min-width: 0; overflow: visible;">
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
    `);

    this._add(this.__html, { edge: 0 });
    this.setMinWidth(380);

    this.addListener("dispose", () => {
      if (this.__paginationContainer && this.__paginationClickHandler) {
        this.__paginationContainer.removeEventListener(
          "click",
          this.__paginationClickHandler,
        );
        this.__paginationClickHandler = null;
      }
    });

    this.__html.addListenerOnce("appear", () => {
      const container = this.__html.getContentElement().getDomElement();
      this.__paginationContainer =
        container.querySelector("#" + this.__paginationId) || container;
      this.__paginationPages =
        this.__paginationContainer.querySelector(".pagination-pages");
      this.__paginationPrev =
        this.__paginationContainer.querySelector(".pagination-prev");
      this.__paginationNext =
        this.__paginationContainer.querySelector(".pagination-next");
      this.__paginationEllipsis =
        this.__paginationContainer.querySelector(".pagination-ellipsis");
      this.__updatePagination();
      this.__setupPaginationClickHandlers();
    });
  }

  getCurrentPage(): number {
    return this.__currentPage;
  }

  setCurrentPage(page: number): this {
    const total = this.getTotalPages();
    let next = Math.floor(page);
    if (next < 1) next = 1;
    if (total > 0 && next > total) next = total;
    if (this.__currentPage === next) return this;
    this.__currentPage = next;
    this.__updatePagination();
    this.fireDataEvent("changePage", { page: next });
    return this;
  }

  getTotalPages(): number {
    return this.__totalPages;
  }

  setTotalPages(total: number): this {
    const next = Math.max(0, Math.floor(total));
    if (this.__totalPages === next) {
      this.__updatePagination();
      return this;
    }
    this.__totalPages = next;
    if (this.__currentPage > next && next > 0) {
      this.__currentPage = next;
      this.fireDataEvent("changePage", { page: this.__currentPage });
    } else if (next === 0) {
      this.__currentPage = 1;
    }
    this.__updatePagination();
    return this;
  }

  private __updatePagination(): void {
    if (!this.__paginationContainer) return;

    const totalPages = this.getTotalPages();
    const currentPage = this.getCurrentPage();

    if (this.__paginationPrev) {
      this.__paginationPrev.style.pointerEvents =
        currentPage <= 1 ? "none" : "";
      this.__paginationPrev.style.opacity = currentPage <= 1 ? "0.5" : "1";
    }
    if (this.__paginationNext) {
      this.__paginationNext.style.pointerEvents =
        currentPage >= totalPages || totalPages === 0 ? "none" : "";
      this.__paginationNext.style.opacity =
        currentPage >= totalPages || totalPages === 0 ? "0.5" : "1";
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
        if (this.getCurrentPage() > 1) {
          this.setCurrentPage(this.getCurrentPage() - 1);
        }
        return;
      }
      if (target.closest(".pagination-next")) {
        if (this.getCurrentPage() < this.getTotalPages()) {
          this.setCurrentPage(this.getCurrentPage() + 1);
        }
        return;
      }
      const pageBtn = target.closest(".pagination-page-btn") as HTMLElement | null;
      if (pageBtn) {
        const raw = pageBtn.getAttribute("data-page");
        const page = raw ? parseInt(raw, 10) : NaN;
        if (!isNaN(page)) {
          this.setCurrentPage(page);
        }
      }
    };
    this.__paginationContainer.addEventListener(
      "click",
      this.__paginationClickHandler,
    );
  }
}
