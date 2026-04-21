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
    const alternates = {
        canonical: normalizedPath,
        languages: {
            'vi-VN': `${base}${normalizedPath}`,
            'x-default': `${base}${normalizedPath}`,
        },
    };
    if (enableEnglish) {
        alternates.languages['en-US'] = `${base}/en${normalizedPath}`;
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
    return {
        '@type': 'ItemList',
        name: `Hang ve - ${show.title}`,
        itemListElement: show.ticketClasses.map((ticketClass, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: `${show.title} - ${ticketClass.name}`,
                category: 'Music Event Ticket',
                brand: {
                    '@type': 'Brand',
                    name: 'Music Travel',
                },
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'VND',
                    price: ticketClass.price,
                    availability: isBookable && ticketClass.availableCount > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/SoldOut',
                    url: toAbsoluteUrl(`/shows/${slug}?ticketClass=${ticketClass.id}`),
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
    return {
        '@type': 'ItemList',
        name: `Lich khoi hanh - ${tour.title}`,
        itemListElement: schedules.map((schedule, index) => {
            const hasSlots = schedule.capacity - schedule.bookedCount > 0;
            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Product',
                    name: `${tour.title} - Lich ${new Date(schedule.startDate).toLocaleDateString('vi-VN')}`,
                    category: 'Tour Package',
                    brand: {
                        '@type': 'Brand',
                        name: 'Music Travel',
                    },
                    offers: {
                        '@type': 'Offer',
                        priceCurrency: 'VND',
                        price: schedule.price,
                        availability: schedule.status === 'OPEN' && hasSlots
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/SoldOut',
                        validFrom: schedule.startDate,
                        url: toAbsoluteUrl(`/tours/${slug}?schedule=${schedule.id}`),
                    },
                },
            };
        }),
    };
}
