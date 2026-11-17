/**
 * Geo Hero POC for AEM Edge Delivery Services / XWalk.
 * The XWalk model emits one row per field in this exact order:
 * Default, Florida, New York, Tennessee.
 *
 * Demo priority: ?geo= query parameter, then 'eds_geo' cookie, then default.
 * The cookie can later be set by a trusted Akamai edge rule.
 */
const REGIONS = ['default', 'fl', 'ny', 'tn'];

function normalizeRegion(value) {
  const input = (value || '').trim().toLowerCase();
  const aliases = {
    florida: 'fl',
    'new-york': 'ny',
    'new york': 'ny',
    tennessee: 'tn',
  };
  const region = aliases[input] || input;
  return REGIONS.includes(region) ? region : 'default';
}

function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : '';
}

function requestedRegion() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('geo')) return normalizeRegion(params.get('geo'));
  return normalizeRegion(getCookie('eds_geo'));
}

export default function decorate(block) {
  const rows = [...block.children];
  const requested = requestedRegion();
  const requestedIndex = REGIONS.indexOf(requested);
  const hasContent = (index) => rows[index]?.textContent?.trim();
  const activeIndex = hasContent(requestedIndex) ? requestedIndex : 0;

  rows.forEach((row, index) => {
    row.hidden = index !== activeIndex;
  });

  block.dataset.activeGeo = REGIONS[activeIndex];
  block.classList.add('geo-ready');
}
