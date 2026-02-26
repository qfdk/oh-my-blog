interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const getPageUrl = (page: number) => {
        return page === 1 ? '/' : `/?page=${page}`;
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = currentPage === i;
            pages.push(
                isActive ? (
                    <span
                        key={`page-${i}`}
                        className="pagination-number active"
                        aria-current="page"
                    >
                        {i}
                    </span>
                ) : (
                    <a
                        key={`page-${i}`}
                        href={getPageUrl(i)}
                        className="pagination-number"
                    >
                        {i}
                    </a>
                )
            );
        }

        if (startPage > 1) {
            if (startPage > 2) {
                pages.unshift(<span key="dots1" className="pagination-dots">...</span>);
            }
            pages.unshift(
                currentPage === 1 ? (
                    <span key="page-1" className="pagination-number active" aria-current="page">1</span>
                ) : (
                    <a key="page-1" href="/" className="pagination-number">1</a>
                )
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="dots2" className="pagination-dots">...</span>);
            }
            pages.push(
                <a key={`page-${totalPages}`} href={getPageUrl(totalPages)} className="pagination-number">
                    {totalPages}
                </a>
            );
        }

        return pages;
    };

    return (
        <div className="pagination" data-pagination>
            {currentPage > 1 && (
                <a href={getPageUrl(currentPage - 1)} className="pagination-nav">
                    ← 上一页
                </a>
            )}

            <div className="pagination-numbers">
                {renderPageNumbers()}
            </div>

            {currentPage < totalPages && (
                <a href={getPageUrl(currentPage + 1)} className="pagination-nav">
                    下一页 →
                </a>
            )}
        </div>
    );
}
