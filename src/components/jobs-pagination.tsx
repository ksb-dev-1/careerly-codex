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
}: JobsPaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={!hasPreviousPage}
            className={
              hasPreviousPage ? undefined : "pointer-events-none opacity-50"
            }
            href={hasPreviousPage ? `${basePath}?page=${currentPage - 1}` : "#"}
            tabIndex={hasPreviousPage ? undefined : -1}
          />
        </PaginationItem>

        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={`${basePath}?page=${page}`}
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
            href={hasNextPage ? `${basePath}?page=${currentPage + 1}` : "#"}
            tabIndex={hasNextPage ? undefined : -1}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
