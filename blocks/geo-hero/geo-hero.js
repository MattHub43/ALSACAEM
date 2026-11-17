/**
 * Geo Hero personalization for AEM EDS / XWalk.
 *
 * Each regional variation contains three elements:
 * heading, description, and CTA.
 *
 * Priority:
 * 1. ?geo= URL parameter
 * 2. eds_geo cookie
 * 3. Default
 */

const REGIONS = ['default', 'fl', 'ny', 'tn'];

function normalizeRegion(value) {
  const input = (value || '').trim().toLowerCase();

  const aliases = {
    florida: 'fl',
    virginia: 'fl',
    va: 'fl',
    'new-york': 'ny',
    'new york': 'ny',
    tennessee: 'tn',
  };

  const region = aliases[input] || input;
  return REGIONS.includes(region) ? region : 'default';
}

function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split('; ')
    .find((cookie) => cookie.startsWith(prefix));

  return item ? decodeURIComponent(item.slice(prefix.length)) : '';
}

function requestedRegion() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('geo')) {
    return normalizeRegion(params.get('geo'));
  }

  return normalizeRegion(getCookie('eds_geo'));
}

export default function decorate(block) {
  // XWalk currently renders all fields in one container.
  const content = block.firstElementChild?.firstElementChild;

  if (!content) return;

  const elements = [...content.children];

  // POC model: 3 elements per region.
  const fieldsPerRegion = 3;

  const requested = requestedRegion();
  const regionIndex = REGIONS.indexOf(requested);

  // Validate the flattened structure before filtering.
  if (elements.length !== REGIONS.length * fieldsPerRegion) {
    console.warn(
      'Geo Hero: Unexpected content structure',
      elements.length,
    );
    return;
  }

  const start = regionIndex * fieldsPerRegion;
  const end = start + fieldsPerRegion;

  elements.forEach((element, index) => {
    element.hidden = index < start || index >= end;
  });

  block.dataset.activeGeo = requested;
  block.classList.add('geo-ready');
}
