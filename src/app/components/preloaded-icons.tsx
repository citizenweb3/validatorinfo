import icons from '@/components/icons';

const PreloadedIcons = () => (
  <div className="hidden">
    {Object.values(icons).map((icon) => (
      <link key={icon.src} rel="preload" href={icon.src} as="image" />
    ))}
  </div>
);

export default PreloadedIcons;
