import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildGraph,
  buildLanguageAlternates,
  buildShowListingItemListJsonLd,
  buildShowOffers,
  buildShowTicketProductsJsonLd,
  buildTourListingItemListJsonLd,
  buildTourOffers,
  buildTourScheduleProductsJsonLd,
} from '../../src/lib/seo-jsonld.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, './fixtures/jsonld.snapshots.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

const showSample = {
  title: 'Live Green Night',
  ticketClasses: [
    { id: 101, name: 'Standard', price: 350000, availableCount: 12 },
    { id: 102, name: 'VIP', price: 950000, availableCount: 0 },
  ],
};

const tourSample = {
  title: 'Da Lat Eco Tour',
  schedules: [
    {
      id: 301,
      startDate: '2026-07-01T00:00:00.000Z',
      price: 2500000,
      capacity: 30,
      bookedCount: 10,
      status: 'OPEN',
    },
    {
      id: 302,
      startDate: '2026-08-10T00:00:00.000Z',
      price: 2700000,
      capacity: 20,
      bookedCount: 20,
      status: 'OPEN',
    },
  ],
};

const showListingSample = [
  { slug: 'show-1', title: 'Show 1' },
  { slug: 'show-2', title: 'Show 2' },
];

const tourListingSample = [
  { slug: 'tour-1', title: 'Tour 1' },
  { slug: 'tour-2', title: 'Tour 2' },
];

test('hreflang alternates snapshot', () => {
  const alternatesDefault = buildLanguageAlternates('/shows/sample-show', 'https://maichohanhtinhxanh.com', false);
  const alternatesEnglish = buildLanguageAlternates('/shows/sample-show', 'https://maichohanhtinhxanh.com', true);

  assert.deepEqual(alternatesDefault, snapshot.alternatesDefault);
  assert.deepEqual(alternatesEnglish, snapshot.alternatesEnglish);
});

test('show json-ld offers and product snapshots', () => {
  const offers = buildShowOffers(showSample.ticketClasses, true, 'live-green-night');
  const products = buildShowTicketProductsJsonLd(showSample, 'live-green-night', true);

  assert.equal(offers.length, snapshot.showOffersCount);
  assert.equal(products['@type'], snapshot.showProductsType);
  assert.equal(products.itemListElement.length, showSample.ticketClasses.length);
  assert.equal(products.itemListElement[0].item.offers.priceCurrency, 'VND');
});

test('tour json-ld offers and product snapshots', () => {
  const offers = buildTourOffers(tourSample.schedules, 'da-lat-eco-tour');
  const products = buildTourScheduleProductsJsonLd(tourSample, 'da-lat-eco-tour');

  assert.equal(offers.length, snapshot.tourOffersCount);
  assert.equal(products['@type'], snapshot.tourProductsType);
  assert.equal(products.itemListElement.length, tourSample.schedules.length);
  assert.equal(products.itemListElement[0].item.offers.priceCurrency, 'VND');
});

test('listing ItemList json-ld snapshots', () => {
  const showList = buildShowListingItemListJsonLd(showListingSample, 2, 12);
  const tourList = buildTourListingItemListJsonLd(tourListingSample, 2, 12);

  assert.equal(showList['@type'], snapshot.showListingType);
  assert.equal(tourList['@type'], snapshot.tourListingType);
  assert.equal(showList.itemListElement[0].position, snapshot.listingFirstPosition);
  assert.equal(tourList.itemListElement[0].position, snapshot.listingFirstPosition);
});

test('@graph wrapper snapshot shape', () => {
  const graph = buildGraph([
    buildShowListingItemListJsonLd(showListingSample, 1, 12),
    buildTourListingItemListJsonLd(tourListingSample, 1, 12),
  ]);

  assert.equal(graph['@context'], 'https://schema.org');
  assert.equal(Array.isArray(graph['@graph']), true);
  assert.equal(graph['@graph'].length, 2);
});
