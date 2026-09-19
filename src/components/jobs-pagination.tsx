import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type JobsPaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
};

const MAX_VISIBLE_PAGES = 5;

function getVisiblePages(currentPage: number, totalPages: number) {
  let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));

  const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

  startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
}

export function JobsPagination({
  basePath,
  currentPage,
  totalPages,
  searchParams,
}: JobsPaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  function getPageHref(page: number) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value);
    }

    params.set("page", String(page));

    return `${basePath}?${params.toString()}`;
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={!hasPreviousPage}
            className={
              hasPreviousPage ? undefined : "pointer-events-none opacity-50"
            }
            href={hasPreviousPage ? getPageHref(currentPage - 1) : "#"}
            tabIndex={hasPreviousPage ? undefined : -1}
          />
        </PaginationItem>

        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={getPageHref(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            aria-disabled={!hasNextPage}
            className={
              hasNextPage ? undefined : "pointer-events-none opacity-50"
            }
            href={hasNextPage ? getPageHref(currentPage + 1) : "#"}
            tabIndex={hasNextPage ? undefined : -1}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
