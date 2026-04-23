import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
  const { gltfPath, entryFile, dracoPath } = attributes || {};

  // useBlockProps.save accepts props; React will omit undefined attrs
  const blockProps = useBlockProps.save({
    className: 'threejs-container',
    // use dashed attributes so dataset.gltfPath is available as dataset.gltfPath
    'data-gltf-path': gltfPath || undefined,
    'data-draco-path': dracoPath || undefined,
    'data-entry-file': entryFile || undefined,
  });

  return <div {...blockProps} />;
}