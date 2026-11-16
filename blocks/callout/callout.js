export default function decorate(block) {
  const heading = block.querySelector('h2, h3');
  const link = block.querySelector('a');

  if (heading) {
    heading.classList.add('callout-heading');
  }

  if (link) {
    link.classList.add('callout-button');
  }
}
