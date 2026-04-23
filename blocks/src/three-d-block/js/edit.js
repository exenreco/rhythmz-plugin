import initThree from '../libs/asset.mjs';
import Sidebar from './sidebar.mjs';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect, useRef } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';

export default function Edit( props ) {
  const { attributes, setAttributes, clientId} = props;
  const { gltfPath, entryFile, dracoPath} = attributes;
  const dataAttrs = {};
  const containerRef = useRef(null);

  // is this block selected in the editor?
  const isSelected = useSelect(
    (select) => select('core/block-editor').isBlockSelected(clientId),
    [clientId]
  );

  // helper to programmatically select the block (optional)
  const { selectBlock } = useDispatch('core/block-editor');

  if (gltfPath) dataAttrs['data-gltf-path'] = gltfPath;        // prefer dashed form
  if (entryFile) dataAttrs['data-entry-file'] = entryFile;
  if (dracoPath) dataAttrs['data-draco-path'] = dracoPath;

  // build block props for the wrapper so Gutenberg can manage selection/keyboard/etc.
  const blockProps = useBlockProps({
    onClick: (e) => {
      // ensure block selects on click (useful if inner canvas steals events)
      // do not stop propagation — we want native behaviour too
      selectBlock(clientId);
    },
    className: 'threejs-container',
    ...dataAttrs,
  });

  useEffect(() => {
    let instance = null;
    if (containerRef.current) {
      instance = initThree({
        block:      containerRef.current,
        gltfPath:   gltfPath,
        entryFile:  entryFile,
        dracoPath:  dracoPath
      });
    }

    // toggle canvas pointer-events based on selection so clicks can reach the editor
    // (OrbitControls should only be active when selected)
    const canvas = containerRef.current && containerRef.current.querySelector('canvas');
    if (canvas) {
      // when not selected, let clicks pass to parent so the editor can select the block
      canvas.style.pointerEvents = isSelected ? 'auto' : 'none';
    }

    return () => {
      if (instance && typeof instance.cleanup === 'function') {
        instance.cleanup();
      } else if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      // reset pointer-events defensively
      if (canvas) canvas.style.pointerEvents = '';
    };
    // NOTE: effect depends on gltfPath/entryFile and isSelected to toggle pointer-events
  }, [gltfPath, entryFile, dracoPath, isSelected]);

  return (
    <>
      <div {...blockProps} ref={containerRef}></div>
      <Sidebar {...props} />
    </>
  );
}