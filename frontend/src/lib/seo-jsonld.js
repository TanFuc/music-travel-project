const env = globalThis?.process?.env || {};
const DEFAULT_SITE_URL = (env.NEXT_PUBLIC_SITE_URL || 'https://maichohanhtinhxanh.com').replace(/\/$/, '');
function toAbsoluteUrl(path, siteUrl = DEFAULT_SITE_URL) {
    if (!path) {
        return siteUrl;
    }
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${siteUrl}${normalized}`;
}
export function buildGraph(nodes, context = 'https://schema.org') {
    const graphNodes = Array.isArray(nodes) ? nodes : [nodes];
    return {
        '@context': context,
        '@graph': graphNodes,
    };
}
export function buildLanguageAlternates(pathname, siteUrl, enableEnglish = false) {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const base = siteUrl.replace(/\/$/, '');
    const canonical = `${base}${normalizedPath === '/' ? '' : normalizedPath}`;
    const alternates = {
        canonical: canonical,
        languages: {
            'vi-VN': canonical,
            'x-default': canonical,
        },
    };
    if (enableEnglish) {
        alternates.languages['en-US'] = `${base}/en${normalizedPath === '/' ? '' : normalizedPath}`;
    }
    return alternates;
}
export function buildShowListingItemListJsonLd(shows, currentPage = 1, pageSize = 12) {
    return {
        '@type': 'ItemList',
        name: 'Danh sach show am nhac',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: shows.length,
        itemListElement: shows.map((show, index) => ({
            '@type': 'ListItem',
            position: (currentPage - 1) * pageSize + index + 1,
            url: toAbsoluteUrl(`/shows/${show.slug}`),
            name: show.title,
        })),
    };
}
export function buildTourListingItemListJsonLd(tours, currentPage = 1, pageSize = 12) {
    return {
        '@type': 'ItemList',
        name: 'Danh sach tour du lich',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: tours.length,
        itemListElement: tours.map((tour, index) => ({
            '@type': 'ListItem',
            position: (currentPage - 1) * pageSize + index + 1,
            url: toAbsoluteUrl(`/tours/${tour.slug}`),
            name: tour.title,
        })),
    };
}
export function buildShowOffers(ticketClasses, isBookable, slug) {
    return ticketClasses.map((ticketClass) => ({
        '@type': 'Offer',
        name: ticketClass.name,
        priceCurrency: 'VND',
        price: ticketClass.price,
        availability: isBookable && ticketClass.availableCount > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
        url: toAbsoluteUrl(`/shows/${slug}?ticketClass=${ticketClass.id}`),
    }));
}
export function buildShowTicketProductsJsonLd(show, slug, isBookable) {
    const imageUrl = show.thumbnailUrl || null;
    const description = show.description || `Ve xem show am nhac ${show.title}`;
    return {
        '@type': 'ItemList',
        name: `Hang ve - ${show.title}`,
        itemListElement: show.ticketClasses.map((ticketClass, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: `${show.title} - ${ticketClass.name}`,
                description: `${description} - Hang ve ${ticketClass.name}`,
                category: 'Music Event Ticket',
                brand: {
                    '@type': 'Brand',
                    name: 'Mãi Cho Hành Tinh Xanh',
                },
                ...(imageUrl && {
                    image: {
                        '@type': 'ImageObject',
                        url: imageUrl,
                    },
                }),
                offers: {
                    '@type': 'Offer',
                    name: `Ve ${ticketClass.name} - ${show.title}`,
                    priceCurrency: 'VND',
                    price: ticketClass.price,
                    availability: isBookable && ticketClass.availableCount > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/SoldOut',
                    url: toAbsoluteUrl(`/shows/${slug}?ticketClass=${ticketClass.id}`),
                    seller: {
                        '@type': 'Organization',
                        name: 'Mãi Cho Hành Tinh Xanh',
                    },
                },
            },
        })),
    };
}
export function buildTourOffers(schedules, slug) {
    return schedules
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map((schedule) => {
        const hasSlots = schedule.capacity - schedule.bookedCount > 0;
        return {
            '@type': 'Offer',
            name: `Lich ${new Date(schedule.startDate).toLocaleDateString('vi-VN')}`,
            priceCurrency: 'VND',
            price: schedule.price,
            availability: schedule.status === 'OPEN' && hasSlots
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
            validFrom: schedule.startDate,
            url: toAbsoluteUrl(`/tours/${slug}?schedule=${schedule.id}`),
        };
    });
}
export function buildTourScheduleProductsJsonLd(tour, slug) {
    const schedules = [...tour.schedules].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const imageUrl = tour.thumbnailUrl || null;
    const description = tour.description || `Tour du lich ${tour.title} - Trai nghiem hanh trinh xanh cung Mai Cho Hanh Tinh Xanh`;
    return {
        '@type': 'ItemList',
        name: `Lich khoi hanh - ${tour.title}`,
        itemListElement: schedules.map((schedule, index) => {
            const hasSlots = schedule.capacity - schedule.bookedCount > 0;
            const scheduleDate = new Date(schedule.startDate).toLocaleDateString('vi-VN');
            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Product',
                    name: `${tour.title} - Lich ${scheduleDate}`,
                    description: `${description}. Khoi hanh ngay ${scheduleDate}.`,
                    category: 'Tour Package',
                    brand: {
                        '@type': 'Brand',
                        name: 'Mãi Cho Hành Tinh Xanh',
                    },
                    ...(imageUrl && {
                        image: {
                            '@type': 'ImageObject',
                            url: imageUrl,
                        },
                    }),
                    offers: {
                        '@type': 'Offer',
                        name: `Tour ${tour.title} - Lich ${scheduleDate}`,
                        priceCurrency: 'VND',
                        price: schedule.price,
                        availability: schedule.status === 'OPEN' && hasSlots
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/SoldOut',
                        validFrom: schedule.startDate,
                        url: toAbsoluteUrl(`/tours/${slug}?schedule=${schedule.id}`),
                        seller: {
                            '@type': 'Organization',
                            name: 'Mãi Cho Hành Tinh Xanh',
                        },
                    },
                },
            };
        }),
    };
}
