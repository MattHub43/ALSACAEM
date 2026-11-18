/**
 * Content Fragment Display for AEM EDS / XWalk.
 *
 * Phase 1: Validate the authored Content Fragment reference.
 * Phase 2: Render fragment content through a delivery endpoint.
 */

export default function decorate(block) {
  const reference = block.textContent.trim();

  const container = document.createElement('div');
  container.className = 'content-fragment-display-content';

  const heading = document.createElement('h2');
  heading.textContent = 'Content Fragment Display';

  const description = document.createElement('p');

  if (reference) {
    description.textContent = 'Selected Content Fragment:';

    const path = document.createElement('code');
    path.textContent = reference;

    container.append(heading, description, path);
  } else {
    description.textContent = 'Select a Content Fragment in Universal Editor.';
    container.append(heading, description);
  }

  // Temporary diagnostic rendering until delivery is configured.
  block.replaceChildren(container);
}
