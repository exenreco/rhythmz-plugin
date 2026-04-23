import Edit from './js/edit.js';
import Save from './js/save.js';
import metadata from './block.json';
import { registerBlockType } from '@wordpress/blocks';


registerBlockType(metadata.name, {
  ...metadata,
  edit: Edit,
  save: Save,
  deprecated: [{
    save: () => (<div className="threejs-container"></div>),
    migrate: (attributes, savedAttributes) => ({ ...attributes })
  }]
});