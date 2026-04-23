'use strict';

import metadata from "./block.json";
import { Edit } from "./js/edit.js";
import { Save } from "./js/save.js";
import { Deprecated } from "./js/depreciated.js";
import { registerBlockType } from "@wordpress/blocks";


registerBlockType(metadata.name, {
  ...metadata,
  edit: Edit,
  save: Save,
  deprecated: [...Deprecated],
});
